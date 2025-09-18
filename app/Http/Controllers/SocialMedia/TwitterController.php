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

    /**
     * Display Twitter dashboard
     */
    public function index(): Response
    {
        $tweets = $this->twitterService->getRecentTweets();
        $stats = $this->twitterService->getStats();
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
        $result = $this->twitterService->syncAccounts();
        return response()->json($result);
    }

    /**
     * Post a new tweet
     */
    public function createTweet(Request $request): JsonResponse
    {
        $tweet = $this->twitterService->createTweet($request->all());
        return response()->json($tweet);
    }

    /**
     * Publish a tweet
     */
    public function publishTweet($tweetId): JsonResponse
    {
        $result = $this->twitterService->publishTweet($tweetId);
        return response()->json($result);
    }

    /**
     * Get analytics
     */
    public function getAnalytics(): JsonResponse
    {
        $analytics = $this->twitterService->getAnalytics();
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
