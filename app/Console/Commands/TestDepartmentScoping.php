<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\HR\Employee;
use App\Models\HR\Department;

class TestDepartmentScoping extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:department-scoping {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test department scoping functionality';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email') ?? 'staff@tekrem.com';
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found!");
            return 1;
        }

        $this->info("Testing department scoping for: {$user->name} ({$user->email})");
        $this->info("Roles: " . $user->roles->pluck('name')->implode(', '));
        
        // Show user's departments
        $this->newLine();
        $this->info("User's Departments:");
        if ($user->departments->isEmpty()) {
            $this->warn("  ⚠️  User is not assigned to any departments");
        } else {
            foreach ($user->departments as $dept) {
                $this->line("  • {$dept->name} ({$dept->code})");
            }
        }

        // Show relevant permissions
        $this->newLine();
        $this->info("Department Permissions:");
        $this->line("  • view all departments: " . ($user->hasPermissionTo('view all departments') ? '✓ YES' : '✗ NO'));
        $this->line("  • view own department: " . ($user->hasPermissionTo('view own department') ? '✓ YES' : '✗ NO'));
        $this->line("  • view employees: " . ($user->hasPermissionTo('view employees') ? '✓ YES' : '✗ NO'));

        // Test employee scoping
        $this->newLine();
        $this->info("Employee Access Test:");
        
        $totalEmployees = Employee::count();
        $this->line("  Total employees in system: {$totalEmployees}");
        
        $scopedEmployees = Employee::forUserDepartments($user)->count();
        $this->line("  Employees user can access: {$scopedEmployees}");
        
        if ($user->hasRole(['super_user', 'admin']) || $user->hasPermissionTo('view all departments')) {
            $this->info("  ✓ User has unrestricted access (admin/manager)");
        } else {
            $this->warn("  ⚠️  User has department-restricted access");
        }

        // Show sample employees
        $this->newLine();
        $employees = Employee::forUserDepartments($user)
            ->with(['user', 'department'])
            ->take(5)
            ->get();

        if ($employees->isEmpty()) {
            $this->warn("No employees accessible to this user");
        } else {
            $this->info("Sample Accessible Employees:");
            $this->table(
                ['ID', 'Name', 'Job Title', 'Department'],
                $employees->map(fn($e) => [
                    $e->id,
                    $e->user->name ?? 'N/A',
                    $e->job_title ?? 'N/A',
                    $e->department->name ?? 'No Department'
                ])
            );
        }

        // Test specific employee access
        $this->newLine();
        $randomEmployee = Employee::inRandomOrder()->first();
        if ($randomEmployee) {
            $canAccess = $randomEmployee->isAccessibleByUser($user);
            $this->info("Random Employee Test:");
            $this->line("  Employee: {$randomEmployee->user->name} (Dept: {$randomEmployee->department->name})");
            $this->line("  Can access: " . ($canAccess ? '✓ YES' : '✗ NO'));
        }

        $this->newLine();
        $this->info("✅ Department scoping test completed!");

        return 0;
    }
}
