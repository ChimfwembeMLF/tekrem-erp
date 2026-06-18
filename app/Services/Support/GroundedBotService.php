<?php

namespace App\Services\Support;

use App\Models\Setting;
use App\Models\Support\BotKnowledgeEntry;
use App\Models\Support\FAQ;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\TicketComment;
use App\Services\AIService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GroundedBotService
{
    public function __construct(
        private AIService $aiService,
    ) {}

    /**
     * Generate a grounded response for guest or support bots using configured AI + knowledge base only.
     */
    public function respond(
        string $userMessage,
        array $conversationHistory = [],
        string $botName = 'Support Assistant',
    ): ?array {
        if (!$this->aiService->isAnyServiceConfigured()) {
            Log::warning('No AI service is configured for grounded bot responses');

            return null;
        }

        $chunks = $this->retrieveContext($userMessage);
        $systemPrompt = $this->buildSystemPrompt($botName, $chunks);
        $messages = $this->formatHistoryMessages($conversationHistory);
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $response = $this->aiService->chat($systemPrompt, $messages, [
            'temperature' => 0.2,
            'max_tokens' => 600,
        ]);

        if (!$response) {
            return null;
        }

        return [
            'message' => trim($response['message']),
            'service' => $response['service'],
            'model' => $response['model'],
            'grounded' => true,
            'context_count' => $chunks->count(),
        ];
    }

    public function retrieveContext(string $query, int $limit = 12): Collection
    {
        $keywords = $this->extractKeywords($query);
        $candidates = collect();

        $candidates = $candidates->merge($this->companyContextChunks());
        $candidates = $candidates->merge($this->faqChunks($keywords));
        $candidates = $candidates->merge($this->articleChunks($keywords));
        $candidates = $candidates->merge($this->entryChunks($keywords));
        $candidates = $candidates->merge($this->resolutionChunks($keywords));

        return $candidates
            ->unique(fn (array $chunk) => $chunk['source'] . ':' . $chunk['title'])
            ->sortByDesc('score')
            ->take($limit)
            ->values();
    }

    private function buildSystemPrompt(string $botName, Collection $chunks): string
    {
        $companyName = Setting::get('support.bot.company_name', Setting::get('app.name', 'Our company'));

        $knowledge = $chunks->isEmpty()
            ? '(No knowledge base content is available yet.)'
            : $chunks->map(function (array $chunk, int $index) {
                $num = $index + 1;
                $body = Str::limit(strip_tags($chunk['content']), 1200, '…');

                return "[{$num}] ({$chunk['type']}) {$chunk['title']}\n{$body}";
            })->implode("\n\n");

        return <<<PROMPT
You are {$botName} for {$companyName}.

STRICT RULES — you must follow all of these:
1. Answer ONLY using facts from the KNOWLEDGE BASE below. Never use outside knowledge, training data, or assumptions.
2. If the knowledge base does not contain enough information to answer, reply exactly with this pattern: "I don't have that in our knowledge base yet. I can connect you with our team or help you create a support ticket."
3. Do not invent pricing, policies, features, timelines, contact details, or troubleshooting steps.
4. Stay within company/product/support scope. Decline unrelated topics (general knowledge, news, coding help, etc.).
5. Be concise: 1–3 short sentences unless step-by-step instructions are clearly provided in the knowledge base.
6. Use GitHub-flavored Markdown when listing steps. No greetings or filler phrases.

KNOWLEDGE BASE:
{$knowledge}
PROMPT;
    }

    private function companyContextChunks(): Collection
    {
        $chunks = collect();

        $companyInfo = trim((string) Setting::get('support.bot.company_info', ''));
        if ($companyInfo !== '') {
            $chunks->push([
                'title' => 'Company information',
                'content' => $companyInfo,
                'type' => 'company',
                'source' => 'setting:company_info',
                'score' => 100,
            ]);
        }

        BotKnowledgeEntry::published()
            ->where('category', 'company')
            ->orderByDesc('updated_at')
            ->get()
            ->each(function (BotKnowledgeEntry $entry) use ($chunks) {
                $chunks->push([
                    'title' => $entry->title,
                    'content' => $entry->content,
                    'type' => 'company',
                    'source' => 'entry:' . $entry->id,
                    'score' => 95,
                ]);
            });

        return $chunks;
    }

    private function faqChunks(array $keywords): Collection
    {
        $query = FAQ::published();

        if (!empty($keywords)) {
            $query->where(function ($builder) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $builder->orWhere('question', 'like', "%{$keyword}%")
                        ->orWhere('answer', 'like', "%{$keyword}%");
                }
            });
        }

        return $query->limit(8)->get()->map(fn (FAQ $faq) => [
            'title' => $faq->question,
            'content' => $faq->answer,
            'type' => 'faq',
            'source' => 'faq:' . $faq->id,
            'score' => $this->scoreText($faq->question . ' ' . $faq->answer, $keywords) + 10,
        ]);
    }

    private function articleChunks(array $keywords): Collection
    {
        $query = KnowledgeBaseArticle::published();

        if (!empty($keywords)) {
            $query->where(function ($builder) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $builder->orWhere('title', 'like', "%{$keyword}%")
                        ->orWhere('content', 'like', "%{$keyword}%")
                        ->orWhere('excerpt', 'like', "%{$keyword}%");
                }
            });
        }

        return $query->limit(6)->get()->map(fn (KnowledgeBaseArticle $article) => [
            'title' => $article->title,
            'content' => $article->excerpt ?: $article->content,
            'type' => 'article',
            'source' => 'article:' . $article->id,
            'score' => $this->scoreText($article->title . ' ' . $article->content, $keywords) + 8,
        ]);
    }

    private function entryChunks(array $keywords): Collection
    {
        $query = BotKnowledgeEntry::published()->where('category', '!=', 'company');

        if (!empty($keywords)) {
            $query->where(function ($builder) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $builder->orWhere('title', 'like', "%{$keyword}%")
                        ->orWhere('content', 'like', "%{$keyword}%");
                }
            });
        }

        return $query->limit(8)->get()->map(fn (BotKnowledgeEntry $entry) => [
            'title' => $entry->title,
            'content' => $entry->content,
            'type' => $entry->category,
            'source' => 'entry:' . $entry->id,
            'score' => $this->scoreText($entry->title . ' ' . $entry->content, $keywords) + 12,
        ]);
    }

    private function resolutionChunks(array $keywords): Collection
    {
        $query = TicketComment::query()
            ->where('is_solution', true)
            ->whereHas('ticket', fn ($q) => $q->whereIn('status', ['resolved', 'closed']))
            ->with('ticket:id,title')
            ->latest()
            ->limit(20);

        if (!empty($keywords)) {
            $query->where(function ($builder) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $builder->orWhere('content', 'like', "%{$keyword}%");
                }
            });
        }

        return $query->get()->map(function (TicketComment $comment) use ($keywords) {
            $title = $comment->ticket?->title ?? 'Resolved ticket';

            return [
                'title' => 'Resolution: ' . $title,
                'content' => $comment->content,
                'type' => 'resolution',
                'source' => 'resolution:' . $comment->id,
                'score' => $this->scoreText($title . ' ' . $comment->content, $keywords) + 6,
            ];
        });
    }

    private function extractKeywords(string $text): array
    {
        $words = preg_split('/\s+/', strtolower($text)) ?: [];

        return collect($words)
            ->map(fn ($word) => preg_replace('/[^a-z0-9]/', '', $word))
            ->filter(fn ($word) => strlen($word) > 2)
            ->unique()
            ->values()
            ->all();
    }

    private function scoreText(string $haystack, array $keywords): int
    {
        if (empty($keywords)) {
            return 1;
        }

        $haystack = strtolower($haystack);
        $score = 0;

        foreach ($keywords as $keyword) {
            if (str_contains($haystack, $keyword)) {
                $score += 3;
            }
        }

        return $score;
    }

    private function formatHistoryMessages(array $history): array
    {
        $messages = [];

        foreach (array_slice($history, -8) as $entry) {
            $content = trim((string) ($entry['message'] ?? ''));
            if ($content === '') {
                continue;
            }

            if (isset($entry['role']) && in_array($entry['role'], ['user', 'assistant'], true)) {
                $messages[] = ['role' => $entry['role'], 'content' => $content];
                continue;
            }

            $role = ($entry['is_ai'] ?? false) ? 'assistant' : 'user';
            if (($entry['is_guest'] ?? true) === false && isset($entry['user_id'])) {
                $role = 'assistant';
            }

            $messages[] = ['role' => $role, 'content' => $content];
        }

        return $messages;
    }
}
