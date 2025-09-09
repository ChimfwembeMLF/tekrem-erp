<?php

namespace Tests\Feature\Services\ZRA;

use App\Models\Finance\Invoice;
use App\Models\Finance\ZraAuditLog;
use App\Models\Finance\ZraConfiguration;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\User;
use App\Services\ZRA\ZraSmartInvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ZraSmartInvoiceServiceTest extends TestCase
{
    use RefreshDatabase;

    private ZraSmartInvoiceService $service;
    private ZraConfiguration $config;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        $this->config = ZraConfiguration::factory()->create([
            'is_active' => true,
            'environment' => 'sandbox',
        ]);

        $this->service = new ZraSmartInvoiceService();
        Queue::fake();
    }

    public function test_can_submit_invoice_to_zra()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'submitted',
                'reference' => 'ZRA123456789',
                'submission_id' => 'sub_123456',
                'message' => 'Invoice submitted successfully',
            ], 201),
        ]);

        $invoice = Invoice::factory()->create();
        $zraInvoice = ZraSmartInvoice::factory()->pending()->create([
            'invoice_id' => $invoice->id,
        ]);

        $result = $this->service->submitInvoice($zraInvoice);

        $this->assertTrue($result);
        
        $zraInvoice->refresh();
        $this->assertTrue($zraInvoice->isSubmitted());
        $this->assertEquals('ZRA123456789', $zraInvoice->zra_reference);
        $this->assertEquals('sub_123456', $zraInvoice->submission_id);
        $this->assertNotNull($zraInvoice->submitted_at);
    }

    public function test_can_check_invoice_status()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'approved',
                'reference' => 'ZRA123456789',
                'verification_url' => 'https://verify.zra.zm/invoice/123',
                'qr_code' => 'base64_qr_code_data',
            ], 200),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->submitted()->create([
            'zra_reference' => 'ZRA123456789',
        ]);

        $result = $this->service->checkInvoiceStatus($zraInvoice);

        $this->assertTrue($result);
        
        $zraInvoice->refresh();
        $this->assertTrue($zraInvoice->isApproved());
        $this->assertEquals('https://verify.zra.zm/invoice/123', $zraInvoice->verification_url);
        $this->assertNotNull($zraInvoice->approved_at);
    }

    public function test_can_cancel_invoice()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'cancelled',
                'reference' => 'ZRA123456789',
                'message' => 'Invoice cancelled successfully',
            ], 200),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->submitted()->create([
            'zra_reference' => 'ZRA123456789',
        ]);

        $result = $this->service->cancelInvoice($zraInvoice, 'User requested cancellation');

        $this->assertTrue($result);
        
        $zraInvoice->refresh();
        $this->assertTrue($zraInvoice->isCancelled());
        $this->assertEquals('User requested cancellation', $zraInvoice->cancellation_reason);
        $this->assertNotNull($zraInvoice->cancelled_at);
    }

    public function test_validates_invoice_before_submission()
    {
        $invoice = Invoice::factory()->create([
            'total' => 0, // Invalid total
        ]);
        
        $zraInvoice = ZraSmartInvoice::factory()->pending()->create([
            'invoice_id' => $invoice->id,
        ]);

        $result = $this->service->validateInvoiceForSubmission($zraInvoice);

        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['errors']);
        $this->assertContains('Total amount must be greater than zero', $result['errors']);
    }

    public function test_handles_submission_failure()
    {
        Http::fake([
            '*' => Http::response([
                'error' => 'validation_failed',
                'message' => 'Invoice validation failed',
                'errors' => ['Customer tax number is required'],
            ], 422),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->pending()->create();

        $result = $this->service->submitInvoice($zraInvoice);

        $this->assertFalse($result);
        
        $zraInvoice->refresh();
        $this->assertTrue($zraInvoice->isRejected());
        $this->assertEquals('Invoice validation failed', $zraInvoice->rejection_reason);
        $this->assertNotEmpty($zraInvoice->validation_errors);
    }

    public function test_creates_audit_logs()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'submitted',
                'reference' => 'ZRA123456789',
            ], 201),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->pending()->create();

        $this->service->submitInvoice($zraInvoice);

        $this->assertDatabaseHas('zra_audit_logs', [
            'zra_smart_invoice_id' => $zraInvoice->id,
            'action' => 'submit',
            'status' => 'success',
        ]);
    }

    public function test_generates_qr_code_for_approved_invoices()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'approved',
                'reference' => 'ZRA123456789',
                'verification_url' => 'https://verify.zra.zm/invoice/123',
            ], 200),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->submitted()->create([
            'zra_reference' => 'ZRA123456789',
        ]);

        $this->service->checkInvoiceStatus($zraInvoice);

        $zraInvoice->refresh();
        $this->assertNotNull($zraInvoice->qr_code);
        $this->assertTrue($zraInvoice->hasQrCode());
    }

    public function test_can_retry_failed_submission()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'submitted',
                'reference' => 'ZRA123456789',
            ], 201),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->rejected()->create([
            'retry_count' => 1,
        ]);

        $result = $this->service->retrySubmission($zraInvoice);

        $this->assertTrue($result);
        
        $zraInvoice->refresh();
        $this->assertTrue($zraInvoice->isSubmitted());
        $this->assertEquals(2, $zraInvoice->retry_count);
    }

    public function test_prevents_retry_when_max_attempts_exceeded()
    {
        $zraInvoice = ZraSmartInvoice::factory()->rejected()->create([
            'retry_count' => 5, // Exceeds max retries
        ]);

        $result = $this->service->retrySubmission($zraInvoice);

        $this->assertFalse($result);
        
        $zraInvoice->refresh();
        $this->assertTrue($zraInvoice->isRejected()); // Status unchanged
    }

    public function test_respects_retry_delay()
    {
        $zraInvoice = ZraSmartInvoice::factory()->rejected()->create([
            'last_submission_attempt' => now()->subMinutes(2), // Recent attempt
            'retry_count' => 1,
        ]);

        $result = $this->service->retrySubmission($zraInvoice);

        $this->assertFalse($result);
        
        $zraInvoice->refresh();
        $this->assertTrue($zraInvoice->isRejected()); // Status unchanged
    }

    public function test_handles_network_errors_gracefully()
    {
        Http::fake([
            '*' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Network timeout');
            },
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->pending()->create();

        $result = $this->service->submitInvoice($zraInvoice);

        $this->assertFalse($result);
        
        // Verify audit log was created
        $this->assertDatabaseHas('zra_audit_logs', [
            'zra_smart_invoice_id' => $zraInvoice->id,
            'action' => 'submit',
            'status' => 'failed',
        ]);
    }

    public function test_updates_configuration_health_status()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'healthy',
                'response_time' => 150,
            ], 200),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->pending()->create();

        $this->service->submitInvoice($zraInvoice);

        $this->config->refresh();
        $this->assertTrue($this->config->is_healthy);
        $this->assertNotNull($this->config->last_health_check);
    }

    public function test_prevents_submission_of_non_pending_invoices()
    {
        $zraInvoice = ZraSmartInvoice::factory()->approved()->create();

        $result = $this->service->submitInvoice($zraInvoice);

        $this->assertFalse($result);
        
        // Verify no API call was made
        Http::assertNothingSent();
    }

    public function test_tracks_correlation_ids()
    {
        Http::fake([
            '*' => Http::response([
                'status' => 'submitted',
                'reference' => 'ZRA123456789',
            ], 201),
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->pending()->create();

        $this->service->submitInvoice($zraInvoice);

        $auditLog = ZraAuditLog::where('zra_smart_invoice_id', $zraInvoice->id)->first();
        $this->assertNotNull($auditLog->correlation_id);
    }
}
