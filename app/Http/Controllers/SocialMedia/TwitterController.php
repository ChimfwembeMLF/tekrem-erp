<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Services\SocialMedia\TwitterService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class TwitterController extends Controller
{
    protected TwitterService $twitterService;

    public function __construct(TwitterService $twitterService)
    {
        $this->twitterService = $twitterService;
    }

    protected function getCompanyId()
    {
        return currentCompanyId();
    }

    /**
     * Display Twitter dashboard
     */
    public function index(): Response
    {
        $companyId = $this->getCompanyId();
        $tweets = $this->twitterService->getRecentTweets($companyId);
        $stats = $this->twitterService->getStats($companyId);
        return Inertia::render('SocialMedia/Twitter/Index', [
            'tweets' => $tweets,
            'stats' => $stats,
        ]);
    }

    /**
     * Sync Twitter accounts
     */
    public function syncAccounts(Request $request): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $result = $this->twitterService->syncAccounts($companyId);
        return response()->json($result);
    }

    /**
     * Post a new tweet
     */
    public function createTweet(Request $request): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $tweet = $this->twitterService->createTweet(array_merge($request->all(), ['company_id' => $companyId]));
        return response()->json($tweet);
    }

    /**
     * Publish a tweet
     */
    public function publishTweet($tweetId): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $result = $this->twitterService->publishTweet($tweetId, $companyId);
        return response()->json($result);
    }

    /**
     * Get analytics
     */
    public function getAnalytics(): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $analytics = $this->twitterService->getAnalytics($companyId);
        return response()->json($analytics);
    }

    /**
     * Test Twitter connection
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->twitterService->testConnection();
        return response()->json($result);
    }
}
