<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure roles exist
        $roles = [
            'admin',
            'user',
            'super_user',
            'staff',
            'customer',
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $this->createUser(
            'admin@tekrem.com',
            'TekRem Admin',
            'admin'
        );

        $this->createUser(
            'user@tekrem.com',
            'TekRem User',
            'user'
        );

        $this->createUser(
            'super@tekrem.com',
            'TekRem Super User',
            'super_user'
        );

        $this->createUser(
            'admin@acme.com',
            'Acme Admin',
            'admin'
        );

        $this->createUser(
            'admin@globex.com',
            'Globex Admin',
            'admin'
        );

        $this->createUser(
            'staff@tekrem.com',
            'Staff User',
            'staff'
        );

        $this->createUser(
            'customer@tekrem.com',
            'Customer User',
            'customer'
        );
    }

    private function createUser(string $email, string $name, string $role): void
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
            ]
        );

        $user->syncRoles([$role]);
    }
}
