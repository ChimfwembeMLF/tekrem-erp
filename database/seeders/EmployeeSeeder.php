<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\HR\Employee;
use Spatie\Permission\Models\Role;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        $team = [
            [
                'name' => 'Chimfwembe Kangwa',
                'email' => 'chimfwembe@company.com',
                'role' => 'superuser',
            ],
            [
                'name' => 'Joseph Banda',
                'email' => 'josephh@company.com',
                'role' => 'operations',
            ],
            [
                'name' => 'Fackson Kangwa',
                'email' => 'fackson@company.com',
                'role' => 'designer',
            ],
            [
                'name' => 'Joel B. Chamana',
                'email' => 'joel@company.com',
                'role' => 'marketing',
            ],
            [
                'name' => 'Joseph Banda',
                'email' => 'josephl@company.com',
                'role' => 'sales',
            ],
            [
                'name' => 'Temwani Tembo',
                'email' => 'temwani@company.com',
                'role' => 'project_manager',
            ],
            [
                'name' => 'Sevier Banda',
                'email' => 'sevier@company.com',
                'role' => 'creative',
            ],
        ];

        // Create roles if not exist
        $roles = [
            'superuser', 'operations', 'designer', 'marketing', 'sales', 'project_manager', 'creative'
        ];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        foreach ($team as $member) {
            $user = User::firstOrCreate(
                ['email' => $member['email']],
                [
                    'name' => $member['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles([$member['role']]);
            Employee::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_id' => strtoupper(substr($member['name'], 0, 2)) . rand(100, 999),
                    'department_id' => 1,
                    'job_title' => $member['role'],
                    'employment_type' => 'full_time',
                    'employment_status' => 'active',
                    'hire_date' => now(),
                    'salary' => rand(8000, 20000),
                    'pay_frequency' => 'monthly',
                ]
            );
        }
    }
}
