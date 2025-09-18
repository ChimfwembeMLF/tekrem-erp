<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Services\SocialMedia\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppController extends Controller
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    public function index(): Response
    {
        $accounts = $this->whatsAppService->getAccounts();
        $messages = $this->whatsAppService->getRecentMessages();
        $stats = $this->whatsAppService->getStats();
        return Inertia::render('SocialMedia/WhatsApp/Index', [
            'accounts' => $accounts,
            'messages' => $messages,
            'stats' => $stats,
        ]);
    }

    public function syncAccounts(Request $request): JsonResponse
    {
        $result = $this->whatsAppService->syncAccounts();
        return response()->json($result);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $message = $this->whatsAppService->sendMessage($request->all());
        return response()->json($message);
    }

    public function getAnalytics(): JsonResponse
    {
        $analytics = $this->whatsAppService->getAnalytics();
        return response()->json($analytics);
    }

    public function testConnection(): JsonResponse
    {
        $result = $this->whatsAppService->testConnection();
        return response()->json($result);
    }
}
