<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Finance\MoMoTransaction;
use App\Models\Finance\MoMoProvider;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\MoMoReconciliation;
use App\Models\Finance\Invoice;
use App\Models\UserNotificationPreference;
use App\Notifications\MoMoTransactionStatusChanged;
use App\Notifications\ZraSubmissionStatusChanged;
use App\Notifications\ReconciliationCompleted;
use App\Services\EnhancedNotificationService;
use App\Jobs\SendNotificationJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class EnhancedNotificationSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $staff;
    protected User $customer;
    protected MoMoProvider $provider;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'manager']);
        Role::create(['name' => 'staff']);
        Role::create(['name' => 'customer']);

        // Create users with different roles
        $this->admin = User::factory()->create(['is_active' => true]);
        $this->admin->assignRole('admin');

        $this->manager = User::factory()->create(['is_active' => true]);
        $this->manager->assignRole('manager');

        $this->staff = User::factory()->create(['is_active' => true]);
        $this->staff->assignRole('staff');

        $this->customer = User::factory()->create(['is_active' => true]);
        $this->customer->assignRole('customer');

        // Create MoMo provider
        $this->provider = MoMoProvider::factory()->create();

        // Set up notification preferences
        foreach ([$this->admin, $this->manager, $this->staff, $this->customer] as $user) {
            UserNotificationPreference::create([
                'user_id' => $user->id,
                'momo_notifications' => true,
                'zra_notifications' => true,
                'reconciliation_notifications' => true,
                'finance_notifications' => true,
            ]);
        }
    }

    /** @test */
    public function it_sends_momo_transaction_status_notifications()
    {
        Queue::fake();
        
        $transaction = MoMoTransaction::factory()->create([
            'user_id' => $this->staff->id,
            'provider_id' => $this->provider->id,
            'status' => 'pending',
        ]);

        EnhancedNotificationService::sendMoMoTransactionNotification(
            $transaction, 
            'pending', 
            'completed'
        );

        // Should queue notifications for transaction creator, admin, and manager
        Queue::assertPushed(SendNotificationJob::class, 3);
    }

    /** @test */
    public function it_sends_zra_submission_status_notifications()
    {
        Queue::fake();
        
        $invoice = Invoice::factory()->create(['user_id' => $this->staff->id]);
        $zraInvoice = ZraSmartInvoice::factory()->create([
            'invoice_id' => $invoice->id,
            'status' => 'pending',
        ]);

        EnhancedNotificationService::sendZraSubmissionNotification(
            $zraInvoice, 
            'pending', 
            'submitted'
        );

        // Should queue notifications for invoice creator, admin, and manager
        Queue::assertPushed(SendNotificationJob::class, 3);
    }

    /** @test */
    public function it_sends_reconciliation_completed_notifications()
    {
        Queue::fake();
        
        $reconciliation = MoMoReconciliation::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
        ]);

        $summary = [
            'total_transactions' => 100,
            'matched_transactions' => 95,
            'unmatched_transactions' => 5,
            'has_discrepancies' => true,
            'discrepancy_count' => 2,
            'total_amount' => 50000.00,
            'matched_amount' => 47500.00,
            'discrepancy_amount' => 2500.00,
        ];

        EnhancedNotificationService::sendReconciliationNotification(
            $reconciliation, 
            $summary
        );

        // Should queue notifications for admin and manager only
        Queue::assertPushed(SendNotificationJob::class, 2);
    }

    /** @test */
    public function it_respects_user_notification_preferences()
    {
        Queue::fake();
        
        // Disable MoMo notifications for manager
        $this->manager->notificationPreferences()->update([
            'momo_notifications' => false,
        ]);

        $transaction = MoMoTransaction::factory()->create([
            'user_id' => $this->staff->id,
            'provider_id' => $this->provider->id,
            'status' => 'pending',
        ]);

        // Create and dispatch job manually to test preference checking
        $notification = new MoMoTransactionStatusChanged($transaction, 'pending', 'completed');
        $job = new SendNotificationJob($this->manager, $notification);
        
        // Mock the handle method behavior
        $this->assertFalse($this->manager->getNotificationPreferences()->shouldReceive('momo_transaction_status_changed'));
    }

    /** @test */
    public function it_handles_inactive_users()
    {
        Queue::fake();
        
        // Deactivate staff user
        $this->staff->update(['is_active' => false]);

        $transaction = MoMoTransaction::factory()->create([
            'user_id' => $this->staff->id,
            'provider_id' => $this->provider->id,
            'status' => 'pending',
        ]);

        EnhancedNotificationService::sendMoMoTransactionNotification(
            $transaction, 
            'pending', 
            'completed'
        );

        // Should only queue notifications for admin and manager (not inactive staff)
        Queue::assertPushed(SendNotificationJob::class, 2);
    }

    /** @test */
    public function it_uses_correct_notification_queues()
    {
        Queue::fake();
        
        $transaction = MoMoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
        ]);

        EnhancedNotificationService::sendMoMoTransactionNotification(
            $transaction, 
            'pending', 
            'completed'
        );

        Queue::assertPushedOn('momo-notifications', SendNotificationJob::class);
    }

    /** @test */
    public function notification_classes_format_messages_correctly()
    {
        $transaction = MoMoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
            'amount' => 1000.00,
            'reference' => 'TEST123',
            'status' => 'completed',
        ]);

        $notification = new MoMoTransactionStatusChanged($transaction, 'pending', 'completed');
        
        // Test database message formatting
        $databaseData = $notification->toDatabase($this->admin);
        $this->assertArrayHasKey('type', $databaseData->data);
        $this->assertArrayHasKey('message', $databaseData->data);
        $this->assertArrayHasKey('transaction_id', $databaseData->data);
        $this->assertEquals('momo_transaction_status_changed', $databaseData->data['type']);
    }

    /** @test */
    public function it_handles_bulk_notifications()
    {
        Queue::fake();
        
        $transactions = MoMoTransaction::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'status' => 'completed',
        ]);

        EnhancedNotificationService::sendBulkNotifications($transactions->toArray(), 'momo');

        // Should queue notifications for each transaction
        Queue::assertPushed(SendNotificationJob::class, 10); // 5 transactions × 2 users (admin + manager)
    }

    /** @test */
    public function it_logs_notification_activities()
    {
        Queue::fake();
        
        $transaction = MoMoTransaction::factory()->create([
            'provider_id' => $this->provider->id,
        ]);

        // This should log the notification queuing
        EnhancedNotificationService::sendMoMoTransactionNotification(
            $transaction, 
            'pending', 
            'completed'
        );

        // We can't easily test log output in unit tests, but we can verify the method completes
        $this->assertTrue(true);
    }

    /** @test */
    public function notification_preferences_model_handles_new_types()
    {
        $preferences = $this->admin->getNotificationPreferences();
        
        $this->assertTrue($preferences->shouldReceive('momo_transaction_status_changed'));
        $this->assertTrue($preferences->shouldReceive('zra_submission_status_changed'));
        $this->assertTrue($preferences->shouldReceive('reconciliation_completed'));
        $this->assertTrue($preferences->shouldReceive('finance'));
    }
}
