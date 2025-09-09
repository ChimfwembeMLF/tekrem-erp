<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\Account;
use App\Models\User;
use App\Services\MoMo\MomoTransactionService;
use App\Services\MoMo\Contracts\MomoServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;

class MomoTransactionServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected MomoTransactionService $service;
    protected User $user;
    protected MomoProvider $provider;
    protected Account $cashAccount;
    protected Account $feeAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(MomoTransactionService::class);

        // Create test user
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Create test accounts
        $this->cashAccount = Account::factory()->create([
            'name' => 'MoMo Cash Account',
            'account_code' => '1100',
            'type' => 'asset',
            'normal_balance' => 'debit',
        ]);

        $this->feeAccount = Account::factory()->create([
            'name' => 'MoMo Fee Account',
            'account_code' => '5100',
            'type' => 'expense',
            'normal_balance' => 'debit',
        ]);

        // Create test provider
        $this->provider = MomoProvider::factory()->create([
            'code' => 'mtn',
            'display_name' => 'MTN MoMo',
            'is_active' => true,
            'cash_account_id' => $this->cashAccount->id,
            'fee_account_id' => $this->feeAccount->id,
        ]);
    }

    /** @test */
    public function it_can_initiate_a_payment()
    {
        $data = [
            'amount' => 100.00,
            'phone_number' => '0977123456',
            'provider_code' => 'mtn',
            'type' => 'collection',
            'description' => 'Test payment',
            'user_id' => $this->user->id,
        ];

        $result = $this->service->initiatePayment($data);

        $this->assertTrue($result['success']);
        $this->assertInstanceOf(MomoTransaction::class, $result['transaction']);
        
        $transaction = $result['transaction'];
        $this->assertEquals('collection', $transaction->type);
        $this->assertEquals(100.00, $transaction->amount);
        $this->assertEquals('0977123456', $transaction->phone_number);
        $this->assertEquals($this->provider->id, $transaction->provider_id);
        $this->assertEquals($this->user->id, $transaction->user_id);
        $this->assertNotNull($transaction->transaction_number);
    }

    /** @test */
    public function it_can_process_a_payout()
    {
        $data = [
            'amount' => 50.00,
            'phone_number' => '0977123456',
            'provider_code' => 'mtn',
            'description' => 'Test payout',
            'user_id' => $this->user->id,
        ];

        $result = $this->service->processPayout($data);

        $this->assertTrue($result['success']);
        $this->assertInstanceOf(MomoTransaction::class, $result['transaction']);
        
        $transaction = $result['transaction'];
        $this->assertEquals('disbursement', $transaction->type);
        $this->assertEquals(50.00, $transaction->amount);
        $this->assertEquals('0977123456', $transaction->phone_number);
        $this->assertEquals($this->provider->id, $transaction->provider_id);
    }

    /** @test */
    public function it_validates_phone_number_format()
    {
        $data = [
            'amount' => 100.00,
            'phone_number' => '123456789', // Invalid format
            'provider_code' => 'mtn',
            'type' => 'collection',
            'description' => 'Test payment',
            'user_id' => $this->user->id,
        ];

        $result = $this->service->initiatePayment($data);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('phone number', strtolower($result['error']));
    }

    /** @test */
    public function it_validates_amount_limits()
    {
        // Test minimum amount
        $data = [
            'amount' => 0.50, // Below minimum
            'phone_number' => '0977123456',
            'provider_code' => 'mtn',
            'type' => 'collection',
            'description' => 'Test payment',
            'user_id' => $this->user->id,
        ];

        $result = $this->service->initiatePayment($data);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('amount', strtolower($result['error']));
    }

    /** @test */
    public function it_auto_detects_provider_from_phone_number()
    {
        $data = [
            'amount' => 100.00,
            'phone_number' => '0977123456', // MTN number
            'type' => 'collection',
            'description' => 'Test payment',
            'user_id' => $this->user->id,
        ];

        $result = $this->service->initiatePayment($data);

        $this->assertTrue($result['success']);
        $transaction = $result['transaction'];
        $this->assertEquals($this->provider->id, $transaction->provider_id);
    }

    /** @test */
    public function it_can_update_transaction_status()
    {
        $transaction = MomoTransaction::factory()->create([
            'status' => 'pending',
            'provider_id' => $this->provider->id,
            'user_id' => $this->user->id,
        ]);

        $result = $this->service->updateTransactionStatus($transaction, 'completed', [
            'provider_reference' => 'PROV123',
            'provider_fee' => 2.50,
        ]);

        $this->assertTrue($result['success']);
        
        $transaction->refresh();
        $this->assertEquals('completed', $transaction->status);
        $this->assertEquals('PROV123', $transaction->provider_reference);
        $this->assertEquals(2.50, $transaction->fee_amount);
        $this->assertNotNull($transaction->completed_at);
    }

    /** @test */
    public function it_creates_ledger_entries_for_completed_transactions()
    {
        $transaction = MomoTransaction::factory()->create([
            'status' => 'pending',
            'type' => 'collection',
            'amount' => 100.00,
            'provider_id' => $this->provider->id,
            'user_id' => $this->user->id,
        ]);

        $this->service->updateTransactionStatus($transaction, 'completed', [
            'provider_fee' => 2.50,
        ]);

        // Check that ledger entries were created
        $this->assertDatabaseHas('transactions', [
            'account_id' => $this->cashAccount->id,
            'amount' => 97.50, // 100 - 2.50 fee
            'type' => 'income',
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('transactions', [
            'account_id' => $this->feeAccount->id,
            'amount' => 2.50,
            'type' => 'expense',
            'status' => 'completed',
        ]);
    }

    /** @test */
    public function it_handles_transaction_failures_gracefully()
    {
        $data = [
            'amount' => 100.00,
            'phone_number' => '0977123456',
            'provider_code' => 'invalid_provider',
            'type' => 'collection',
            'description' => 'Test payment',
            'user_id' => $this->user->id,
        ];

        $result = $this->service->initiatePayment($data);

        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
    }

    /** @test */
    public function it_generates_unique_transaction_numbers()
    {
        $data = [
            'amount' => 100.00,
            'phone_number' => '0977123456',
            'provider_code' => 'mtn',
            'type' => 'collection',
            'description' => 'Test payment',
            'user_id' => $this->user->id,
        ];

        $result1 = $this->service->initiatePayment($data);
        $result2 = $this->service->initiatePayment($data);

        $this->assertTrue($result1['success']);
        $this->assertTrue($result2['success']);
        
        $this->assertNotEquals(
            $result1['transaction']->transaction_number,
            $result2['transaction']->transaction_number
        );
    }

    /** @test */
    public function it_can_check_transaction_status()
    {
        $transaction = MomoTransaction::factory()->create([
            'status' => 'pending',
            'provider_id' => $this->provider->id,
            'user_id' => $this->user->id,
            'provider_reference' => 'PROV123',
        ]);

        // Mock the provider service response
        $this->mock(MomoServiceInterface::class, function ($mock) {
            $mock->shouldReceive('checkTransactionStatus')
                 ->once()
                 ->andReturn([
                     'success' => true,
                     'status' => 'completed',
                     'provider_fee' => 2.50,
                 ]);
        });

        $result = $this->service->checkTransactionStatus($transaction);

        $this->assertTrue($result['success']);
        $this->assertEquals('completed', $result['status']);
    }

    /** @test */
    public function it_maintains_data_integrity_during_failures()
    {
        $initialTransactionCount = MomoTransaction::count();

        // Force a database error by using invalid data
        DB::shouldReceive('transaction')->andThrow(new \Exception('Database error'));

        $data = [
            'amount' => 100.00,
            'phone_number' => '0977123456',
            'provider_code' => 'mtn',
            'type' => 'collection',
            'description' => 'Test payment',
            'user_id' => $this->user->id,
        ];

        $result = $this->service->initiatePayment($data);

        $this->assertFalse($result['success']);
        $this->assertEquals($initialTransactionCount, MomoTransaction::count());
    }
}
