<?php

namespace Tests\Feature\Services\MoMo;

use Tests\TestCase;
use App\Services\MoMo\MomoApiService;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoTransaction;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MomoApiServiceTest extends TestCase
{
    use RefreshDatabase;

    protected MomoApiService $momoApiService;
    protected MomoProvider $provider;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test provider
        $this->provider = MomoProvider::factory()->create([
            'name' => 'MTN MoMo',
            'code' => 'mtn',
            'is_active' => true,
            'api_base_url' => 'https://sandbox.momodeveloper.mtn.com',
            'api_key' => 'test_api_key',
            'api_secret' => 'test_api_secret',
            'subscription_key' => 'test_subscription_key',
        ]);

        $this->momoApiService = new MomoApiService();
    }

    /** @test */
    public function it_can_authenticate_with_momo_api()
    {
        Http::fake([
            '*/collection/token/' => Http::response([
                'access_token' => 'test_access_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ], 200)
        ]);

        $result = $this->momoApiService->authenticate($this->provider);

        $this->assertTrue($result['success']);
        $this->assertEquals('test_access_token', $result['access_token']);
        $this->assertEquals(3600, $result['expires_in']);
    }

    /** @test */
    public function it_handles_authentication_failure()
    {
        Http::fake([
            '*/collection/token/' => Http::response([
                'error' => 'invalid_credentials',
                'error_description' => 'Invalid API credentials'
            ], 401)
        ]);

        $result = $this->momoApiService->authenticate($this->provider);

        $this->assertFalse($result['success']);
        $this->assertStringContains('Authentication failed', $result['message']);
    }

    /** @test */
    public function it_can_initiate_payment_request()
    {
        // Mock authentication
        Http::fake([
            '*/collection/token/' => Http::response([
                'access_token' => 'test_access_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ], 200),
            '*/collection/v1_0/requesttopay' => Http::response([
                'status' => 'PENDING'
            ], 202)
        ]);

        $paymentData = [
            'amount' => '100.00',
            'currency' => 'ZMW',
            'external_id' => 'test_payment_123',
            'payer' => [
                'party_id_type' => 'MSISDN',
                'party_id' => '260971234567'
            ],
            'payer_message' => 'Test payment',
            'payee_note' => 'Payment for services'
        ];

        $result = $this->momoApiService->requestPayment($this->provider, $paymentData);

        $this->assertTrue($result['success']);
        $this->assertEquals('PENDING', $result['status']);
    }

    /** @test */
    public function it_can_check_payment_status()
    {
        Http::fake([
            '*/collection/token/' => Http::response([
                'access_token' => 'test_access_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ], 200),
            '*/collection/v1_0/requesttopay/*' => Http::response([
                'financial_transaction_id' => 'ft_123456',
                'external_id' => 'test_payment_123',
                'amount' => '100.00',
                'currency' => 'ZMW',
                'status' => 'SUCCESSFUL',
                'reason' => null
            ], 200)
        ]);

        $referenceId = 'test_reference_123';
        $result = $this->momoApiService->checkPaymentStatus($this->provider, $referenceId);

        $this->assertTrue($result['success']);
        $this->assertEquals('SUCCESSFUL', $result['status']);
        $this->assertEquals('ft_123456', $result['financial_transaction_id']);
    }

    /** @test */
    public function it_can_initiate_payout()
    {
        Http::fake([
            '*/disbursement/token/' => Http::response([
                'access_token' => 'test_access_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ], 200),
            '*/disbursement/v1_0/transfer' => Http::response([
                'status' => 'PENDING'
            ], 202)
        ]);

        $payoutData = [
            'amount' => '50.00',
            'currency' => 'ZMW',
            'external_id' => 'test_payout_123',
            'payee' => [
                'party_id_type' => 'MSISDN',
                'party_id' => '260971234567'
            ],
            'payer_message' => 'Payout payment',
            'payee_note' => 'Your payout'
        ];

        $result = $this->momoApiService->initiatePayout($this->provider, $payoutData);

        $this->assertTrue($result['success']);
        $this->assertEquals('PENDING', $result['status']);
    }

    /** @test */
    public function it_handles_api_rate_limiting()
    {
        Http::fake([
            '*/collection/token/' => Http::response([], 429, [
                'Retry-After' => '60'
            ])
        ]);

        $result = $this->momoApiService->authenticate($this->provider);

        $this->assertFalse($result['success']);
        $this->assertStringContains('Rate limit exceeded', $result['message']);
    }

    /** @test */
    public function it_validates_payment_data()
    {
        $invalidPaymentData = [
            'amount' => '', // Invalid amount
            'currency' => 'USD', // Invalid currency
            'payer' => [
                'party_id' => '123' // Invalid phone number
            ]
        ];

        $result = $this->momoApiService->requestPayment($this->provider, $invalidPaymentData);

        $this->assertFalse($result['success']);
        $this->assertStringContains('validation', strtolower($result['message']));
    }

    /** @test */
    public function it_caches_authentication_tokens()
    {
        Http::fake([
            '*/collection/token/' => Http::response([
                'access_token' => 'test_access_token',
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ], 200)
        ]);

        // First call should hit the API
        $result1 = $this->momoApiService->authenticate($this->provider);
        
        // Second call should use cached token
        $result2 = $this->momoApiService->authenticate($this->provider);

        $this->assertTrue($result1['success']);
        $this->assertTrue($result2['success']);
        $this->assertEquals($result1['access_token'], $result2['access_token']);

        // Verify only one HTTP request was made
        Http::assertSentCount(1);
    }

    /** @test */
    public function it_handles_network_timeouts()
    {
        Http::fake(function () {
            throw new \Illuminate\Http\Client\ConnectionException('Connection timeout');
        });

        $result = $this->momoApiService->authenticate($this->provider);

        $this->assertFalse($result['success']);
        $this->assertStringContains('timeout', strtolower($result['message']));
    }

    /** @test */
    public function it_logs_api_interactions()
    {
        Log::shouldReceive('info')
            ->once()
            ->with('MoMo API Request', \Mockery::type('array'));

        Log::shouldReceive('info')
            ->once()
            ->with('MoMo API Response', \Mockery::type('array'));

        Http::fake([
            '*/collection/token/' => Http::response([
                'access_token' => 'test_access_token'
            ], 200)
        ]);

        $this->momoApiService->authenticate($this->provider);
    }

    /** @test */
    public function it_handles_different_provider_configurations()
    {
        $airtelProvider = MomoProvider::factory()->create([
            'name' => 'Airtel Money',
            'code' => 'airtel',
            'api_base_url' => 'https://api.airtel.africa',
            'api_key' => 'airtel_api_key',
        ]);

        Http::fake([
            'api.airtel.africa/*' => Http::response([
                'access_token' => 'airtel_token'
            ], 200)
        ]);

        $result = $this->momoApiService->authenticate($airtelProvider);

        $this->assertTrue($result['success']);
        $this->assertEquals('airtel_token', $result['access_token']);
    }

    /** @test */
    public function it_validates_webhook_signatures()
    {
        $payload = json_encode(['status' => 'SUCCESSFUL']);
        $secret = 'webhook_secret';
        $signature = hash_hmac('sha256', $payload, $secret);

        $isValid = $this->momoApiService->validateWebhookSignature(
            $payload,
            $signature,
            $secret
        );

        $this->assertTrue($isValid);
    }

    /** @test */
    public function it_rejects_invalid_webhook_signatures()
    {
        $payload = json_encode(['status' => 'SUCCESSFUL']);
        $secret = 'webhook_secret';
        $invalidSignature = 'invalid_signature';

        $isValid = $this->momoApiService->validateWebhookSignature(
            $payload,
            $invalidSignature,
            $secret
        );

        $this->assertFalse($isValid);
    }
}
