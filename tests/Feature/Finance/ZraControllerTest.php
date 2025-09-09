<?php

namespace Tests\Feature\Finance;

use Tests\TestCase;
use App\Models\User;
use App\Models\Finance\Invoice;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\ZraConfiguration;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ZraControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected ZraConfiguration $config;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        // Create permissions and roles
        Permission::create(['name' => 'manage zra']);
        $role = Role::create(['name' => 'admin']);
        $role->givePermissionTo('manage zra');
        $this->user->assignRole('admin');
        
        // Set up ZRA configuration
        Setting::set('zra.taxpayer.taxpayer_tpin', '1234567890');
        Setting::set('zra.taxpayer.taxpayer_name', 'Test Company Ltd');
        Setting::set('zra.api.base_url', 'https://api.sandbox.zra.zm');
        Setting::set('zra.api.username', 'test_user');
        Setting::set('zra.api.password', 'test_password');
        Setting::set('zra.api.environment', 'sandbox');
    }

    /** @test */
    public function authenticated_user_can_view_zra_index()
    {
        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/ZRA/Index')
        );
    }

    /** @test */
    public function unauthenticated_user_cannot_access_zra_routes()
    {
        $response = $this->get(route('finance.zra.index'));
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function user_without_permission_cannot_access_zra_routes()
    {
        $unauthorizedUser = User::factory()->create();
        
        $response = $this->actingAs($unauthorizedUser)
            ->get(route('finance.zra.index'));

        $response->assertStatus(403);
    }

    /** @test */
    public function can_view_zra_dashboard()
    {
        // Create some test ZRA invoices
        ZraSmartInvoice::factory()->count(5)->create([
            'status' => 'submitted',
        ]);

        ZraSmartInvoice::factory()->count(3)->create([
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/ZRA/Dashboard')
                ->has('stats')
                ->has('recentInvoices')
                ->has('complianceStatus')
        );
    }

    /** @test */
    public function can_view_zra_invoice_details()
    {
        $invoice = Invoice::factory()->create([
            'total' => 1000.00,
            'tax_amount' => 160.00,
        ]);

        $zraInvoice = ZraSmartInvoice::factory()->create([
            'invoice_id' => $invoice->id,
            'zra_reference' => 'ZRA123456',
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.show', $zraInvoice));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/ZRA/Show')
                ->has('zraInvoice')
                ->where('zraInvoice.id', $zraInvoice->id)
        );
    }

    /** @test */
    public function can_submit_invoice_to_zra()
    {
        $invoice = Invoice::factory()->create([
            'total' => 1000.00,
            'tax_amount' => 160.00,
            'invoice_number' => 'INV-2024-001',
        ]);

        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/invoices/submit' => Http::response([
                'status' => 'submitted',
                'reference' => 'ZRA123456789',
                'qr_code' => 'base64_qr_code_data',
                'submission_date' => '2024-01-15T10:30:00Z'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.submit', $invoice));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('zra_smart_invoices', [
            'invoice_id' => $invoice->id,
            'zra_reference' => 'ZRA123456789',
            'status' => 'submitted',
        ]);
    }

    /** @test */
    public function can_check_zra_invoice_status()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'zra_reference' => 'ZRA123456',
            'status' => 'submitted',
        ]);

        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/invoices/ZRA123456/status' => Http::response([
                'status' => 'approved',
                'approval_date' => '2024-01-15T10:30:00Z',
                'approval_reference' => 'APPR123456'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.check-status', $zraInvoice));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $zraInvoice->refresh();
        $this->assertEquals('approved', $zraInvoice->status);
    }

    /** @test */
    public function can_cancel_zra_invoice()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'zra_reference' => 'ZRA123456',
            'status' => 'submitted',
        ]);

        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/invoices/ZRA123456/cancel' => Http::response([
                'status' => 'cancelled',
                'cancellation_date' => '2024-01-15T10:30:00Z',
                'cancellation_reference' => 'CANC123456'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.cancel', $zraInvoice), [
                'reason' => 'Customer request'
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $zraInvoice->refresh();
        $this->assertEquals('cancelled', $zraInvoice->status);
    }

    /** @test */
    public function can_retry_failed_zra_submission()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'status' => 'failed',
            'failure_reason' => 'Network timeout',
        ]);

        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/invoices/submit' => Http::response([
                'status' => 'submitted',
                'reference' => 'ZRA789456',
                'qr_code' => 'base64_qr_code_data'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.retry', $zraInvoice));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $zraInvoice->refresh();
        $this->assertEquals('submitted', $zraInvoice->status);
        $this->assertEquals('ZRA789456', $zraInvoice->zra_reference);
    }

    /** @test */
    public function can_download_qr_code()
    {
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'zra_reference' => 'ZRA123456',
            'status' => 'approved',
            'qr_code' => 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.qr-code', $zraInvoice));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/png');
    }

    /** @test */
    public function validates_invoice_before_zra_submission()
    {
        $invalidInvoice = Invoice::factory()->create([
            'total' => 0, // Invalid total
            'tax_amount' => -10, // Invalid tax
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.submit', $invalidInvoice));

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /** @test */
    public function handles_zra_api_errors_gracefully()
    {
        $invoice = Invoice::factory()->create([
            'total' => 1000.00,
            'tax_amount' => 160.00,
        ]);

        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/invoices/submit' => Http::response([
                'error' => 'Invalid tax calculation',
                'error_code' => 'TAX_001'
            ], 422)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.submit', $invoice));

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /** @test */
    public function can_filter_zra_invoices_by_status()
    {
        ZraSmartInvoice::factory()->count(3)->create([
            'status' => 'approved',
        ]);

        ZraSmartInvoice::factory()->count(2)->create([
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.index', ['status' => 'approved']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('invoices.data', 3)
        );
    }

    /** @test */
    public function can_search_zra_invoices()
    {
        $invoice1 = Invoice::factory()->create([
            'invoice_number' => 'INV-2024-001',
        ]);

        $invoice2 = Invoice::factory()->create([
            'invoice_number' => 'INV-2024-002',
        ]);

        ZraSmartInvoice::factory()->create([
            'invoice_id' => $invoice1->id,
            'zra_reference' => 'ZRA123456',
        ]);

        ZraSmartInvoice::factory()->create([
            'invoice_id' => $invoice2->id,
            'zra_reference' => 'ZRA789456',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.index', ['search' => 'INV-2024-001']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('invoices.data', 1)
        );
    }

    /** @test */
    public function can_view_compliance_report()
    {
        // Create invoices with different compliance statuses
        ZraSmartInvoice::factory()->count(10)->create([
            'status' => 'approved',
            'submitted_at' => now()->subDays(rand(1, 30)),
        ]);

        ZraSmartInvoice::factory()->count(3)->create([
            'status' => 'failed',
            'submitted_at' => now()->subDays(rand(1, 30)),
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.index', ['view' => 'compliance']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('complianceStats')
                ->has('complianceReport')
        );
    }

    /** @test */
    public function prevents_duplicate_zra_submissions()
    {
        $invoice = Invoice::factory()->create();
        
        // Create existing ZRA invoice
        ZraSmartInvoice::factory()->create([
            'invoice_id' => $invoice->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.submit', $invoice));

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
        $response->assertJsonFragment(['message' => 'Invoice already submitted to ZRA']);
    }

    /** @test */
    public function can_bulk_check_invoice_statuses()
    {
        $zraInvoices = ZraSmartInvoice::factory()->count(3)->create([
            'status' => 'submitted',
        ]);

        Http::fake([
            '*/auth/login' => Http::response(['token' => 'test_token'], 200),
            '*/invoices/*/status' => Http::response([
                'status' => 'approved',
                'approval_date' => '2024-01-15T10:30:00Z'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('finance.zra.bulk-status-check'), [
                'invoice_ids' => $zraInvoices->pluck('id')->toArray()
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Check that all invoices were updated
        foreach ($zraInvoices as $invoice) {
            $invoice->refresh();
            $this->assertEquals('approved', $invoice->status);
        }
    }

    /** @test */
    public function can_export_zra_compliance_report()
    {
        ZraSmartInvoice::factory()->count(10)->create([
            'status' => 'approved',
            'submitted_at' => now()->subDays(rand(1, 30)),
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('finance.zra.export', [
                'format' => 'csv',
                'start_date' => now()->subDays(30)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
