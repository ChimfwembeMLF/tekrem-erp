<?php

namespace App\Services\HR;

use App\Models\HR\Employee;
use App\Models\HR\JobApplication;
use App\Models\HR\Leave;
use App\Models\User;

class StaffAccessService
{
    public function employeeFor(User $user): ?Employee
    {
        return $user->employee()
            ->where('employment_status', 'active')
            ->first();
    }

    public function isManager(User $user): bool
    {
        $employee = $this->employeeFor($user);

        if (!$employee) {
            return false;
        }

        return Employee::query()
            ->where('manager_id', $employee->id)
            ->where('employment_status', 'active')
            ->exists();
    }

    public function canManageLeave(User $user, Leave $leave): bool
    {
        if ($user->can('view hr')) {
            return true;
        }

        $manager = $this->employeeFor($user);

        if (!$manager) {
            return false;
        }

        return (int) $leave->employee?->manager_id === (int) $manager->id;
    }

    public function linkApplicationToEmployee(JobApplication $application): void
    {
        if ($application->employee_id) {
            return;
        }

        $user = User::where('email', $application->email)->first();

        if ($user?->employee) {
            $application->update(['employee_id' => $user->employee->id]);
        }
    }
}
