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

    protected function getCompanyId()
    {
        return currentCompanyId();
    }

    public function index(): Response
    {
        $companyId = $this->getCompanyId();
        $accounts = $this->whatsAppService->getAccounts($companyId);
        $messages = $this->whatsAppService->getRecentMessages($companyId);
        $stats = $this->whatsAppService->getStats($companyId);
        return Inertia::render('SocialMedia/WhatsApp/Index', [
            'accounts' => $accounts,
            'messages' => $messages,
            'stats' => $stats,
        ]);
    }

    public function syncAccounts(Request $request): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $result = $this->whatsAppService->syncAccounts($companyId);
        return response()->json($result);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $message = $this->whatsAppService->sendMessage(array_merge($request->all(), ['company_id' => $companyId]));
        return response()->json($message);
    }

    public function getAnalytics(): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $analytics = $this->whatsAppService->getAnalytics($companyId);
        return response()->json($analytics);
    }

    public function testConnection(): JsonResponse
    {
        $companyId = $this->getCompanyId();
        $result = $this->whatsAppService->testConnection($companyId);
        return response()->json($result);
    }
}
