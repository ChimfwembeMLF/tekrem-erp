<?php

namespace Tests\Unit\Finance;

use Tests\TestCase;
use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MomoTransactionModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_provider()
    {
        $provider = MomoProvider::factory()->create();
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $provider->id
        ]);

        $this->assertInstanceOf(MomoProvider::class, $transaction->provider);
        $this->assertEquals($provider->id, $transaction->provider->id);
    }

    /** @test */
    public function it_can_belong_to_an_invoice()
    {
        $invoice = Invoice::factory()->create();
        $transaction = MomoTransaction::factory()->create([
            'invoice_id' => $invoice->id
        ]);

        $this->assertInstanceOf(Invoice::class, $transaction->invoice);
        $this->assertEquals($invoice->id, $transaction->invoice->id);
    }

    /** @test */
    public function it_can_belong_to_a_user()
    {
        $user = User::factory()->create();
        $transaction = MomoTransaction::factory()->create([
            'user_id' => $user->id
        ]);

        $this->assertInstanceOf(User::class, $transaction->user);
        $this->assertEquals($user->id, $transaction->user->id);
    }

    /** @test */
    public function it_generates_reference_automatically()
    {
        $transaction = MomoTransaction::factory()->create();

        $this->assertNotNull($transaction->reference);
        $this->assertStringStartsWith('MOMO-', $transaction->reference);
    }

    /** @test */
    public function it_casts_metadata_to_array()
    {
        $metadata = [
            'service_type' => 'consultation',
            'customer_id' => 123,
            'notes' => 'Test payment'
        ];

        $transaction = MomoTransaction::factory()->create([
            'metadata' => $metadata
        ]);

        $this->assertIsArray($transaction->metadata);
        $this->assertEquals($metadata, $transaction->metadata);
    }

    /** @test */
    public function it_casts_dates_properly()
    {
        $transaction = MomoTransaction::factory()->create([
            'completed_at' => now(),
            'failed_at' => null,
            'reconciled_at' => now()->subDay(),
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $transaction->completed_at);
        $this->assertNull($transaction->failed_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $transaction->reconciled_at);
    }

    /** @test */
    public function it_has_scope_for_completed_transactions()
    {
        MomoTransaction::factory()->count(3)->create(['status' => 'completed']);
        MomoTransaction::factory()->count(2)->create(['status' => 'pending']);
        MomoTransaction::factory()->count(1)->create(['status' => 'failed']);

        $completedTransactions = MomoTransaction::completed()->get();

        $this->assertCount(3, $completedTransactions);
        $completedTransactions->each(function ($transaction) {
            $this->assertEquals('completed', $transaction->status);
        });
    }

    /** @test */
    public function it_has_scope_for_pending_transactions()
    {
        MomoTransaction::factory()->count(3)->create(['status' => 'completed']);
        MomoTransaction::factory()->count(2)->create(['status' => 'pending']);
        MomoTransaction::factory()->count(1)->create(['status' => 'failed']);

        $pendingTransactions = MomoTransaction::pending()->get();

        $this->assertCount(2, $pendingTransactions);
        $pendingTransactions->each(function ($transaction) {
            $this->assertEquals('pending', $transaction->status);
        });
    }

    /** @test */
    public function it_has_scope_for_failed_transactions()
    {
        MomoTransaction::factory()->count(3)->create(['status' => 'completed']);
        MomoTransaction::factory()->count(2)->create(['status' => 'pending']);
        MomoTransaction::factory()->count(1)->create(['status' => 'failed']);

        $failedTransactions = MomoTransaction::failed()->get();

        $this->assertCount(1, $failedTransactions);
        $failedTransactions->each(function ($transaction) {
            $this->assertEquals('failed', $transaction->status);
        });
    }

    /** @test */
    public function it_has_scope_for_reconciled_transactions()
    {
        MomoTransaction::factory()->count(3)->create(['is_reconciled' => true]);
        MomoTransaction::factory()->count(2)->create(['is_reconciled' => false]);

        $reconciledTransactions = MomoTransaction::reconciled()->get();

        $this->assertCount(3, $reconciledTransactions);
        $reconciledTransactions->each(function ($transaction) {
            $this->assertTrue($transaction->is_reconciled);
        });
    }

    /** @test */
    public function it_has_scope_for_unreconciled_transactions()
    {
        MomoTransaction::factory()->count(3)->create(['is_reconciled' => true]);
        MomoTransaction::factory()->count(2)->create(['is_reconciled' => false]);

        $unreconciledTransactions = MomoTransaction::unreconciled()->get();

        $this->assertCount(2, $unreconciledTransactions);
        $unreconciledTransactions->each(function ($transaction) {
            $this->assertFalse($transaction->is_reconciled);
        });
    }

    /** @test */
    public function it_has_scope_for_payment_type()
    {
        MomoTransaction::factory()->count(3)->create(['type' => 'payment']);
        MomoTransaction::factory()->count(2)->create(['type' => 'payout']);

        $paymentTransactions = MomoTransaction::payments()->get();

        $this->assertCount(3, $paymentTransactions);
        $paymentTransactions->each(function ($transaction) {
            $this->assertEquals('payment', $transaction->type);
        });
    }

    /** @test */
    public function it_has_scope_for_payout_type()
    {
        MomoTransaction::factory()->count(3)->create(['type' => 'payment']);
        MomoTransaction::factory()->count(2)->create(['type' => 'payout']);

        $payoutTransactions = MomoTransaction::payouts()->get();

        $this->assertCount(2, $payoutTransactions);
        $payoutTransactions->each(function ($transaction) {
            $this->assertEquals('payout', $transaction->type);
        });
    }

    /** @test */
    public function it_has_scope_for_provider()
    {
        $provider1 = MomoProvider::factory()->create();
        $provider2 = MomoProvider::factory()->create();

        MomoTransaction::factory()->count(3)->create(['provider_id' => $provider1->id]);
        MomoTransaction::factory()->count(2)->create(['provider_id' => $provider2->id]);

        $provider1Transactions = MomoTransaction::forProvider($provider1->id)->get();

        $this->assertCount(3, $provider1Transactions);
        $provider1Transactions->each(function ($transaction) use ($provider1) {
            $this->assertEquals($provider1->id, $transaction->provider_id);
        });
    }

    /** @test */
    public function it_can_check_if_transaction_is_successful()
    {
        $completedTransaction = MomoTransaction::factory()->create(['status' => 'completed']);
        $pendingTransaction = MomoTransaction::factory()->create(['status' => 'pending']);
        $failedTransaction = MomoTransaction::factory()->create(['status' => 'failed']);

        $this->assertTrue($completedTransaction->isSuccessful());
        $this->assertFalse($pendingTransaction->isSuccessful());
        $this->assertFalse($failedTransaction->isSuccessful());
    }

    /** @test */
    public function it_can_check_if_transaction_is_pending()
    {
        $completedTransaction = MomoTransaction::factory()->create(['status' => 'completed']);
        $pendingTransaction = MomoTransaction::factory()->create(['status' => 'pending']);
        $failedTransaction = MomoTransaction::factory()->create(['status' => 'failed']);

        $this->assertFalse($completedTransaction->isPending());
        $this->assertTrue($pendingTransaction->isPending());
        $this->assertFalse($failedTransaction->isPending());
    }

    /** @test */
    public function it_can_check_if_transaction_has_failed()
    {
        $completedTransaction = MomoTransaction::factory()->create(['status' => 'completed']);
        $pendingTransaction = MomoTransaction::factory()->create(['status' => 'pending']);
        $failedTransaction = MomoTransaction::factory()->create(['status' => 'failed']);

        $this->assertFalse($completedTransaction->hasFailed());
        $this->assertFalse($pendingTransaction->hasFailed());
        $this->assertTrue($failedTransaction->hasFailed());
    }

    /** @test */
    public function it_can_get_formatted_amount()
    {
        $transaction = MomoTransaction::factory()->create([
            'amount' => 1234.56,
            'currency' => 'ZMW'
        ]);

        $formattedAmount = $transaction->getFormattedAmountAttribute();

        $this->assertEquals('ZMW 1,234.56', $formattedAmount);
    }

    /** @test */
    public function it_can_get_status_badge_class()
    {
        $completedTransaction = MomoTransaction::factory()->create(['status' => 'completed']);
        $pendingTransaction = MomoTransaction::factory()->create(['status' => 'pending']);
        $failedTransaction = MomoTransaction::factory()->create(['status' => 'failed']);

        $this->assertEquals('success', $completedTransaction->getStatusBadgeClassAttribute());
        $this->assertEquals('warning', $pendingTransaction->getStatusBadgeClassAttribute());
        $this->assertEquals('danger', $failedTransaction->getStatusBadgeClassAttribute());
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        MomoTransaction::create([
            // Missing required fields
        ]);
    }

    /** @test */
    public function it_validates_amount_is_positive()
    {
        $transaction = MomoTransaction::factory()->make(['amount' => -100]);

        $this->expectException(\Exception::class);
        $transaction->save();
    }

    /** @test */
    public function it_validates_phone_number_format()
    {
        $transaction = MomoTransaction::factory()->make(['customer_phone' => '123']);

        $this->expectException(\Exception::class);
        $transaction->save();
    }

    /** @test */
    public function it_can_be_soft_deleted()
    {
        $transaction = MomoTransaction::factory()->create();
        $transactionId = $transaction->id;

        $transaction->delete();

        $this->assertSoftDeleted('momo_transactions', ['id' => $transactionId]);
        $this->assertNotNull($transaction->fresh()->deleted_at);
    }

    /** @test */
    public function it_includes_soft_deleted_in_with_trashed_scope()
    {
        $transaction = MomoTransaction::factory()->create();
        $transaction->delete();

        $this->assertCount(0, MomoTransaction::all());
        $this->assertCount(1, MomoTransaction::withTrashed()->get());
    }
}
