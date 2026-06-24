<?php

namespace App\Console\Commands;

use App\Services\HR\PayrollAutoGenerationService;
use Illuminate\Console\Command;

class GeneratePayrollCommand extends Command
{
    protected $signature = 'payroll:generate
                            {--period= : Pay period in YYYY-MM format (defaults to previous month)}
                            {--employee= : Generate for a single employee ID only}
                            {--force : Regenerate even if payroll already exists for the period}
                            {--scheduled : Only run when today matches payroll start day and auto-generation is enabled}';

    protected $description = 'Auto-generate payroll records for active employees';

    public function handle(PayrollAutoGenerationService $service): int
    {
        if ($this->option('scheduled')) {
            $result = $service->runScheduled();

            if ($result === null) {
                $this->info('Scheduled payroll generation skipped (not due today or disabled in HR settings).');

                return self::SUCCESS;
            }

            $this->reportResult($result);

            return $result['failed'] > 0 ? self::FAILURE : self::SUCCESS;
        }

        $period = $this->option('period') ?: $service->defaultPeriod();
        $employeeId = $this->option('employee') ? (int) $this->option('employee') : null;
        $force = (bool) $this->option('force');

        if (!preg_match('/^\d{4}-\d{2}$/', $period)) {
            $this->error('Period must be in YYYY-MM format.');

            return self::FAILURE;
        }

        $this->info("Generating payroll for period {$period}...");

        $result = $service->generateForPeriod($period, $employeeId, $force);
        $this->reportResult($result);

        return $result['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * @param  array{period: string, created: int, skipped: int, failed: int, errors: array<int, string>}  $result
     */
    private function reportResult(array $result): void
    {
        $this->table(
            ['Period', 'Created', 'Skipped', 'Failed'],
            [[$result['period'], $result['created'], $result['skipped'], $result['failed']]]
        );

        foreach ($result['errors'] as $error) {
            $this->warn($error);
        }

        if ($result['created'] > 0) {
            $this->info("Successfully generated {$result['created']} payroll record(s).");
        }
    }
}
