<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Finance\ZraConfiguration;

class ZraConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if there's already an active ZRA configuration
        if (ZraConfiguration::where('is_active', true)->exists()) {
            $this->command->info('Active ZRA configuration already exists. Skipping seeder.');
            return;
        }

        // Create a sandbox ZRA configuration
        ZraConfiguration::create([
            'environment' => 'sandbox',
            'api_base_url' => 'https://sandbox-api.zra.org.zm/v1',
            'api_version' => '1.0',
            'client_id' => encrypt('sandbox_client_id'),
            'client_secret' => encrypt('sandbox_client_secret'),
            'api_key' => encrypt('sandbox_api_key'),
            'taxpayer_tpin' => '1234567890',
            'taxpayer_name' => 'TekRem ERP Sandbox',
            'taxpayer_address' => 'Sandbox Address, Lusaka, Zambia',
            'taxpayer_phone' => '+260XXX000000',
            'taxpayer_email' => 'sandbox@tekrem.com',
            'tax_rates' => [
                'default' => 16.0,
                'standard' => 16.0,
                'zero_rated' => 0.0,
                'exempt' => 0.0,
            ],
            'invoice_settings' => [
                'auto_numbering' => true,
                'number_prefix' => 'INV',
                'number_format' => 'INV-{year}-{month}-{sequence}',
                'decimal_places' => 2,
            ],
            'auto_submit' => false,
            'require_approval' => true,
            'max_retry_attempts' => 3,
            'retry_delay_minutes' => 5,
            'is_active' => true,
            'health_check_config' => [
                'enabled' => true,
                'interval_minutes' => 15,
                'timeout_seconds' => 10,
            ],
            'health_status' => 'unknown',
            'health_details' => [
                'message' => 'Configuration created, health check pending',
                'created_at' => now()->toISOString(),
            ],
        ]);

        $this->command->info('Sandbox ZRA configuration created successfully.');
    }
}