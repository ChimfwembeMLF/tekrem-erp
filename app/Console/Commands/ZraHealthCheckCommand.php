<?php

namespace App\Console\Commands;

use App\Models\Finance\ZraConfiguration;
use App\Services\ZRA\ZraApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ZraHealthCheckCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'zra:health-check
                            {--notify : Send notifications if health check fails}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Perform health check on ZRA API connection and update configuration status';

    protected ZraApiService $apiService;

    /**
     * Create a new command instance.
     */
    public function __construct(ZraApiService $apiService)
    {
        parent::__construct();
        $this->apiService = $apiService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting ZRA API health check...');

        try {
            $config = ZraConfiguration::active()->first();

            if (!$config) {
                $this->error('No active ZRA configuration found.');
                return self::FAILURE;
            }

            $this->info("Checking ZRA API health for {$config->formatted_environment} environment...");

            $result = $this->apiService->healthCheck();

            if ($result['success']) {
                $this->info('✓ ZRA API is healthy');
                $this->info("Response time: {$result['response_time']}ms");

                // Log successful health check
                Log::info('ZRA health check successful', [
                    'environment' => $config->environment,
                    'response_time' => $result['response_time'],
                    'status' => $result['status'],
                ]);

                return self::SUCCESS;
            }

            // Health check failed
            $this->error('✗ ZRA API health check failed');
            $this->error("Error: {$result['error']}");

            if (isset($result['response_time'])) {
                $this->warn("Response time: {$result['response_time']}ms");
            }

            // Log failed health check
            Log::error('ZRA health check failed', [
                'environment' => $config->environment,
                'error' => $result['error'],
                'status' => $result['status'],
                'response_time' => $result['response_time'] ?? null,
            ]);

            // Send notifications if requested
            if ($this->option('notify')) {
                $this->sendHealthCheckNotification($config, $result);
            }

            return self::FAILURE;

        } catch (\Exception $e) {
            $this->error('✗ Health check failed with exception');
            $this->error("Exception: {$e->getMessage()}");

            Log::error('ZRA health check exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return self::FAILURE;
        }
    }

    /**
     * Send health check failure notification.
     */
    protected function sendHealthCheckNotification(ZraConfiguration $config, array $result): void
    {
        try {
            // Get admin users for notification
            $adminUsers = \App\Models\User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            $notificationData = [
                'title' => 'ZRA API Health Check Failed',
                'message' => "ZRA API health check failed for {$config->formatted_environment} environment: {$result['error']}",
                'type' => 'error',
                'data' => [
                    'environment' => $config->environment,
                    'error' => $result['error'],
                    'status' => $result['status'],
                    'response_time' => $result['response_time'] ?? null,
                    'timestamp' => now()->toISOString(),
                ],
                'action_url' => route('finance.zra.configuration'),
            ];

            foreach ($adminUsers as $user) {
                // Create notification record
                $user->notifications()->create([
                    'type' => 'zra_health_check_failed',
                    'data' => $notificationData,
                    'read_at' => null,
                ]);
            }

            $this->info('Health check failure notifications sent to administrators.');

        } catch (\Exception $e) {
            $this->warn("Failed to send health check notifications: {$e->getMessage()}");
            
            Log::warning('Failed to send ZRA health check notifications', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
