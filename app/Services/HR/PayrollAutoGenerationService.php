<?php

namespace App\Services\HR;

use App\Models\HR\Employee;
use App\Models\HR\Payroll;
use App\Models\User;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PayrollAutoGenerationService
{
    public function __construct(private PayrollService $payrollService) {}

    public function autoGenerateEnabled(): bool
    {
        return filter_var(HrSettings::payroll('auto_generate_payroll', true), FILTER_VALIDATE_BOOLEAN);
    }

    public function payrollStartDay(): int
    {
        return (int) HrSettings::payroll('payroll_start_day', 1);
    }

    public function shouldRunToday(?Carbon $date = null): bool
    {
        if (!$this->autoGenerateEnabled()) {
            return false;
        }

        $date ??= now();

        return (int) $date->day === $this->payrollStartDay();
    }

    /**
     * Default pay period: previous calendar month (standard payroll cycle).
     */
    public function defaultPeriod(?Carbon $date = null): string
    {
        $date ??= now();

        return $date->copy()->subMonth()->format('Y-m');
    }

    /**
     * @return array{period: string, created: int, skipped: int, failed: int, errors: array<int, string>}
     */
    public function generateForPeriod(string $period, ?int $employeeId = null, bool $force = false): array
    {
        $created = 0;
        $skipped = 0;
        $failed = 0;
        $errors = [];

        $query = Employee::query()->active()->whereNotNull('salary')->where('salary', '>', 0);

        if ($employeeId) {
            $query->where('id', $employeeId);
        }

        $employees = $query->with('user')->get();

        foreach ($employees as $employee) {
            $exists = Payroll::query()
                ->where('employee_id', $employee->id)
                ->where('period', $period)
                ->exists();

            if ($exists && !$force) {
                $skipped++;
                continue;
            }

            if ($exists && $force) {
                Payroll::query()
                    ->where('employee_id', $employee->id)
                    ->where('period', $period)
                    ->where('status', 'pending')
                    ->delete();
            }

            try {
                $this->payrollService->processPayroll($employee, $period);
                $created++;
            } catch (\Throwable $e) {
                $failed++;
                $name = $employee->user?->name ?? "Employee #{$employee->id}";
                $errors[] = "{$name}: {$e->getMessage()}";
                Log::error('Payroll auto-generation failed', [
                    'employee_id' => $employee->id,
                    'period' => $period,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $result = compact('period', 'created', 'skipped', 'failed', 'errors');
        $result['period'] = $period;

        if ($created > 0) {
            $this->notifyHrStaff($result);
        }

        return $result;
    }

    /**
     * @return array{period: string, created: int, skipped: int, failed: int, errors: array<int, string>}|null
     */
    public function runScheduled(?Carbon $date = null): ?array
    {
        if (!$this->shouldRunToday($date)) {
            return null;
        }

        $period = $this->defaultPeriod($date);

        return $this->generateForPeriod($period);
    }

    /**
     * @param  array{period: string, created: int, skipped: int, failed: int, errors: array<int, string>}  $result
     */
    private function notifyHrStaff(array $result): void
    {
        try {
            $users = User::role(['admin', 'super_user', 'staff'])->get();

            NotificationService::notifyUsers(
                $users,
                'payroll_generated',
                "Payroll generated for {$result['period']}: {$result['created']} created, {$result['skipped']} skipped",
                route('hr.payroll.index', ['period' => $result['period']]),
                null
            );
        } catch (\Throwable $e) {
            Log::warning('Payroll generation notification failed: '.$e->getMessage());
        }
    }
}
