<?php

namespace Tests\Feature\Services\MoMo;

use Tests\TestCase;
use App\Services\MoMo\MomoTransactionService;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoTransaction;
use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use App\Events\Finance\TransactionCreated;

class MomoTransactionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected MomoTransactionService $transactionService;
    protected MomoProvider $provider;
    protected User $user;
    protected Account $momoAccount;
    protected Account $revenueAccount;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        $this->provider = MomoProvider::factory()->create([
            'name' => 'MTN MoMo',
            'code' => 'mtn',
            'is_active' => true,
        ]);

        // Create test accounts
        $this->momoAccount = Account::factory()->create([
            'name' => 'MTN MoMo Account',
            'code' => '1001',
            'type' => 'asset',
            'is_active' => true,
        ]);

        $this->revenueAccount = Account::factory()->create([
            'name' => 'Service Revenue',
            'code' => '4001',
            'type' => 'revenue',
            'is_active' => true,
        ]);

        $this->transactionService = new MomoTransactionService();
    }

    /** @test */
    public function it_can_create_payment_transaction()
    {
        Event::fake();

        $transactionData = [
            'provider_id' => $this->provider->id,
            'type' => 'payment',
            'amount' => 100.00,
            'currency' => 'ZMW',
            'external_reference' => 'ext_123',
            'customer_phone' => '260971234567',
            'description' => 'Test payment',
            'metadata' => [
                'service_type' => 'consultation',
                'customer_id' => 123
            ]
        ];

        $transaction = $this->transactionService->createTransaction($transactionData);

        $this->assertInstanceOf(MomoTransaction::class, $transaction);
        $this->assertEquals('payment', $transaction->type);
        $this->assertEquals(100.00, $transaction->amount);
        $this->assertEquals('pending', $transaction->status);
        $this->assertEquals('260971234567', $transaction->customer_phone);

        Event::assertDispatched(TransactionCreated::class);
    }

    /** @test */
    public function it_can_create_payout_transaction()
    {
        $transactionData = [
            'provider_id' => $this->provider->id,
            'type' => 'payout',
            'amount' => 50.00,
            'currency' => 'ZMW',
            'external_reference' => 'payout_123',
            'customer_phone' => '260971234567',
            'description' => 'Refund payment',
        ];

        $transaction = $this->transactionService->createTransaction($transactionData);

        $this->assertEquals('payout', $transaction->type);
        $this->assertEquals(50.00, $transaction->amount);
        $this->assertEquals('pending', $transaction->status);
    }

    /** @test */
    public function it_updates_transaction_status()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'pending',
            'amount' => 100.00,
        ]);

        $updateData = [
            'status' => 'completed',
            'provider_reference' => 'mtn_ref_123',
            'provider_transaction_id' => 'mtn_txn_456',
            'completed_at' => now(),
        ];

        $updatedTransaction = $this->transactionService->updateTransactionStatus(
            $transaction,
            $updateData
        );

        $this->assertEquals('completed', $updatedTransaction->status);
        $this->assertEquals('mtn_ref_123', $updatedTransaction->provider_reference);
        $this->assertEquals('mtn_txn_456', $updatedTransaction->provider_transaction_id);
        $this->assertNotNull($updatedTransaction->completed_at);
    }

    /** @test */
    public function it_creates_general_ledger_entries_for_completed_payment()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'payment',
            'amount' => 100.00,
            'status' => 'pending',
        ]);

        $this->transactionService->createGeneralLedgerEntries($transaction, 'completed');

        // Check that GL transactions were created
        $glTransactions = Transaction::where('reference', $transaction->reference)->get();
        
        $this->assertCount(2, $glTransactions); // Debit and Credit entries
        
        $debitEntry = $glTransactions->where('type', 'debit')->first();
        $creditEntry = $glTransactions->where('type', 'credit')->first();
        
        $this->assertEquals(100.00, $debitEntry->amount);
        $this->assertEquals(100.00, $creditEntry->amount);
    }

    /** @test */
    public function it_handles_failed_transactions()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'pending',
            'amount' => 100.00,
        ]);

        $updateData = [
            'status' => 'failed',
            'failure_reason' => 'Insufficient funds',
            'failed_at' => now(),
        ];

        $updatedTransaction = $this->transactionService->updateTransactionStatus(
            $transaction,
            $updateData
        );

        $this->assertEquals('failed', $updatedTransaction->status);
        $this->assertEquals('Insufficient funds', $updatedTransaction->failure_reason);
        $this->assertNotNull($updatedTransaction->failed_at);

        // Ensure no GL entries are created for failed transactions
        $glTransactions = Transaction::where('reference', $transaction->reference)->get();
        $this->assertCount(0, $glTransactions);
    }

    /** @test */
    public function it_can_reconcile_transactions()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
            'amount' => 100.00,
            'is_reconciled' => false,
        ]);

        $reconciliationData = [
            'bank_reference' => 'bank_ref_123',
            'reconciled_amount' => 100.00,
            'reconciled_at' => now(),
            'reconciled_by' => $this->user->id,
        ];

        $reconciledTransaction = $this->transactionService->reconcileTransaction(
            $transaction,
            $reconciliationData
        );

        $this->assertTrue($reconciledTransaction->is_reconciled);
        $this->assertEquals('bank_ref_123', $reconciledTransaction->bank_reference);
        $this->assertEquals(100.00, $reconciledTransaction->reconciled_amount);
        $this->assertEquals($this->user->id, $reconciledTransaction->reconciled_by);
    }

    /** @test */
    public function it_validates_transaction_data()
    {
        $invalidData = [
            'provider_id' => 999, // Non-existent provider
            'type' => 'invalid_type',
            'amount' => -100, // Negative amount
            'currency' => 'USD', // Invalid currency
        ];

        $this->expectException(\Illuminate\Validation\ValidationException::class);
        
        $this->transactionService->createTransaction($invalidData);
    }

    /** @test */
    public function it_handles_duplicate_external_references()
    {
        // Create first transaction
        MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'external_reference' => 'duplicate_ref_123',
        ]);

        // Try to create second transaction with same external reference
        $transactionData = [
            'provider_id' => $this->provider->id,
            'type' => 'payment',
            'amount' => 100.00,
            'currency' => 'ZMW',
            'external_reference' => 'duplicate_ref_123',
            'customer_phone' => '260971234567',
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('duplicate');
        
        $this->transactionService->createTransaction($transactionData);
    }

    /** @test */
    public function it_can_calculate_transaction_fees()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'amount' => 100.00,
            'type' => 'payment',
        ]);

        $fee = $this->transactionService->calculateTransactionFee($transaction);

        $this->assertIsFloat($fee);
        $this->assertGreaterThanOrEqual(0, $fee);
    }

    /** @test */
    public function it_can_generate_transaction_reports()
    {
        // Create test transactions
        MomoTransaction::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
            'created_at' => now()->subDays(1),
        ]);

        MomoTransaction::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'status' => 'failed',
            'created_at' => now()->subDays(1),
        ]);

        $report = $this->transactionService->generateTransactionReport([
            'start_date' => now()->subDays(2),
            'end_date' => now(),
            'provider_id' => $this->provider->id,
        ]);

        $this->assertArrayHasKey('total_transactions', $report);
        $this->assertArrayHasKey('successful_transactions', $report);
        $this->assertArrayHasKey('failed_transactions', $report);
        $this->assertArrayHasKey('total_amount', $report);
        $this->assertArrayHasKey('success_rate', $report);

        $this->assertEquals(8, $report['total_transactions']);
        $this->assertEquals(5, $report['successful_transactions']);
        $this->assertEquals(3, $report['failed_transactions']);
    }

    /** @test */
    public function it_can_retry_failed_transactions()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'failed',
            'retry_count' => 1,
        ]);

        $retriedTransaction = $this->transactionService->retryTransaction($transaction);

        $this->assertEquals('pending', $retriedTransaction->status);
        $this->assertEquals(2, $retriedTransaction->retry_count);
        $this->assertNotNull($retriedTransaction->last_retry_at);
    }

    /** @test */
    public function it_prevents_excessive_retries()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'failed',
            'retry_count' => 5, // Max retries exceeded
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Maximum retry attempts exceeded');
        
        $this->transactionService->retryTransaction($transaction);
    }
}
