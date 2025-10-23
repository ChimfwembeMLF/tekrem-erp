<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Finance\Report;
use App\Models\User;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@tekrem.com')->first();
        
        if (!$adminUser) {
            // If no admin user exists, create reports for the first user
            $adminUser = User::first();
        }

        if (!$adminUser) {
            $this->command->warn('No users found. Please run the user seeder first.');
            return;
        }

        $reports = [
            [
                'name' => 'Monthly Income Statement - October 2025',
                'description' => 'Comprehensive income statement showing revenue, expenses, and profit for October 2025',
                'type' => 'income_statement',
                'status' => 'available',
                'parameters' => [
                    'date_from' => '2025-10-01',
                    'date_to' => '2025-10-31',
                    'format' => 'pdf',
                ],
                'generated_at' => now()->subDays(2),
                'file_path' => 'reports/income_statement_oct_2025.pdf',
                'file_size' => 1024 * 245, // 245KB
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(5),
            ],
            [
                'name' => 'Cash Flow Analysis - Q3 2025',
                'description' => 'Quarterly cash flow analysis showing operating, investing, and financing activities',
                'type' => 'cash_flow',
                'status' => 'available',
                'parameters' => [
                    'date_from' => '2025-07-01',
                    'date_to' => '2025-09-30',
                    'format' => 'pdf',
                ],
                'generated_at' => now()->subDays(4),
                'file_path' => 'reports/cash_flow_q3_2025.pdf',
                'file_size' => 1024 * 189, // 189KB
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(7),
            ],
            [
                'name' => 'Balance Sheet - September 2025',
                'description' => 'Statement of financial position as of September 30, 2025',
                'type' => 'balance_sheet',
                'status' => 'available',
                'parameters' => [
                    'as_of_date' => '2025-09-30',
                    'format' => 'pdf',
                ],
                'generated_at' => now()->subDays(3),
                'file_path' => 'reports/balance_sheet_sep_2025.pdf',
                'file_size' => 1024 * 156, // 156KB
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(10),
            ],
            [
                'name' => 'Expense Analysis by Category - October 2025',
                'description' => 'Detailed breakdown of all expenses by category and department',
                'type' => 'expense_report',
                'status' => 'processing',
                'parameters' => [
                    'date_from' => '2025-10-01',
                    'date_to' => '2025-10-31',
                    'group_by' => 'category',
                    'format' => 'excel',
                ],
                'generated_at' => null,
                'file_path' => null,
                'file_size' => null,
                'created_by' => $adminUser->id,
                'created_at' => now()->subHours(3),
            ],
            [
                'name' => 'Trial Balance - October 2025',
                'description' => 'Complete trial balance showing all account balances for verification',
                'type' => 'trial_balance',
                'status' => 'available',
                'parameters' => [
                    'as_of_date' => '2025-10-09',
                    'include_zero_balances' => false,
                    'format' => 'pdf',
                ],
                'generated_at' => now()->subDays(1),
                'file_path' => 'reports/trial_balance_oct_2025.pdf',
                'file_size' => 1024 * 98, // 98KB
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(2),
            ],
            [
                'name' => 'Chart of Accounts Report',
                'description' => 'Complete listing of all accounts with current balances and hierarchy',
                'type' => 'chart_of_accounts',
                'status' => 'available',
                'parameters' => [
                    'include_inactive' => false,
                    'format' => 'pdf',
                ],
                'generated_at' => now()->subDays(1),
                'file_path' => 'reports/chart_of_accounts.pdf',
                'file_size' => 1024 * 134, // 134KB
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(6),
            ],
            [
                'name' => 'Bank Reconciliation Summary - September 2025',
                'description' => 'Summary of all bank reconciliation activities and status',
                'type' => 'reconciliation_summary',
                'status' => 'available',
                'parameters' => [
                    'date_from' => '2025-09-01',
                    'date_to' => '2025-09-30',
                    'format' => 'pdf',
                ],
                'generated_at' => now()->subDays(5),
                'file_path' => 'reports/reconciliation_summary_sep_2025.pdf',
                'file_size' => 1024 * 87, // 87KB
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(8),
            ],
            [
                'name' => 'Budget vs Actual Analysis - YTD 2025',
                'description' => 'Year-to-date comparison of actual performance against budget',
                'type' => 'budget_analysis',
                'status' => 'pending',
                'parameters' => [
                    'date_from' => '2025-01-01',
                    'date_to' => '2025-10-09',
                    'format' => 'excel',
                ],
                'generated_at' => null,
                'file_path' => null,
                'file_size' => null,
                'created_by' => $adminUser->id,
                'created_at' => now()->subMinutes(30),
            ],
        ];

        foreach ($reports as $reportData) {
            Report::create($reportData);
        }

        $this->command->info('Sample reports created successfully.');
    }
}