<?php

namespace Tests\Feature\Services\ZRA;

use App\Models\Finance\ZraConfiguration;
use App\Services\ZRA\ZraApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ZraApiServiceTest extends TestCase
{
    use RefreshDatabase;

    private ZraApiService $service;
    private ZraConfiguration $config;

    protected function setUp(): void
    {
        parent::setUp();

        $this->config = ZraConfiguration::factory()->create([
            'is_active' => true,
            'environment' => 'sandbox',
            'api_url' => 'https://api.sandbox.zra.zm',
            'client_id' => 'test_client_id',
            'client_secret' => 'test_client_secret',
            'api_key' => 'test_api_key',
            'access_token' => 'test_access_token',
            'token_expires_at' => now()->addHour(),
        ]);

        $this->service = new ZraApiService();
    }

    public function test_can_authenticate_and_get_access_token()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/oauth/token' => Http::response([
                'access_token' => 'new_access_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600,
            ], 200),
        ]);

        $token = $this->service->authenticate();

        $this->assertEquals('new_access_token', $token);
        
        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.sandbox.zra.zm/oauth/token' &&
                   $request->method() === 'POST' &&
                   $request->data()['grant_type'] === 'client_credentials';
        });
    }

    public function test_can_submit_invoice()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/invoices/submit' => Http::response([
                'status' => 'submitted',
                'reference' => 'ZRA123456789',
                'submission_id' => 'sub_123456',
                'message' => 'Invoice submitted successfully',
            ], 201),
        ]);

        $invoiceData = [
            'invoice_number' => 'INV-001',
            'invoice_date' => '2024-01-15',
            'total' => 1000.00,
            'currency' => 'ZMW',
            'customer' => [
                'name' => 'Test Customer',
                'tax_number' => '1234567890',
            ],
        ];

        $response = $this->service->submitInvoice($invoiceData);

        $this->assertEquals('submitted', $response['status']);
        $this->assertEquals('ZRA123456789', $response['reference']);
        
        Http::assertSent(function (Request $request) use ($invoiceData) {
            return $request->url() === 'https://api.sandbox.zra.zm/api/v1/invoices/submit' &&
                   $request->method() === 'POST' &&
                   $request->data() === $invoiceData;
        });
    }

    public function test_can_check_invoice_status()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/invoices/status' => Http::response([
                'status' => 'approved',
                'reference' => 'ZRA123456789',
                'verification_url' => 'https://verify.zra.zm/invoice/123',
                'qr_code' => 'base64_qr_code_data',
            ], 200),
        ]);

        $response = $this->service->checkInvoiceStatus('ZRA123456789');

        $this->assertEquals('approved', $response['status']);
        $this->assertEquals('ZRA123456789', $response['reference']);
        
        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.sandbox.zra.zm/api/v1/invoices/status?reference=ZRA123456789' &&
                   $request->method() === 'GET';
        });
    }

    public function test_can_cancel_invoice()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/invoices/cancel' => Http::response([
                'status' => 'cancelled',
                'reference' => 'ZRA123456789',
                'message' => 'Invoice cancelled successfully',
            ], 200),
        ]);

        $response = $this->service->cancelInvoice('ZRA123456789', 'User requested cancellation');

        $this->assertEquals('cancelled', $response['status']);
        $this->assertEquals('ZRA123456789', $response['reference']);
        
        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.sandbox.zra.zm/api/v1/invoices/cancel' &&
                   $request->method() === 'POST' &&
                   $request->data()['reference'] === 'ZRA123456789' &&
                   $request->data()['reason'] === 'User requested cancellation';
        });
    }

    public function test_can_validate_invoice()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/invoices/validate' => Http::response([
                'valid' => true,
                'errors' => [],
                'warnings' => [],
            ], 200),
        ]);

        $invoiceData = [
            'invoice_number' => 'INV-001',
            'total' => 1000.00,
        ];

        $response = $this->service->validateInvoice($invoiceData);

        $this->assertTrue($response['valid']);
        $this->assertEmpty($response['errors']);
        
        Http::assertSent(function (Request $request) use ($invoiceData) {
            return $request->url() === 'https://api.sandbox.zra.zm/api/v1/invoices/validate' &&
                   $request->method() === 'POST' &&
                   $request->data() === $invoiceData;
        });
    }

    public function test_can_get_tax_rates()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/tax-rates' => Http::response([
                'rates' => [
                    ['type' => 'VAT', 'rate' => 16.0],
                    ['type' => 'Excise', 'rate' => 10.0],
                ],
            ], 200),
        ]);

        $response = $this->service->getTaxRates();

        $this->assertCount(2, $response['rates']);
        $this->assertEquals(16.0, $response['rates'][0]['rate']);
        
        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.sandbox.zra.zm/api/v1/tax-rates' &&
                   $request->method() === 'GET';
        });
    }

    public function test_can_perform_health_check()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/health' => Http::response([
                'status' => 'healthy',
                'timestamp' => now()->toISOString(),
                'response_time' => 150,
            ], 200),
        ]);

        $response = $this->service->healthCheck();

        $this->assertEquals('healthy', $response['status']);
        $this->assertArrayHasKey('response_time', $response);
        
        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.sandbox.zra.zm/api/v1/health' &&
                   $request->method() === 'GET';
        });
    }

    public function test_handles_authentication_failure()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/oauth/token' => Http::response([
                'error' => 'invalid_client',
                'error_description' => 'Invalid client credentials',
            ], 401),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Authentication failed');

        $this->service->authenticate();
    }

    public function test_handles_api_errors()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/invoices/submit' => Http::response([
                'error' => 'validation_failed',
                'message' => 'Invoice validation failed',
                'errors' => ['Invoice number is required'],
            ], 422),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Invoice validation failed');

        $this->service->submitInvoice([]);
    }

    public function test_handles_network_timeout()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/invoices/submit' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection timeout');
            },
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Network error');

        $this->service->submitInvoice([]);
    }

    public function test_automatically_refreshes_expired_token()
    {
        // Set token as expired
        $this->config->update([
            'token_expires_at' => now()->subHour(),
        ]);

        Http::fake([
            'https://api.sandbox.zra.zm/oauth/token' => Http::response([
                'access_token' => 'refreshed_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600,
            ], 200),
            'https://api.sandbox.zra.zm/api/v1/health' => Http::response([
                'status' => 'healthy',
            ], 200),
        ]);

        $response = $this->service->healthCheck();

        $this->assertEquals('healthy', $response['status']);
        
        // Verify token was refreshed
        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.sandbox.zra.zm/oauth/token';
        });
    }

    public function test_includes_correlation_id_in_requests()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/health' => Http::response([
                'status' => 'healthy',
            ], 200),
        ]);

        $this->service->healthCheck();

        Http::assertSent(function (Request $request) {
            return $request->hasHeader('X-Correlation-ID');
        });
    }

    public function test_respects_rate_limiting()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/health' => Http::response([
                'error' => 'rate_limit_exceeded',
                'message' => 'Rate limit exceeded',
            ], 429),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Rate limit exceeded');

        $this->service->healthCheck();
    }

    public function test_updates_configuration_health_status()
    {
        Http::fake([
            'https://api.sandbox.zra.zm/api/v1/health' => Http::response([
                'status' => 'healthy',
                'response_time' => 150,
            ], 200),
        ]);

        $this->service->healthCheck();

        $this->config->refresh();
        $this->assertTrue($this->config->is_healthy);
        $this->assertNotNull($this->config->last_health_check);
    }
}
