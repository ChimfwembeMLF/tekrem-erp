<?php

namespace App\Policies;

use App\Models\User;
use App\Models\HR\Employee;

class EmployeePolicy
{
    /**
     * Determine if the user can view any employees.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view employees');
    }

    /**
     * Determine if the user can view the employee.
     */
    public function view(User $user, Employee $employee): bool
    {
        if (!$user->hasPermissionTo('view employees')) {
            return false;
        }

        // Admins and super users can view all
        if ($user->hasRole(['super_user', 'admin'])) {
            return true;
        }

        // Users with "view all departments" can view all
        if ($user->hasPermissionTo('view all departments')) {
            return true;
        }

        // Check if user belongs to employee's department
        return $user->departments->contains($employee->department_id);
    }

    /**
     * Determine if the user can create employees.
     */
    public function create(User $user): bool
    {
        // Need create permission and either view all departments or belong to at least one department
        if (!$user->hasPermissionTo('create employees')) {
            return false;
        }

        return $user->hasRole(['super_user', 'admin']) 
            || $user->hasPermissionTo('view all departments')
            || $user->departments->isNotEmpty();
    }

    /**
     * Determine if the user can update the employee.
     */
    public function update(User $user, Employee $employee): bool
    {
        if (!$user->hasPermissionTo('edit employees')) {
            return false;
        }

        // Admins and super users can edit all
        if ($user->hasRole(['super_user', 'admin'])) {
            return true;
        }

        // Users with "view all departments" can edit all
        if ($user->hasPermissionTo('view all departments')) {
            return true;
        }

        // Can only edit employees in their department
        return $user->departments->contains($employee->department_id);
    }

    /**
     * Determine if the user can delete the employee.
     */
    public function delete(User $user, Employee $employee): bool
    {
        if (!$user->hasPermissionTo('delete employees')) {
            return false;
        }

        // Admins and super users can delete all
        if ($user->hasRole(['super_user', 'admin'])) {
            return true;
        }

        // Users with "view all departments" can delete all
        if ($user->hasPermissionTo('view all departments')) {
            return true;
        }

        // Can only delete employees in their department
        return $user->departments->contains($employee->department_id);
    }
}
