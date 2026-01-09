<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Finance\Account;
use App\Models\User;
use App\Models\Company;

class ChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();
        \Log::info('ChartOfAccountsSeeder: Companies found: ' . $companies->pluck('name')->join(', '));

        if ($companies->isEmpty()) {
            $this->command->warn('No companies found. Skipping Chart of Accounts seeding.');
            return;
        }

        $this->command->info('Seeding Chart of Accounts for each company...');

        $chartOfAccounts = [
            [
                'name' => 'Assets',
                'account_code' => '1000',
                'type' => 'asset',
                'account_category' => 'assets',
                'account_subcategory' => 'header',
                'normal_balance' => 'debit',
                'is_system_account' => true,
                'allow_manual_entries' => false,
                'level' => 0,
                'children' => [
                    [
                        'name' => 'Current Assets',
                        'account_code' => '1100',
                        'type' => 'asset',
                        'account_category' => 'assets',
                        'account_subcategory' => 'current_assets',
                        'normal_balance' => 'debit',
                        'is_system_account' => true,
                        'allow_manual_entries' => false,
                        'level' => 1,
                        'children' => [
                            [
                                'name' => 'Cash and Cash Equivalents',
                                'account_code' => '1110',
                                'type' => 'cash',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Accounts Receivable',
                                'account_code' => '1120',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Inventory',
                                'account_code' => '1130',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Prepaid Expenses',
                                'account_code' => '1140',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                        ]
                    ],
                    [
                        'name' => 'Fixed Assets',
                        'account_code' => '1200',
                        'type' => 'asset',
                        'account_category' => 'assets',
                        'account_subcategory' => 'fixed_assets',
                        'normal_balance' => 'debit',
                        'is_system_account' => true,
                        'allow_manual_entries' => false,
                        'level' => 1,
                        'children' => [
                            [
                                'name' => 'Property, Plant & Equipment',
                                'account_code' => '1210',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'fixed_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Accumulated Depreciation',
                                'account_code' => '1220',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'fixed_assets',
                                'normal_balance' => 'credit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                        ]
                    ],
                ]
            ],
            // Add Liabilities, Equity, Income, Expenses similarly...
        ];

        foreach ($companies as $company) {
            $user = null;
            if (strtolower($company->slug) === 'tekrem-innovation-solutions' || strtolower($company->name) === 'tekrem innovation solutions') {
                $user = $company->users()->whereHas('roles', function ($query) {
                    $query->where('name', 'super_user');
                })->first();
                \Log::info("ChartOfAccountsSeeder: TekRem company {$company->name}, super_user found: " . ($user ? $user->email : 'none'));
                if (!$user) {
                    $this->command->warn("No super user found for main company {$company->name}. Skipping.");
                    continue;
                }
            } else {
                $user = $company->users()->whereHas('roles', function ($query) {
                    $query->where('name', 'admin');
                })->first();
                \Log::info("ChartOfAccountsSeeder: Company {$company->name}, admin found: " . ($user ? $user->email : 'none'));
                if (!$user) {
                    $this->command->warn("No admin found for company {$company->name}. Skipping.");
                    continue;
                }
            }
            $this->command->info("Seeding Chart of Accounts for company: {$company->name}");
            \Log::info("ChartOfAccountsSeeder: Seeding accounts for company {$company->name} with user {$user->email}");
            $this->createAccountsRecursively($chartOfAccounts, $user->id, $company->id);
        }

        $this->command->info('Chart of Accounts seeded successfully!');
    }

    /**
     * Create accounts recursively with parent-child relationships
     */
    private function createAccountsRecursively(array $accounts, int $userId, int $companyId, ?int $parentId = null): void
    {
        foreach ($accounts as $accountData) {
            $children = $accountData['children'] ?? [];
            unset($accountData['children']);

            $account = Account::create([
                ...$accountData,
                'parent_account_id' => $parentId,
                'user_id' => $userId,
                'company_id' => $companyId,
                'currency' => 'ZMW',
                'is_active' => true,
                'description' => "System generated {$accountData['name']} account",
            ]);

            if (!empty($children)) {
                $this->createAccountsRecursively($children, $userId, $companyId, $account->id);
            }
        }
    }
}
