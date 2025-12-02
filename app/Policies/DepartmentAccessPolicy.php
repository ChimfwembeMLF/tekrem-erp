<?php

namespace App\Policies;

use App\Models\User;
use App\Models\HR\Department;

class DepartmentAccessPolicy
{
    /**
     * Determine if the user belongs to the given department.
     */
    public function belongsToDepartment(User $user, Department $department): bool
    {
        return $user->departments->contains($department->id);
    }

    /**
     * Determine if the user can access a resource belonging to a department.
     * Accepts a model with a department_id property.
     */
    public function accessDepartmentResource(User $user, $resource): bool
    {
        if (isset($resource->department_id)) {
            return $user->departments->contains($resource->department_id);
        }
        return false;
    }
}
