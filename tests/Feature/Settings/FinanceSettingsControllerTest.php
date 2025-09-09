<?php

namespace Tests\Feature\Settings;

use Tests\TestCase;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class FinanceSettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->adminUser = User::factory()->create();
        Permission::create(['name' => 'manage settings']);
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo('manage settings');
        $this->adminUser->assignRole('admin');
        
        // Create regular user
        $this->regularUser = User::factory()->create();
    }

    /** @test */
    public function admin_can_view_finance_settings_index()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('settings.finance.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Settings/Finance/Index')
                ->has('stats')
                ->has('momoProviders')
                ->has('zraConfiguration')
        );
    }

    /** @test */
    public function non_admin_cannot_access_finance_settings()
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('settings.finance.index'));

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_finance_settings()
    {
        $response = $this->get(route('settings.finance.index'));
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function admin_can_view_momo_api_configuration()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('settings.finance.momo.api-configuration'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Settings/Finance/MoMo/ApiConfiguration')
                ->has('providers')
                ->has('environments')
                ->has('currentSettings')
        );
    }

    /** @test */
    public function admin_can_update_momo_api_configuration()
    {
        $configData = [
            'mtn_api_key' => 'new_mtn_api_key',
            'mtn_api_secret' => 'new_mtn_api_secret',
            'mtn_subscription_key' => 'new_mtn_subscription_key',
            'mtn_environment' => 'production',
            'airtel_api_key' => 'new_airtel_api_key',
            'airtel_api_secret' => 'new_airtel_api_secret',
            'zamtel_api_key' => 'new_zamtel_api_key',
            'zamtel_api_secret' => 'new_zamtel_api_secret',
            'webhook_secret' => 'new_webhook_secret',
            'rate_limit_per_minute' => 100,
            'request_timeout' => 30,
            'enable_logging' => true,
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('settings.finance.momo.api-configuration'), $configData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify settings were saved
        $this->assertEquals('new_mtn_api_key', Setting::get('momo.mtn.api_key'));
        $this->assertEquals('production', Setting::get('momo.mtn.environment'));
        $this->assertEquals(100, Setting::get('momo.api.rate_limit_per_minute'));
    }

    /** @test */
    public function admin_can_test_momo_api_connection()
    {
        // Set up test configuration
        Setting::set('momo.mtn.api_key', 'test_api_key');
        Setting::set('momo.mtn.api_secret', 'test_api_secret');
        Setting::set('momo.mtn.subscription_key', 'test_subscription_key');

        Http::fake([
            '*/collection/token/' => Http::response([
                'access_token' => 'test_access_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ], 200)
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('settings.finance.momo.test-connection'), [
                'provider' => 'mtn'
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /** @test */
    public function admin_can_view_zra_taxpayer_information()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('settings.finance.zra.taxpayer-information'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Settings/Finance/ZRA/TaxpayerInformation')
                ->has('taxpayerInfo')
                ->has('environments')
        );
    }

    /** @test */
    public function admin_can_update_zra_taxpayer_information()
    {
        $taxpayerData = [
            'taxpayer_tpin' => '1234567890',
            'taxpayer_name' => 'Test Company Ltd',
            'business_address' => '123 Business Street',
            'postal_address' => 'P.O. Box 123',
            'phone_number' => '+260971234567',
            'email_address' => 'test@company.com',
            'vat_registered' => true,
            'vat_number' => 'VAT123456789',
            'business_type' => 'Limited Company',
            'api_username' => 'test_api_user',
            'api_password' => 'test_api_password',
            'api_environment' => 'sandbox',
            'api_timeout' => 30,
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('settings.finance.zra.taxpayer-information'), $taxpayerData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify settings were saved
        $this->assertEquals('1234567890', Setting::get('zra.taxpayer.taxpayer_tpin'));
        $this->assertEquals('Test Company Ltd', Setting::get('zra.taxpayer.taxpayer_name'));
        $this->assertEquals('sandbox', Setting::get('zra.api.environment'));
    }

    /** @test */
    public function admin_can_validate_zra_tpin()
    {
        Setting::set('zra.api.username', 'test_user');
        Setting::set('zra.api.password', 'test_password');
        Setting::set('zra.api.base_url', 'https://api.sandbox.zra.zm');

        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/taxpayers/validate/1234567890' => Http::response([
                'success' => true,
                'valid' => true,
                'taxpayer_info' => [
                    'tpin' => '1234567890',
                    'name' => 'Valid Company Ltd',
                    'registration_status' => 'active'
                ]
            ], 200)
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('settings.finance.zra.validate-tpin'), [
                'tpin' => '1234567890'
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonPath('taxpayer_info.valid', true);
    }

    /** @test */
    public function admin_can_view_security_api_management()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('settings.finance.security.api-management'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Settings/Finance/Security/ApiManagement')
                ->has('apiKeys')
                ->has('securitySettings')
                ->has('auditLogs')
        );
    }

    /** @test */
    public function admin_can_update_security_settings()
    {
        $securityData = [
            'api_rate_limiting_enabled' => true,
            'api_rate_limit_per_minute' => 120,
            'ip_whitelist_enabled' => true,
            'allowed_ip_addresses' => ['192.168.1.1', '10.0.0.1'],
            'request_signing_enabled' => true,
            'encryption_enabled' => true,
            'audit_logging_enabled' => true,
            'session_timeout_minutes' => 60,
            'max_failed_attempts' => 5,
            'lockout_duration_minutes' => 30,
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('settings.finance.security.update'), $securityData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify settings were saved
        $this->assertTrue(Setting::get('finance.security.api_rate_limiting_enabled'));
        $this->assertEquals(120, Setting::get('finance.security.api_rate_limit_per_minute'));
        $this->assertTrue(Setting::get('finance.security.ip_whitelist_enabled'));
    }

    /** @test */
    public function admin_can_generate_api_key()
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('settings.finance.security.generate-api-key'), [
                'name' => 'Test API Key',
                'permissions' => ['momo:read', 'momo:write', 'zra:read'],
                'expires_at' => now()->addMonths(6)->format('Y-m-d'),
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'api_key',
            'key_id',
            'message'
        ]);

        // Verify API key was saved in settings
        $apiKeys = Setting::get('finance.security.api_keys', []);
        $this->assertCount(1, $apiKeys);
        $this->assertEquals('Test API Key', $apiKeys[0]['name']);
    }

    /** @test */
    public function admin_can_revoke_api_key()
    {
        // First create an API key
        $apiKey = [
            'id' => 'test_key_id',
            'name' => 'Test API Key',
            'key' => 'test_api_key_hash',
            'permissions' => ['momo:read'],
            'created_at' => now()->toISOString(),
            'expires_at' => now()->addMonths(6)->toISOString(),
            'is_active' => true,
        ];

        Setting::set('finance.security.api_keys', [$apiKey]);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('settings.finance.security.revoke-api-key'), [
                'key_id' => 'test_key_id'
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Verify API key was deactivated
        $apiKeys = Setting::get('finance.security.api_keys', []);
        $this->assertFalse($apiKeys[0]['is_active']);
    }

    /** @test */
    public function validates_momo_configuration_data()
    {
        $invalidData = [
            'mtn_api_key' => '', // Required field
            'rate_limit_per_minute' => -1, // Invalid value
            'request_timeout' => 'invalid', // Invalid type
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('settings.finance.momo.api-configuration'), $invalidData);

        $response->assertSessionHasErrors([
            'mtn_api_key',
            'rate_limit_per_minute',
            'request_timeout'
        ]);
    }

    /** @test */
    public function validates_zra_taxpayer_data()
    {
        $invalidData = [
            'taxpayer_tpin' => '123', // Invalid TPIN format
            'taxpayer_name' => '', // Required field
            'email_address' => 'invalid-email', // Invalid email
            'phone_number' => '123', // Invalid phone format
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('settings.finance.zra.taxpayer-information'), $invalidData);

        $response->assertSessionHasErrors([
            'taxpayer_tpin',
            'taxpayer_name',
            'email_address',
            'phone_number'
        ]);
    }

    /** @test */
    public function validates_security_settings_data()
    {
        $invalidData = [
            'api_rate_limit_per_minute' => -1, // Invalid value
            'allowed_ip_addresses' => ['invalid-ip'], // Invalid IP format
            'session_timeout_minutes' => 'invalid', // Invalid type
            'max_failed_attempts' => 0, // Invalid value
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('settings.finance.security.update'), $invalidData);

        $response->assertSessionHasErrors([
            'api_rate_limit_per_minute',
            'allowed_ip_addresses.0',
            'session_timeout_minutes',
            'max_failed_attempts'
        ]);
    }

    /** @test */
    public function handles_api_connection_test_failures()
    {
        Setting::set('momo.mtn.api_key', 'invalid_key');

        Http::fake([
            '*/collection/token/' => Http::response([
                'error' => 'invalid_credentials'
            ], 401)
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('settings.finance.momo.test-connection'), [
                'provider' => 'mtn'
            ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /** @test */
    public function handles_zra_tpin_validation_failures()
    {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/taxpayers/validate/9999999999' => Http::response([
                'success' => false,
                'valid' => false,
                'message' => 'TPIN not found'
            ], 404)
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('settings.finance.zra.validate-tpin'), [
                'tpin' => '9999999999'
            ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /** @test */
    public function encrypts_sensitive_configuration_data()
    {
        $configData = [
            'mtn_api_secret' => 'sensitive_secret',
            'mtn_subscription_key' => 'sensitive_key',
        ];

        $this->actingAs($this->adminUser)
            ->put(route('settings.finance.momo.api-configuration'), $configData);

        // Verify that sensitive data is encrypted in storage
        $storedSecret = Setting::getRaw('momo.mtn.api_secret');
        $storedKey = Setting::getRaw('momo.mtn.subscription_key');

        $this->assertNotEquals('sensitive_secret', $storedSecret);
        $this->assertNotEquals('sensitive_key', $storedKey);

        // But can be decrypted when retrieved
        $this->assertEquals('sensitive_secret', Setting::get('momo.mtn.api_secret'));
        $this->assertEquals('sensitive_key', Setting::get('momo.mtn.subscription_key'));
    }
}
