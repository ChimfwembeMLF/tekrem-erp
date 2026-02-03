<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\HR\Department;

class DepartmentUserSeeder extends Seeder
{
    /**
     * Seed department-user assignments for testing.
     */
    public function run(): void
    {
        $this->command->info('Assigning users to departments...');

        // Get or create test departments
        $departments = [
            'IT' => Department::firstOrCreate(
                ['code' => 'IT'],
                [
                    'name' => 'Information Technology',
                    'description' => 'IT and software development',
                    'is_active' => true,
                    'company_id' => 1,
                ]
            ),
            'HR' => Department::firstOrCreate(
                ['code' => 'HR'],
                [
                    'name' => 'Human Resources',
                    'description' => 'Human resources and personnel management',
                    'is_active' => true,
                    'company_id' => 1,
                ]
            ),
            'SALES' => Department::firstOrCreate(
                ['code' => 'SALES'],
                [
                    'name' => 'Sales',
                    'description' => 'Sales and business development',
                    'is_active' => true,
                    'company_id' => 1,
                ]
            ),
            'FINANCE' => Department::firstOrCreate(
                ['code' => 'FIN'],
                [
                    'name' => 'Finance',
                    'description' => 'Finance and accounting',
                    'is_active' => true,
                    'company_id' => 1,
                ]
            ),
        ];

        // Assign staff users to specific departments
        $staff = User::where('email', 'staff@tekrem.com')->first();
        if ($staff) {
            $staff->departments()->syncWithoutDetaching($departments['IT']->id);
            $this->command->info('✓ Staff user assigned to IT department');
        }

        // Assign manager to all departments (or specific ones)
        $manager = User::whereHas('roles', function ($query) {
            $query->where('name', 'manager');
        })->first();
        
        if ($manager) {
            // Managers typically don't need department assignments if they have "view all departments" permission
            // But we can assign them for demonstration
            $manager->departments()->syncWithoutDetaching([
                $departments['IT']->id,
                $departments['HR']->id,
                $departments['SALES']->id,
                $departments['FINANCE']->id,
            ]);
            $this->command->info('✓ Manager user assigned to all departments');
        }

        // Create additional test users for different departments
        $this->createDepartmentStaff($departments);

        $this->command->info('Department-user assignments completed!');
    }

    /**
     * Create additional staff for each department.
     */
    private function createDepartmentStaff(array $departments): void
    {
        $staffRole = \Spatie\Permission\Models\Role::where('name', 'staff')->first();

        if (!$staffRole) {
            $this->command->warn('Staff role not found. Run RolesAndPermissionsSeeder first.');
            return;
        }

        // IT Department Staff
        $itStaff = User::firstOrCreate(
            ['email' => 'it.staff@tekrem.com'],
            [
                'name' => 'IT Staff Member',
                'password' => bcrypt('password'),
            ]
        );
        $itStaff->assignRole('staff');
        $itStaff->departments()->syncWithoutDetaching($departments['IT']->id);

        // HR Department Staff
        $hrStaff = User::firstOrCreate(
            ['email' => 'hr.staff@tekrem.com'],
            [
                'name' => 'HR Staff Member',
                'password' => bcrypt('password'),
            ]
        );
        $hrStaff->assignRole('staff');
        $hrStaff->departments()->syncWithoutDetaching($departments['HR']->id);

        // Sales Department Staff
        $salesStaff = User::firstOrCreate(
            ['email' => 'sales.staff@tekrem.com'],
            [
                'name' => 'Sales Staff Member',
                'password' => bcrypt('password'),
            ]
        );
        $salesStaff->assignRole('staff');
        $salesStaff->departments()->syncWithoutDetaching($departments['SALES']->id);

        // Finance Department Staff
        $financeStaff = User::firstOrCreate(
            ['email' => 'finance.staff@tekrem.com'],
            [
                'name' => 'Finance Staff Member',
                'password' => bcrypt('password'),
            ]
        );
        $financeStaff->assignRole('staff');
        $financeStaff->departments()->syncWithoutDetaching($departments['FINANCE']->id);

        $this->command->info('✓ Created department-specific staff users');
    }
}
