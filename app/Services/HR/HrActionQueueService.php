<?php

namespace App\Services\HR;

use App\Models\HR\Employee;
use App\Models\HR\Leave;
use App\Models\HR\Onboarding;
use App\Models\HR\Payroll;
use App\Models\HR\Performance;
use App\Models\User;

class HrActionQueueService
{
    /**
     * @return array{pending_leaves: int, overdue_reviews: int, pending_payroll: int, onboarding_due: int, on_leave_today: int}
     */
    public function hrQueue(): array
    {
        return [
            'pending_leaves' => Leave::pending()->count(),
            'overdue_reviews' => Performance::overdue()->count(),
            'pending_payroll' => Payroll::where('status', 'pending')->count(),
            'onboarding_due' => Onboarding::where('status', 'in_progress')->count(),
            'on_leave_today' => Leave::approved()
                ->whereDate('start_date', '<=', today())
                ->whereDate('end_date', '>=', today())
                ->count(),
        ];
    }

    /**
     * @return array{pending_team_leaves: int, team_on_leave_today: int, team_size: int}|null
     */
    public function managerQueue(User $user): ?array
    {
        $employee = $user->employee()->where('employment_status', 'active')->first();

        if (!$employee) {
            return null;
        }

        $subordinateIds = Employee::query()
            ->where('manager_id', $employee->id)
            ->where('employment_status', 'active')
            ->pluck('id');

        if ($subordinateIds->isEmpty()) {
            return null;
        }

        return [
            'pending_team_leaves' => Leave::pending()->whereIn('employee_id', $subordinateIds)->count(),
            'team_on_leave_today' => Leave::approved()
                ->whereIn('employee_id', $subordinateIds)
                ->whereDate('start_date', '<=', today())
                ->whereDate('end_date', '>=', today())
                ->count(),
            'team_size' => $subordinateIds->count(),
        ];
    }

    public function totalHrActions(array $queue): int
    {
        return ($queue['pending_leaves'] ?? 0)
            + ($queue['overdue_reviews'] ?? 0)
            + ($queue['pending_payroll'] ?? 0)
            + ($queue['onboarding_due'] ?? 0);
    }
}
