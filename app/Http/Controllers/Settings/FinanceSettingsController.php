<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\ZraConfiguration;
use App\Models\Finance\MomoTransaction;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\BankReconciliation;
use App\Models\Setting;
use App\Services\MoMo\MomoApiService;
use App\Services\ZRA\ZraApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FinanceSettingsController extends Controller
{
    protected MomoApiService $momoApiService;
    protected ZraApiService $zraApiService;

    public function __construct(MomoApiService $momoApiService, ZraApiService $zraApiService)
    {
        $this->momoApiService = $momoApiService;
        $this->zraApiService = $zraApiService;
    }

    /**
     * Display the finance settings dashboard.
     */
    public function index(): Response
    {
        //$this->authorize('manage-finance-settings');

        $momoProviders = MomoProvider::select([
            'id', 'display_name', 'code', 'is_active', 
            'health_status', 'last_health_check', 'supported_currencies', 'fee_structure'
        ])->get();

        $zraConfiguration = ZraConfiguration::active()->select([
            'id', 'environment', 'taxpayer_tpin', 'taxpayer_name', 
            'is_active', 'health_status', 'last_health_check', 'last_token_refresh'
        ])->first();

        $systemStats = [
            'total_momo_transactions' => MomoTransaction::count(),
            'total_zra_submissions' => ZraSmartInvoice::count(),
            'active_providers' => MomoProvider::where('is_active', true)->count(),
            'pending_reconciliations' => BankReconciliation::where('status', 'pending')->count(),
        ];

        return Inertia::render('Settings/Finance/Index', [
            'momoProviders' => $momoProviders,
            'zraConfiguration' => $zraConfiguration,
            'systemStats' => $systemStats,
        ]);
    }

    /**
     * Display MoMo API configuration page.
     */
    public function momoApiConfiguration(): Response
    {
        //$this->authorize('manage-finance-settings');

        $configuration = [
            'global_timeout' => Setting::get('momo.api.global_timeout', 30),
            'max_retry_attempts' => Setting::get('momo.api.max_retry_attempts', 3),
            'retry_delay_seconds' => Setting::get('momo.api.retry_delay_seconds', 5),
            'enable_request_logging' => Setting::get('momo.api.enable_request_logging', true),
            'enable_response_logging' => Setting::get('momo.api.enable_response_logging', true),
            'log_sensitive_data' => Setting::get('momo.api.log_sensitive_data', false),
            'rate_limit_enabled' => Setting::get('momo.api.rate_limit_enabled', true),
            'rate_limit_requests_per_minute' => Setting::get('momo.api.rate_limit_requests_per_minute', 60),
            'health_check_interval_minutes' => Setting::get('momo.api.health_check_interval_minutes', 15),
            'auto_disable_unhealthy_providers' => Setting::get('momo.api.auto_disable_unhealthy_providers', true),
            'webhook_timeout_seconds' => Setting::get('momo.api.webhook_timeout_seconds', 30),
            'webhook_retry_attempts' => Setting::get('momo.api.webhook_retry_attempts', 3),
            'enable_sandbox_mode' => Setting::get('momo.api.enable_sandbox_mode', false),
            'sandbox_api_base_url' => Setting::get('momo.api.sandbox_api_base_url', ''),
            'production_api_base_url' => Setting::get('momo.api.production_api_base_url', ''),
            'default_currency' => Setting::get('momo.api.default_currency', 'ZMW'),
            'enable_transaction_encryption' => Setting::get('momo.api.enable_transaction_encryption', true),
            'encryption_algorithm' => Setting::get('momo.api.encryption_algorithm', 'AES-256-GCM'),
            'api_version' => Setting::get('momo.api.api_version', 'v1'),
        ];

        return Inertia::render('Settings/Finance/MoMo/ApiConfiguration', [
            'configuration' => $configuration,
            'supportedCurrencies' => ['ZMW', 'ZMW', 'EUR', 'GBP'],
            'encryptionAlgorithms' => ['AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305'],
        ]);
    }

    /**
     * Update MoMo API configuration.
     */
    public function updateMomoApiConfiguration(Request $request): RedirectResponse
    {
        //$this->authorize('manage-finance-settings');
        $companyId = currentCompanyId();
        $validator = Validator::make($request->all(), [
            'global_timeout' => 'required|integer|min:5|max:300',
            'max_retry_attempts' => 'required|integer|min:0|max:10',
            'retry_delay_seconds' => 'required|integer|min:1|max:60',
            'enable_request_logging' => 'boolean',
            'enable_response_logging' => 'boolean',
            'log_sensitive_data' => 'boolean',
            'rate_limit_enabled' => 'boolean',
            'rate_limit_requests_per_minute' => 'required|integer|min:1|max:1000',
            'health_check_interval_minutes' => 'required|integer|min:5|max:1440',
            'auto_disable_unhealthy_providers' => 'boolean',
            'webhook_timeout_seconds' => 'required|integer|min:5|max:300',
            'webhook_retry_attempts' => 'required|integer|min:0|max:10',
            'enable_sandbox_mode' => 'boolean',
            'sandbox_api_base_url' => 'nullable|url',
            'production_api_base_url' => 'nullable|url',
            'default_currency' => 'required|string|size:3',
            'enable_transaction_encryption' => 'boolean',
            'encryption_algorithm' => 'required|string',
            'api_version' => 'required|string',
        ]);
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        $validated = $validator->validated();
        // Save all settings with momo.api prefix per company
        foreach ($validated as $key => $value) {
            Setting::setForCompany($companyId, "momo.api.{$key}", $value);
        }
        // Clear relevant caches
        // Cache::tags(['momo', 'api-config']);
        return redirect()->back()->with('success', 'MoMo API configuration updated successfully');
    }

    /**
     * Test MoMo API connection.
     */
    public function testMomoApiConnection(Request $request): JsonResponse
    {
        //$this->authorize('manage-finance-settings');

        try {
            // Test connection with active providers
            $activeProviders = MomoProvider::where('is_active', true)->get();
            
            if ($activeProviders->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active MoMo providers configured'
                ]);
            }

            $results = [];
            foreach ($activeProviders as $provider) {
                $healthCheck = $this->momoApiService->testProviderConnection($provider);
                $results[] = [
                    'provider' => $provider->display_name,
                    'success' => $healthCheck['success'],
                    'message' => $healthCheck['message'] ?? null,
                    'response_time' => $healthCheck['response_time'] ?? null,
                ];
            }

            $allSuccessful = collect($results)->every('success');

            return response()->json([
                'success' => $allSuccessful,
                'message' => $allSuccessful 
                    ? 'All provider connections successful' 
                    : 'Some provider connections failed',
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display ZRA taxpayer information page.
     */
    public function zraTaxpayerInformation(): Response
    {
        //$this->authorize('manage-finance-settings');

        $zraConfig = ZraConfiguration::active()->first();
        
        $taxpayerInfo = [
            'taxpayer_tpin' => $zraConfig->taxpayer_tpin ?? '',
            'taxpayer_name' => $zraConfig->taxpayer_name ?? '',
            'taxpayer_address' => $zraConfig->taxpayer_address ?? '',
            'taxpayer_phone' => $zraConfig->taxpayer_phone ?? '',
            'taxpayer_email' => $zraConfig->taxpayer_email ?? '',
            'business_registration_number' => Setting::get('zra.taxpayer.business_registration_number', ''),
            'business_type' => Setting::get('zra.taxpayer.business_type', ''),
            'vat_registration_number' => Setting::get('zra.taxpayer.vat_registration_number', ''),
            'tax_office' => Setting::get('zra.taxpayer.tax_office', ''),
            'registration_date' => Setting::get('zra.taxpayer.registration_date', ''),
            'business_description' => Setting::get('zra.taxpayer.business_description', ''),
            'contact_person_name' => Setting::get('zra.taxpayer.contact_person_name', ''),
            'contact_person_phone' => Setting::get('zra.taxpayer.contact_person_phone', ''),
            'contact_person_email' => Setting::get('zra.taxpayer.contact_person_email', ''),
            'postal_address' => Setting::get('zra.taxpayer.postal_address', ''),
            'physical_address' => Setting::get('zra.taxpayer.physical_address', ''),
            'website' => Setting::get('zra.taxpayer.website', ''),
            'bank_account_number' => Setting::get('zra.taxpayer.bank_account_number', ''),
            'bank_name' => Setting::get('zra.taxpayer.bank_name', ''),
            'bank_branch' => Setting::get('zra.taxpayer.bank_branch', ''),
            'is_vat_registered' => Setting::get('zra.taxpayer.is_vat_registered', false),
            'is_active_taxpayer' => Setting::get('zra.taxpayer.is_active_taxpayer', true),
        ];

        return Inertia::render('Settings/Finance/ZRA/TaxpayerInformation', [
            'taxpayerInfo' => $taxpayerInfo,
            'businessTypes' => [
                'Sole Proprietorship',
                'Partnership',
                'Private Limited Company',
                'Public Limited Company',
                'Non-Profit Organization',
                'Government Entity',
                'Other'
            ],
            'taxOffices' => [
                'Lusaka Main',
                'Lusaka East',
                'Lusaka West',
                'Kitwe',
                'Ndola',
                'Livingstone',
                'Chipata',
                'Kasama',
                'Solwezi',
                'Mongu'
            ],
        ]);
    }

    /**
     * Update ZRA taxpayer information.
     */
    public function updateZraTaxpayerInformation(Request $request): RedirectResponse
    {
        //$this->authorize('manage-finance-settings');
        $companyId = currentCompanyId();
        $validator = Validator::make($request->all(), [
            'taxpayer_tpin' => 'required|string|size:10',
            'taxpayer_name' => 'required|string|max:255',
            'taxpayer_phone' => 'required|string|max:20',
            'taxpayer_email' => 'required|email|max:255',
            'business_registration_number' => 'nullable|string|max:50',
            'business_type' => 'nullable|string|max:100',
            'vat_registration_number' => 'nullable|string|max:50',
            'tax_office' => 'nullable|string|max:100',
            'registration_date' => 'nullable|date',
            'business_description' => 'nullable|string|max:1000',
            'contact_person_name' => 'nullable|string|max:255',
            'contact_person_phone' => 'nullable|string|max:20',
            'contact_person_email' => 'nullable|email|max:255',
            'postal_address' => 'nullable|string|max:500',
            'physical_address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:100',
            'bank_branch' => 'nullable|string|max:100',
            'is_vat_registered' => 'boolean',
            'is_active_taxpayer' => 'boolean',
        ]);
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        $validated = $validator->validated();
        // Update ZRA configuration with core taxpayer info
        $zraConfig = ZraConfiguration::active()->first();
        if ($zraConfig) {
            $zraConfig->update([
                'taxpayer_tpin' => $validated['taxpayer_tpin'],
                'taxpayer_name' => $validated['taxpayer_name'],
                'taxpayer_address' => $validated['physical_address'] ?? $validated['postal_address'] ?? '',
                'taxpayer_phone' => $validated['taxpayer_phone'],
                'taxpayer_email' => $validated['taxpayer_email'],
            ]);
        }
        // Save extended taxpayer information as settings per company
        $settingsToSave = collect($validated)->except([
            'taxpayer_tpin', 'taxpayer_name', 'taxpayer_phone', 'taxpayer_email'
        ]);
        foreach ($settingsToSave as $key => $value) {
            Setting::setForCompany($companyId, "zra.taxpayer.{$key}", $value);
        }
        // Clear relevant caches
        // Cache::tags(['zra', 'taxpayer']);
        return redirect()->back()->with('success', 'ZRA taxpayer information updated successfully');
    }

    /**
     * Validate TPIN with ZRA.
     */
    public function validateZraTpin(Request $request): JsonResponse
    {
        //$this->authorize('manage-finance-settings');

        $request->validate([
            'tpin' => 'required|string|size:10'
        ]);

        try {
            $result = $this->zraApiService->validateTaxpayer($request->tpin);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'] ?? null,
                'taxpayer_info' => $result['taxpayer_info'] ?? null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'TPIN validation failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show Security & API Management page
     */
    public function securityApiManagement(): Response
    {
        //$this->authorize('manage-finance-settings');

        // Get existing API keys (if ApiKey model exists)
        $apiKeys = collect([]);
        if (class_exists('\App\Models\ApiKey')) {
            $apiKeys = \App\Models\ApiKey::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($key) {
                    return [
                        'id' => $key->id,
                        'name' => $key->name,
                        'key' => $key->key,
                        'permissions' => $key->permissions ?? [],
                        'last_used' => $key->last_used_at,
                        'expires_at' => $key->expires_at,
                        'is_active' => $key->is_active,
                        'created_at' => $key->created_at,
                    ];
                });
        }

        // Get security settings
        $securitySettings = [
            'api_rate_limiting_enabled' => Setting::get('security.api.rate_limiting_enabled', true),
            'api_rate_limit_per_minute' => Setting::get('security.api.rate_limit_per_minute', 100),
            'api_key_expiry_days' => Setting::get('security.api.key_expiry_days', 365),
            'require_api_key_rotation' => Setting::get('security.api.require_key_rotation', true),
            'enable_ip_whitelisting' => Setting::get('security.api.enable_ip_whitelisting', false),
            'allowed_ip_addresses' => Setting::get('security.api.allowed_ip_addresses', []),
            'enable_request_signing' => Setting::get('security.api.enable_request_signing', true),
            'signature_algorithm' => Setting::get('security.api.signature_algorithm', 'HMAC-SHA256'),
            'enable_audit_logging' => Setting::get('security.audit.enable_logging', true),
            'log_retention_days' => Setting::get('security.audit.log_retention_days', 90),
            'enable_encryption_at_rest' => Setting::get('security.encryption.enable_at_rest', true),
            'encryption_key_rotation_days' => Setting::get('security.encryption.key_rotation_days', 90),
            'enable_two_factor_auth' => Setting::get('security.auth.enable_2fa', false),
            'session_timeout_minutes' => Setting::get('security.auth.session_timeout_minutes', 60),
        ];

        $availablePermissions = [
            'momo.read',
            'momo.write',
            'momo.admin',
            'zra.read',
            'zra.write',
            'zra.admin',
            'finance.read',
            'finance.write',
            'finance.admin',
        ];

        $signatureAlgorithms = [
            'HMAC-SHA256',
            'HMAC-SHA512',
            'RSA-SHA256',
            'RSA-SHA512',
        ];

        return Inertia::render('Settings/Finance/Security/ApiManagement', [
            'apiKeys' => $apiKeys,
            'securitySettings' => $securitySettings,
            'availablePermissions' => $availablePermissions,
            'signatureAlgorithms' => $signatureAlgorithms,
        ]);
    }

    /**
     * Update security settings
     */
    public function updateSecuritySettings(Request $request): RedirectResponse
    {
        //$this->authorize('manage-finance-settings');

        $validator = Validator::make($request->all(), [
            'api_rate_limiting_enabled' => 'boolean',
            'api_rate_limit_per_minute' => 'integer|min:1|max:10000',
            'api_key_expiry_days' => 'integer|min:30|max:365',
            'require_api_key_rotation' => 'boolean',
            'enable_ip_whitelisting' => 'boolean',
            'allowed_ip_addresses' => 'array',
            'allowed_ip_addresses.*' => 'ip',
            'enable_request_signing' => 'boolean',
            'signature_algorithm' => 'string|in:HMAC-SHA256,HMAC-SHA512,RSA-SHA256,RSA-SHA512',
            'enable_audit_logging' => 'boolean',
            'log_retention_days' => 'integer|min:30|max:2555',
            'enable_encryption_at_rest' => 'boolean',
            'encryption_key_rotation_days' => 'integer|min:30|max:365',
            'enable_two_factor_auth' => 'boolean',
            'session_timeout_minutes' => 'integer|min:15|max:480',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        // Save security settings
        foreach ($validated as $key => $value) {
            $settingKey = match($key) {
                'api_rate_limiting_enabled', 'api_rate_limit_per_minute', 'api_key_expiry_days', 'require_api_key_rotation' => "security.api.{$key}",
                'enable_ip_whitelisting', 'allowed_ip_addresses', 'enable_request_signing', 'signature_algorithm' => "security.api.{$key}",
                'enable_audit_logging', 'log_retention_days' => "security.audit.{$key}",
                'enable_encryption_at_rest', 'encryption_key_rotation_days' => "security.encryption.{$key}",
                'enable_two_factor_auth', 'session_timeout_minutes' => "security.auth.{$key}",
                default => "security.{$key}",
            };

            Setting::set($settingKey, $value);
        }

        // Clear security-related caches
        // Cache::tags(['security', 'api-config']);

        return redirect()->back()->with('success', 'Security settings updated successfully');
    }

    /**
     * Generate new API key
     */
    public function generateApiKey(Request $request): JsonResponse
    {
        $this->authorize('manage-finance-settings');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'string',
            'expires_at' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check if ApiKey model exists
            if (!class_exists('\App\Models\ApiKey')) {
                return response()->json([
                    'success' => false,
                    'message' => 'API Key model not available',
                ], 500);
            }

            $apiKey = \App\Models\ApiKey::create([
                'user_id' => auth()->id(),
                'name' => $request->name,
                'key' => 'tek_' . Str::random(40),
                'permissions' => $request->permissions ?? [],
                'expires_at' => $request->expires_at,
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'data' => $apiKey,
                'message' => 'API key generated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate API key: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoke API key
     */
    public function revokeApiKey(string $keyId): JsonResponse
    {
        $this->authorize('manage-finance-settings');

        try {
            // Check if ApiKey model exists
            if (!class_exists('\App\Models\ApiKey')) {
                return response()->json([
                    'success' => false,
                    'message' => 'API Key model not available',
                ], 500);
            }

            $apiKey = \App\Models\ApiKey::where('id', $keyId)
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $apiKey->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'API key revoked successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke API key: ' . $e->getMessage(),
            ], 500);
        }
    }
}
