<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@Tekrem.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        // Create staff user
        $staff = User::firstOrCreate(
            ['email' => 'staff@Tekrem.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('password'),
            ]
        );
        if (!$staff->hasRole('staff')) {
            $staff->assignRole('staff');
        }

        // Create customer user
        $customer = User::firstOrCreate(
            ['email' => 'customer@Tekrem.com'],
            [
                'name' => 'Customer User',
                'password' => Hash::make('password'),
            ]
        );
        if (!$customer->hasRole('customer')) {
            $customer->assignRole('customer');
        }
    }
}
