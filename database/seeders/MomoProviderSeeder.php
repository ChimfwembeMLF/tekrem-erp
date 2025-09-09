<?php

namespace Database\Seeders;

use App\Models\Finance\MomoProvider;
use App\Models\Finance\Account;
use Illuminate\Database\Seeder;

class MomoProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default accounts for MoMo providers if they don't exist
        $mtnCashAccount = Account::firstOrCreate([
            'account_code' => 'CASH-MTN',
        ], [
            'name' => 'MTN MoMo Cash Account',
            'type' => 'cash',
            'account_category' => 'assets',
            'normal_balance' => 'debit',
            'currency' => 'ZMW',
            'description' => 'MTN Mobile Money cash account',
            'is_active' => true,
            'user_id' => 1,
        ]);

        $airtelCashAccount = Account::firstOrCreate([
            'account_code' => 'CASH-AIRTEL',
        ], [
            'name' => 'Airtel Money Cash Account',
            'type' => 'cash',
            'account_category' => 'assets',
            'normal_balance' => 'debit',
            'currency' => 'ZMW',
            'description' => 'Airtel Money cash account',
            'is_active' => true,
            'user_id' => 1,
        ]);

        $zamtelCashAccount = Account::firstOrCreate([
            'account_code' => 'CASH-ZAMTEL',
        ], [
            'name' => 'Zamtel Money Cash Account',
            'type' => 'cash',
            'account_category' => 'assets',
            'normal_balance' => 'debit',
            'currency' => 'ZMW',
            'description' => 'Zamtel Money cash account',
            'is_active' => true,
            'user_id' => 1,
        ]);

        $feeAccount = Account::firstOrCreate([
            'account_code' => 'EXP-MOMO-FEES',
        ], [
            'name' => 'Mobile Money Transaction Fees',
            'type' => 'expense',
            'account_category' => 'expenses',
            'normal_balance' => 'debit',
            'currency' => 'ZMW',
            'description' => 'Mobile money transaction processing fees',
            'is_active' => true,
            'user_id' => 1,
        ]);

        $receivableAccount = Account::firstOrCreate([
            'account_code' => 'AR-MOMO',
        ], [
            'name' => 'Mobile Money Receivables',
            'type' => 'asset',
            'account_category' => 'assets',
            'normal_balance' => 'debit',
            'currency' => 'ZMW',
            'description' => 'Pending mobile money receivables',
            'is_active' => true,
            'user_id' => 1,
        ]);

        // Create MTN MoMo provider
        MomoProvider::firstOrCreate([
            'code' => 'mtn',
        ], [
            'name' => 'MTN MoMo',
            'display_name' => 'MTN Mobile Money',
            'currency' => 'ZMW',
            'is_active' => true,
            'is_sandbox' => true,
            'api_base_url' => 'https://api.mtn.com/v1/',
            'sandbox_api_base_url' => 'https://sandbox.momodeveloper.mtn.com/',
            'min_transaction_amount' => 1.00,
            'max_transaction_amount' => 50000.00,
            'daily_transaction_limit' => 100000.00,
            'transaction_fee_percentage' => 1.5,
            'fixed_transaction_fee' => 0.50,
            'cash_account_id' => $mtnCashAccount->id,
            'fee_account_id' => $feeAccount->id,
            'receivable_account_id' => $receivableAccount->id,
            'provider_settings' => [
                'collection_enabled' => true,
                'disbursement_enabled' => true,
                'callback_version' => 'v1',
                'timeout_seconds' => 30,
                'retry_attempts' => 3,
            ],
        ]);

        // Create Airtel Money provider
        MomoProvider::firstOrCreate([
            'code' => 'airtel',
        ], [
            'name' => 'Airtel Money',
            'display_name' => 'Airtel Money',
            'currency' => 'ZMW',
            'is_active' => true,
            'is_sandbox' => true,
            'api_base_url' => 'https://api.airtel.africa/v1/',
            'sandbox_api_base_url' => 'https://sandbox.airtel.africa/v1/',
            'min_transaction_amount' => 1.00,
            'max_transaction_amount' => 50000.00,
            'daily_transaction_limit' => 100000.00,
            'transaction_fee_percentage' => 1.5,
            'fixed_transaction_fee' => 0.50,
            'cash_account_id' => $airtelCashAccount->id,
            'fee_account_id' => $feeAccount->id,
            'receivable_account_id' => $receivableAccount->id,
            'provider_settings' => [
                'collection_enabled' => true,
                'disbursement_enabled' => true,
                'callback_version' => 'v1',
                'timeout_seconds' => 30,
                'retry_attempts' => 3,
            ],
        ]);

        // Create Zamtel Money provider
        MomoProvider::firstOrCreate([
            'code' => 'zamtel',
        ], [
            'name' => 'Zamtel Money',
            'display_name' => 'Zamtel Money',
            'currency' => 'ZMW',
            'is_active' => true,
            'is_sandbox' => true,
            'api_base_url' => 'https://api.zamtel.zm/v1/',
            'sandbox_api_base_url' => 'https://sandbox.zamtel.zm/v1/',
            'min_transaction_amount' => 1.00,
            'max_transaction_amount' => 50000.00,
            'daily_transaction_limit' => 100000.00,
            'transaction_fee_percentage' => 1.5,
            'fixed_transaction_fee' => 0.50,
            'cash_account_id' => $zamtelCashAccount->id,
            'fee_account_id' => $feeAccount->id,
            'receivable_account_id' => $receivableAccount->id,
            'provider_settings' => [
                'collection_enabled' => true,
                'disbursement_enabled' => true,
                'callback_version' => 'v1',
                'timeout_seconds' => 30,
                'retry_attempts' => 3,
            ],
        ]);

        $this->command->info('Mobile Money providers seeded successfully.');
    }
}
