<?php

namespace Tests\Feature\Finance;

use Tests\TestCase;
use App\Models\User;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class MomoControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected MomoProvider $provider;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        // Create permissions and roles
        Permission::create(['name' => 'manage momo']);
        $role = Role::create(['name' => 'admin']);
        $role->givePermissionTo('manage momo');
        $this->user->assignRole('admin');
        
        $this->provider = MomoProvider::factory()->create([
            'name' => 'MTN MoMo',
            'code' => 'mtn',
            'is_active' => true,
        ]);
    }

    /** @test */
    public function authenticated_user_can_view_momo_index()
    {
        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/MoMo/Index')
        );
    }

    /** @test */
    public function unauthenticated_user_cannot_access_momo_routes()
    {
        $response = $this->get(route('finance.momo.index'));
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function user_without_permission_cannot_access_momo_routes()
    {
        $unauthorizedUser = User::factory()->create();
        
        $response = $this->actingAs($unauthorizedUser)
            ->get(route('finance.momo.index'));

        $response->assertStatus(403);
    }

    /** @test */
    public function can_view_momo_dashboard()
    {
        // Create some test transactions
        MomoTransaction::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
        ]);

        MomoTransaction::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/MoMo/Dashboard')
                ->has('stats')
                ->has('recentTransactions')
                ->has('providers')
        );
    }

    /** @test */
    public function can_create_new_momo_transaction()
    {
        $transactionData = [
            'provider_id' => $this->provider->id,
            'type' => 'payment',
            'amount' => 100.00,
            'currency' => 'ZMW',
            'customer_phone' => '260971234567',
            'description' => 'Test payment',
            'external_reference' => 'test_ref_123',
        ];

        Http::fake([
            '*' => Http::response([
                'status' => 'pending',
                'reference' => 'momo_ref_123'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.momo.store'), $transactionData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('momo_transactions', [
            'provider_id' => $this->provider->id,
            'type' => 'payment',
            'amount' => 100.00,
            'customer_phone' => '260971234567',
        ]);
    }

    /** @test */
    public function can_view_transaction_details()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'amount' => 100.00,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.show', $transaction));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/MoMo/Show')
                ->has('transaction')
                ->where('transaction.id', $transaction->id)
        );
    }

    /** @test */
    public function can_initiate_payout()
    {
        $payoutData = [
            'provider_id' => $this->provider->id,
            'amount' => 50.00,
            'currency' => 'ZMW',
            'customer_phone' => '260971234567',
            'description' => 'Refund payment',
            'external_reference' => 'payout_ref_123',
        ];

        Http::fake([
            '*' => Http::response([
                'status' => 'pending',
                'reference' => 'payout_ref_123'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.momo.payout'), $payoutData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('momo_transactions', [
            'provider_id' => $this->provider->id,
            'type' => 'payout',
            'amount' => 50.00,
            'customer_phone' => '260971234567',
        ]);
    }

    /** @test */
    public function can_check_transaction_status()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'pending',
            'provider_reference' => 'momo_ref_123',
        ]);

        Http::fake([
            '*' => Http::response([
                'status' => 'completed',
                'financial_transaction_id' => 'ft_123456'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.momo.check-status', $transaction));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Refresh transaction from database
        $transaction->refresh();
        $this->assertEquals('completed', $transaction->status);
    }

    /** @test */
    public function validates_transaction_creation_data()
    {
        $invalidData = [
            'provider_id' => 999, // Non-existent provider
            'type' => 'invalid_type',
            'amount' => -100, // Negative amount
            'currency' => 'USD', // Invalid currency
            'customer_phone' => '123', // Invalid phone
        ];

        $response = $this->actingAs($this->user)
            ->post(route('finance.momo.store'), $invalidData);

        $response->assertSessionHasErrors([
            'provider_id',
            'type',
            'amount',
            'currency',
            'customer_phone'
        ]);
    }

    /** @test */
    public function can_view_reconciliation_dashboard()
    {
        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.reconciliation'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/MoMo/Reconciliation')
                ->has('unreconciledTransactions')
                ->has('reconciliationStats')
        );
    }

    /** @test */
    public function can_perform_auto_reconciliation()
    {
        // Create unreconciled transactions
        MomoTransaction::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
            'is_reconciled' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.momo.reconciliation.auto'));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /** @test */
    public function can_perform_manual_reconciliation()
    {
        $transaction = MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
            'is_reconciled' => false,
        ]);

        $reconciliationData = [
            'transaction_id' => $transaction->id,
            'bank_reference' => 'bank_ref_123',
            'reconciled_amount' => $transaction->amount,
        ];

        $response = $this->actingAs($this->user)
            ->post(route('finance.momo.reconciliation.manual'), $reconciliationData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $transaction->refresh();
        $this->assertTrue($transaction->is_reconciled);
        $this->assertEquals('bank_ref_123', $transaction->bank_reference);
    }

    /** @test */
    public function can_view_audit_trail()
    {
        // Create transactions with audit data
        MomoTransaction::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.audit'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/MoMo/Audit')
                ->has('auditLogs')
                ->has('filters')
        );
    }

    /** @test */
    public function can_export_audit_data()
    {
        MomoTransaction::factory()->count(10)->create([
            'provider_id' => $this->provider->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.audit.export', [
                'format' => 'csv',
                'start_date' => now()->subDays(30)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    /** @test */
    public function handles_api_errors_gracefully()
    {
        $transactionData = [
            'provider_id' => $this->provider->id,
            'type' => 'payment',
            'amount' => 100.00,
            'currency' => 'ZMW',
            'customer_phone' => '260971234567',
            'description' => 'Test payment',
        ];

        Http::fake([
            '*' => Http::response([
                'error' => 'Insufficient funds'
            ], 400)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.momo.store'), $transactionData);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    /** @test */
    public function can_filter_transactions_by_status()
    {
        MomoTransaction::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
        ]);

        MomoTransaction::factory()->count(2)->create([
            'provider_id' => $this->provider->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.index', ['status' => 'completed']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('transactions.data', 3)
        );
    }

    /** @test */
    public function can_filter_transactions_by_provider()
    {
        $airtelProvider = MomoProvider::factory()->create([
            'name' => 'Airtel Money',
            'code' => 'airtel',
        ]);

        MomoTransaction::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
        ]);

        MomoTransaction::factory()->count(2)->create([
            'provider_id' => $airtelProvider->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.index', ['provider_id' => $this->provider->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('transactions.data', 3)
        );
    }

    /** @test */
    public function can_search_transactions()
    {
        MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_phone' => '260971234567',
            'description' => 'Payment for consultation',
        ]);

        MomoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_phone' => '260979876543',
            'description' => 'Refund payment',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.momo.index', ['search' => 'consultation']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('transactions.data', 1)
        );
    }
}
