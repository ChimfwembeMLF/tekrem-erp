<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait HasDepartmentScope
{
    /**
     * Scope query to user's departments.
     * Admins and super users can see all data.
     * Others are restricted to their departments.
     */
    public function scopeForUserDepartments(Builder $query, User $user): Builder
    {
        // Super users and admins can see everything
        if ($user->hasRole(['super_user', 'admin'])) {
            return $query;
        }

        // Users with "view all departments" permission can see everything
        if ($user->hasPermissionTo('view all departments')) {
            return $query;
        }

        // Get user's department IDs
        $departmentIds = $user->departments->pluck('id')->toArray();

        // If user has no departments, return empty result
        if (empty($departmentIds)) {
            return $query->whereRaw('1 = 0'); // No results
        }

        // Restrict to user's departments
        return $query->whereIn('department_id', $departmentIds);
    }

    /**
     * Scope query to specific department.
     */
    public function scopeForDepartment(Builder $query, int $departmentId): Builder
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope query to multiple departments.
     */
    public function scopeForDepartments(Builder $query, array $departmentIds): Builder
    {
        return $query->whereIn('department_id', $departmentIds);
    }

    /**
     * Check if user can access this record based on department.
     */
    public function isAccessibleByUser(User $user): bool
    {
        // Super users and admins can access everything
        if ($user->hasRole(['super_user', 'admin'])) {
            return true;
        }

        // Users with "view all departments" permission can access everything
        if ($user->hasPermissionTo('view all departments')) {
            return true;
        }

        // Check if user belongs to the record's department
        if (!isset($this->department_id)) {
            return false;
        }

        return $user->departments->contains($this->department_id);
    }
}
