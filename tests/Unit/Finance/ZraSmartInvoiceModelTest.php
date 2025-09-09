<?php

namespace Tests\Unit\Finance;

use Tests\TestCase;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ZraSmartInvoiceModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_an_invoice()
    {
        $invoice = Invoice::factory()->create();
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'invoice_id' => $invoice->id
        ]);

        $this->assertInstanceOf(Invoice::class, $zraInvoice->invoice);
        $this->assertEquals($invoice->id, $zraInvoice->invoice->id);
    }

    /** @test */
    public function it_can_belong_to_a_submitted_by_user()
    {
        $user = User::factory()->create();
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'submitted_by' => $user->id
        ]);

        $this->assertInstanceOf(User::class, $zraInvoice->submittedBy);
        $this->assertEquals($user->id, $zraInvoice->submittedBy->id);
    }

    /** @test */
    public function it_can_belong_to_an_approved_by_user()
    {
        $user = User::factory()->create();
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'approved_by' => $user->id
        ]);

        $this->assertInstanceOf(User::class, $zraInvoice->approvedBy);
        $this->assertEquals($user->id, $zraInvoice->approvedBy->id);
    }

    /** @test */
    public function it_casts_submission_data_to_array()
    {
        $submissionData = [
            'taxpayer_tpin' => '1234567890',
            'invoice_number' => 'INV-2024-001',
            'total_amount' => 1000.00,
            'tax_amount' => 160.00
        ];

        $zraInvoice = ZraSmartInvoice::factory()->create([
            'submission_data' => $submissionData
        ]);

        $this->assertIsArray($zraInvoice->submission_data);
        $this->assertEquals($submissionData, $zraInvoice->submission_data);
    }

    /** @test */
    public function it_casts_response_data_to_array()
    {
        $responseData = [
            'status' => 'approved',
            'approval_reference' => 'APPR123456',
            'qr_code' => 'base64_qr_code_data'
        ];

        $zraInvoice = ZraSmartInvoice::factory()->create([
            'response_data' => $responseData
        ]);

        $this->assertIsArray($zraInvoice->response_data);
        $this->assertEquals($responseData, $zraInvoice->response_data);
    }

    /** @test */
    public function it_casts_dates_properly()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'submitted_at' => now(),
            'approved_at' => now()->addHour(),
            'cancelled_at' => null,
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $zraInvoice->submitted_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $zraInvoice->approved_at);
        $this->assertNull($zraInvoice->cancelled_at);
    }

    /** @test */
    public function it_has_scope_for_submitted_invoices()
    {
        ZraSmartInvoice::factory()->count(3)->create(['status' => 'submitted']);
        ZraSmartInvoice::factory()->count(2)->create(['status' => 'approved']);
        ZraSmartInvoice::factory()->count(1)->create(['status' => 'failed']);

        $submittedInvoices = ZraSmartInvoice::submitted()->get();

        $this->assertCount(3, $submittedInvoices);
        $submittedInvoices->each(function ($invoice) {
            $this->assertEquals('submitted', $invoice->status);
        });
    }

    /** @test */
    public function it_has_scope_for_approved_invoices()
    {
        ZraSmartInvoice::factory()->count(3)->create(['status' => 'submitted']);
        ZraSmartInvoice::factory()->count(2)->create(['status' => 'approved']);
        ZraSmartInvoice::factory()->count(1)->create(['status' => 'failed']);

        $approvedInvoices = ZraSmartInvoice::approved()->get();

        $this->assertCount(2, $approvedInvoices);
        $approvedInvoices->each(function ($invoice) {
            $this->assertEquals('approved', $invoice->status);
        });
    }

    /** @test */
    public function it_has_scope_for_failed_invoices()
    {
        ZraSmartInvoice::factory()->count(3)->create(['status' => 'submitted']);
        ZraSmartInvoice::factory()->count(2)->create(['status' => 'approved']);
        ZraSmartInvoice::factory()->count(1)->create(['status' => 'failed']);

        $failedInvoices = ZraSmartInvoice::failed()->get();

        $this->assertCount(1, $failedInvoices);
        $failedInvoices->each(function ($invoice) {
            $this->assertEquals('failed', $invoice->status);
        });
    }

    /** @test */
    public function it_has_scope_for_cancelled_invoices()
    {
        ZraSmartInvoice::factory()->count(3)->create(['status' => 'submitted']);
        ZraSmartInvoice::factory()->count(2)->create(['status' => 'cancelled']);

        $cancelledInvoices = ZraSmartInvoice::cancelled()->get();

        $this->assertCount(2, $cancelledInvoices);
        $cancelledInvoices->each(function ($invoice) {
            $this->assertEquals('cancelled', $invoice->status);
        });
    }

    /** @test */
    public function it_has_scope_for_pending_invoices()
    {
        ZraSmartInvoice::factory()->count(3)->create(['status' => 'pending']);
        ZraSmartInvoice::factory()->count(2)->create(['status' => 'submitted']);

        $pendingInvoices = ZraSmartInvoice::pending()->get();

        $this->assertCount(3, $pendingInvoices);
        $pendingInvoices->each(function ($invoice) {
            $this->assertEquals('pending', $invoice->status);
        });
    }

    /** @test */
    public function it_can_check_if_invoice_is_submitted()
    {
        $submittedInvoice = ZraSmartInvoice::factory()->create(['status' => 'submitted']);
        $pendingInvoice = ZraSmartInvoice::factory()->create(['status' => 'pending']);

        $this->assertTrue($submittedInvoice->isSubmitted());
        $this->assertFalse($pendingInvoice->isSubmitted());
    }

    /** @test */
    public function it_can_check_if_invoice_is_approved()
    {
        $approvedInvoice = ZraSmartInvoice::factory()->create(['status' => 'approved']);
        $submittedInvoice = ZraSmartInvoice::factory()->create(['status' => 'submitted']);

        $this->assertTrue($approvedInvoice->isApproved());
        $this->assertFalse($submittedInvoice->isApproved());
    }

    /** @test */
    public function it_can_check_if_invoice_has_failed()
    {
        $failedInvoice = ZraSmartInvoice::factory()->create(['status' => 'failed']);
        $submittedInvoice = ZraSmartInvoice::factory()->create(['status' => 'submitted']);

        $this->assertTrue($failedInvoice->hasFailed());
        $this->assertFalse($submittedInvoice->hasFailed());
    }

    /** @test */
    public function it_can_check_if_invoice_is_cancelled()
    {
        $cancelledInvoice = ZraSmartInvoice::factory()->create(['status' => 'cancelled']);
        $submittedInvoice = ZraSmartInvoice::factory()->create(['status' => 'submitted']);

        $this->assertTrue($cancelledInvoice->isCancelled());
        $this->assertFalse($submittedInvoice->isCancelled());
    }

    /** @test */
    public function it_can_check_if_invoice_is_pending()
    {
        $pendingInvoice = ZraSmartInvoice::factory()->create(['status' => 'pending']);
        $submittedInvoice = ZraSmartInvoice::factory()->create(['status' => 'submitted']);

        $this->assertTrue($pendingInvoice->isPending());
        $this->assertFalse($submittedInvoice->isPending());
    }

    /** @test */
    public function it_can_get_status_badge_class()
    {
        $pendingInvoice = ZraSmartInvoice::factory()->create(['status' => 'pending']);
        $submittedInvoice = ZraSmartInvoice::factory()->create(['status' => 'submitted']);
        $approvedInvoice = ZraSmartInvoice::factory()->create(['status' => 'approved']);
        $failedInvoice = ZraSmartInvoice::factory()->create(['status' => 'failed']);
        $cancelledInvoice = ZraSmartInvoice::factory()->create(['status' => 'cancelled']);

        $this->assertEquals('secondary', $pendingInvoice->getStatusBadgeClassAttribute());
        $this->assertEquals('warning', $submittedInvoice->getStatusBadgeClassAttribute());
        $this->assertEquals('success', $approvedInvoice->getStatusBadgeClassAttribute());
        $this->assertEquals('danger', $failedInvoice->getStatusBadgeClassAttribute());
        $this->assertEquals('dark', $cancelledInvoice->getStatusBadgeClassAttribute());
    }

    /** @test */
    public function it_can_get_qr_code_url()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'qr_code' => 'base64_qr_code_data'
        ]);

        $qrCodeUrl = $zraInvoice->getQrCodeUrlAttribute();

        $this->assertStringStartsWith('data:image/png;base64,', $qrCodeUrl);
        $this->assertStringContains('base64_qr_code_data', $qrCodeUrl);
    }

    /** @test */
    public function it_returns_null_qr_code_url_when_no_qr_code()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'qr_code' => null
        ]);

        $this->assertNull($zraInvoice->getQrCodeUrlAttribute());
    }

    /** @test */
    public function it_can_get_submission_summary()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'submission_data' => [
                'taxpayer_tpin' => '1234567890',
                'invoice_number' => 'INV-2024-001',
                'total_amount' => 1000.00,
                'tax_amount' => 160.00
            ]
        ]);

        $summary = $zraInvoice->getSubmissionSummaryAttribute();

        $this->assertIsArray($summary);
        $this->assertArrayHasKey('taxpayer_tpin', $summary);
        $this->assertArrayHasKey('invoice_number', $summary);
        $this->assertArrayHasKey('total_amount', $summary);
        $this->assertArrayHasKey('tax_amount', $summary);
    }

    /** @test */
    public function it_can_get_days_since_submission()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'submitted_at' => now()->subDays(5)
        ]);

        $daysSince = $zraInvoice->getDaysSinceSubmissionAttribute();

        $this->assertEquals(5, $daysSince);
    }

    /** @test */
    public function it_returns_null_days_since_submission_when_not_submitted()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'submitted_at' => null
        ]);

        $this->assertNull($zraInvoice->getDaysSinceSubmissionAttribute());
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        ZraSmartInvoice::create([
            // Missing required fields
        ]);
    }

    /** @test */
    public function it_can_be_soft_deleted()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create();
        $invoiceId = $zraInvoice->id;

        $zraInvoice->delete();

        $this->assertSoftDeleted('zra_smart_invoices', ['id' => $invoiceId]);
        $this->assertNotNull($zraInvoice->fresh()->deleted_at);
    }

    /** @test */
    public function it_includes_soft_deleted_in_with_trashed_scope()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create();
        $zraInvoice->delete();

        $this->assertCount(0, ZraSmartInvoice::all());
        $this->assertCount(1, ZraSmartInvoice::withTrashed()->get());
    }

    /** @test */
    public function it_can_check_if_retryable()
    {
        $failedInvoice = ZraSmartInvoice::factory()->create([
            'status' => 'failed',
            'retry_count' => 2
        ]);

        $maxRetriedInvoice = ZraSmartInvoice::factory()->create([
            'status' => 'failed',
            'retry_count' => 5 // Assuming max retries is 5
        ]);

        $approvedInvoice = ZraSmartInvoice::factory()->create([
            'status' => 'approved'
        ]);

        $this->assertTrue($failedInvoice->canRetry());
        $this->assertFalse($maxRetriedInvoice->canRetry());
        $this->assertFalse($approvedInvoice->canRetry());
    }

    /** @test */
    public function it_can_check_if_cancellable()
    {
        $submittedInvoice = ZraSmartInvoice::factory()->create(['status' => 'submitted']);
        $approvedInvoice = ZraSmartInvoice::factory()->create(['status' => 'approved']);
        $cancelledInvoice = ZraSmartInvoice::factory()->create(['status' => 'cancelled']);
        $failedInvoice = ZraSmartInvoice::factory()->create(['status' => 'failed']);

        $this->assertTrue($submittedInvoice->canCancel());
        $this->assertTrue($approvedInvoice->canCancel());
        $this->assertFalse($cancelledInvoice->canCancel());
        $this->assertFalse($failedInvoice->canCancel());
    }
}
