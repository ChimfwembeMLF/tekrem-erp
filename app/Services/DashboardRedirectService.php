<?php

namespace App\Services;

use App\Models\User;

class DashboardRedirectService
{
    /**
     * Resolve the best home dashboard route for a user.
     */
    public function resolve(User $user): string
    {
        if ($user->hasRole('customer')) {
            return route('customer.dashboard');
        }

        if ($user->hasAnyRole(['admin', 'super_user', 'manager'])) {
            return route('dashboard');
        }

        $moduleRoutes = [
            'view hr' => 'hr.dashboard',
            'view finance' => 'finance.dashboard',
            'view support' => 'support.dashboard',
            'view projects' => 'projects.dashboard',
            'view crm' => 'crm.dashboard',
            'view inventory' => 'inventory.dashboard',
            'view procurement' => 'procurement.dashboard',
            'view sales orders' => 'sales.dashboard',
            'access pos' => 'pos.index',
            'view ecommerce' => 'ecommerce.dashboard',
        ];

        $accessible = [];
        foreach ($moduleRoutes as $permission => $routeName) {
            if ($user->can($permission)) {
                $accessible[] = $routeName;
            }
        }

        $unique = array_values(array_unique($accessible));
        if (count($unique) === 1) {
            return route($unique[0]);
        }

        return route('dashboard');
    }
}
