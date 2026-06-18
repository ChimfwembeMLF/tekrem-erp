<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Support\BotKnowledgeEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BotKnowledgeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Support/BotKnowledge/Index', [
            'companyName' => Setting::get('support.bot.company_name', Setting::get('app.name', '')),
            'companyInfo' => Setting::get('support.bot.company_info', ''),
            'guestBotName' => Setting::get('support.bot.guest_name', 'Remy'),
            'supportBotName' => Setting::get('support.bot.support_name', 'Support Assistant'),
            'entries' => BotKnowledgeEntry::query()
                ->latest()
                ->get(['id', 'title', 'content', 'category', 'is_published', 'updated_at']),
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_info' => ['nullable', 'string', 'max:20000'],
            'guest_bot_name' => ['nullable', 'string', 'max:100'],
            'support_bot_name' => ['nullable', 'string', 'max:100'],
        ]);

        Setting::set('support.bot.company_name', $validated['company_name'] ?? '');
        Setting::set('support.bot.company_info', $validated['company_info'] ?? '');
        Setting::set('support.bot.guest_name', $validated['guest_bot_name'] ?? 'Remy');
        Setting::set('support.bot.support_name', $validated['support_bot_name'] ?? 'Support Assistant');

        return back()->with('success', 'Bot settings updated.');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:50000'],
            'category' => ['required', 'in:company,resolution,policy,product,general'],
            'is_published' => ['boolean'],
        ]);

        BotKnowledgeEntry::create([
            ...$validated,
            'is_published' => $validated['is_published'] ?? true,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Knowledge entry added.');
    }

    public function update(Request $request, BotKnowledgeEntry $botKnowledge): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:50000'],
            'category' => ['required', 'in:company,resolution,policy,product,general'],
            'is_published' => ['boolean'],
        ]);

        $botKnowledge->update([
            ...$validated,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Knowledge entry updated.');
    }

    public function destroy(BotKnowledgeEntry $botKnowledge): RedirectResponse
    {
        $botKnowledge->delete();

        return back()->with('success', 'Knowledge entry deleted.');
    }
}
