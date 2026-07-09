<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SEED_ADMIN_EMAIL', 'admin@Tekrem.com');
        $name = env('SEED_ADMIN_NAME', 'Administrator');
        $password = env('SEED_ADMIN_PASSWORD');

        $existingAdmin = User::role('admin')->first();

        if ($existingAdmin) {
            if (!$existingAdmin->hasRole('admin')) {
                $existingAdmin->assignRole('admin');
            }

            $this->command->info("Using existing admin: {$existingAdmin->email}");

            return;
        }

        if (!$password) {
            $this->command->warn('No admin user found and SEED_ADMIN_PASSWORD is not set.');
            $this->command->line('Set SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and optionally SEED_ADMIN_NAME in .env, then re-run.');

            return;
        }

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
            ]
        );

        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
        if (!$admin->hasRole('super_user')) {
            $admin->assignRole('super_user');
        }

        $this->command->info("Admin user ready: {$email}");
    }
}
