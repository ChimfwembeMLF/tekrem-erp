<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class RecaptchaController extends Controller
{
    /**
     * Display reCAPTCHA settings.
     */
    public function index(): Response
    {
        // $this->authorize('manage-system-settings');

        return Inertia::render('Settings/Recaptcha/Index', [
            'settings' => $this->getRecaptchaSettings(),
        ]);
    }

    /**
     * Update reCAPTCHA settings.
     */
    public function update(Request $request)
    {
        $companyId = $this->getCompanyId();

        // $this->authorize('manage-system-settings');

        $validator = Validator::make($request->all(), [
            'recaptcha_enabled' => 'boolean',
            'recaptcha_site_key' => 'nullable|string|max:255',
            'recaptcha_secret_key' => 'nullable|string|max:255',
            'recaptcha_version' => 'required|string|in:v2,v3',
            'recaptcha_theme' => 'required|string|in:light,dark',
            'recaptcha_size' => 'required|string|in:normal,compact',
            'recaptcha_score_threshold' => 'nullable|numeric|min:0|max:1',
            'recaptcha_on_login' => 'boolean',
            'recaptcha_on_register' => 'boolean',
            'recaptcha_on_forgot_password' => 'boolean',
            'recaptcha_on_contact_form' => 'boolean',
            'recaptcha_on_guest_chat' => 'boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        // Save settings
        Setting::setForCompany($companyId, 'recaptcha_settings', $validated);

        return redirect()->back()->with('success', 'reCAPTCHA settings updated successfully.');
    }

    /**
     * Verify reCAPTCHA token.
     */
    public function verify(Request $request): JsonResponse
    {
        // Skip reCAPTCHA verification in development environment
        if (app()->environment('local', 'development', 'dev')) {
            return response()->json([
                'success' => true,
                'message' => 'reCAPTCHA verification skipped in development environment.',
                'development_mode' => true,
            ]);
        }

        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'action' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid request data.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $token = $request->input('token');
        $action = $request->input('action', 'submit');
        
        $companyId = $this->getCompanyId();
        $secretKey = Setting::getForCompany($companyId, 'recaptcha_secret_key');
        $version = Setting::getForCompany($companyId, 'recaptcha_version', 'v2');
        
        if (!$secretKey) {
            return response()->json([
                'success' => false,
                'message' => 'reCAPTCHA not configured.',
            ], 500);
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $request->ip(),
            ]);

            $result = $response->json();

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'reCAPTCHA verification failed.',
                    'errors' => $result['error-codes'] ?? [],
                ], 422);
            }

            // For reCAPTCHA v3, check score
            if ($version === 'v3') {
                $scoreThreshold = (float) Setting::getForCompany($companyId, 'recaptcha_score_threshold', 0.5);
                $score = $result['score'] ?? 0;

                if ($score < $scoreThreshold) {
                    return response()->json([
                        'success' => false,
                        'message' => 'reCAPTCHA score too low.',
                        'score' => $score,
                        'threshold' => $scoreThreshold,
                    ], 422);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'reCAPTCHA verification successful.',
                'score' => $result['score'] ?? null,
                'action' => $result['action'] ?? null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'reCAPTCHA verification error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test reCAPTCHA configuration.
     */
    public function test(Request $request): JsonResponse
    {
        $this->authorize('manage-system-settings');

        $validator = Validator::make($request->all(), [
            'site_key' => 'required|string',
            'secret_key' => 'required|string',
            'test_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid test data.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $request->input('secret_key'),
                'response' => $request->input('test_token'),
                'remoteip' => $request->ip(),
            ]);

            $result = $response->json();

            return response()->json([
                'success' => $result['success'] ?? false,
                'message' => $result['success'] ? 'reCAPTCHA configuration is valid.' : 'reCAPTCHA configuration test failed.',
                'details' => $result,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'reCAPTCHA test error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get reCAPTCHA settings.
     */
    private function getRecaptchaSettings(): array
    {
        $companyId = $this->getCompanyId();

        return [
            'recaptcha_enabled' => Setting::getForCompany($companyId, 'recaptcha_enabled', false),
            'recaptcha_site_key' => Setting::getForCompany($companyId, 'recaptcha_site_key', ''),
            'recaptcha_secret_key' => Setting::getForCompany($companyId, 'recaptcha_secret_key', ''),
            'recaptcha_version' => Setting::getForCompany($companyId, 'recaptcha_version', 'v2'),
            'recaptcha_theme' => Setting::getForCompany($companyId, 'recaptcha_theme', 'light'),
            'recaptcha_size' => Setting::getForCompany($companyId, 'recaptcha_size', 'normal'),
            'recaptcha_score_threshold' => Setting::getForCompany($companyId, 'recaptcha_score_threshold', 0.5),
            'recaptcha_on_login' => Setting::getForCompany($companyId, 'recaptcha_on_login', true),
            'recaptcha_on_register' => Setting::getForCompany($companyId, 'recaptcha_on_register', true),
            'recaptcha_on_forgot_password' => Setting::getForCompany($companyId, 'recaptcha_on_forgot_password', true),
            'recaptcha_on_contact_form' => Setting::getForCompany($companyId, 'recaptcha_on_contact_form', true),
            'recaptcha_on_guest_chat' => Setting::getForCompany($companyId, 'recaptcha_on_guest_chat', false),
        ];
    }

    protected function getCompanyId()
    {
        return currentCompanyId();
    }
}
