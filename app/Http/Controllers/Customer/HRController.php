<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\HR\Employee;
use App\Models\HR\Leave;
use App\Models\HR\Attendance;
use App\Models\HR\Training;
use App\Models\HR\TrainingEnrollment;
use App\Models\HR\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HRController extends Controller
{
    /**
     * Display customer HR dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Check if user is an employee
        $employee = Employee::where('user_id', $user->id)->with(['department', 'manager.user'])->first();
        
        if (!$employee) {
            return Inertia::render('Customer/HR/Index', [
                'employee' => null,
                'message' => 'You are not registered as an employee in our HR system.',
            ]);
        }

        // Get employee stats
        $stats = [
            'leave_balance' => $this->calculateLeaveBalance($employee),
            'pending_leaves' => $employee->leaves()->pending()->count(),
            'attendance_rate' => $this->calculateAttendanceRate($employee),
            'completed_trainings' => $employee->trainingEnrollments()->completed()->count(),
            'years_of_service' => $employee->years_of_service,
        ];

        // Get recent activities
        $recentLeaves = $employee->leaves()
            ->with(['leaveType'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentTrainings = $employee->trainingEnrollments()
            ->with(['training'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Customer/HR/Index', [
            'employee' => $employee,
            'stats' => $stats,
            'recent_leaves' => $recentLeaves,
            'recent_trainings' => $recentTrainings,
        ]);
    }

    /**
     * Display employee profile.
     */
    public function profile(): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)
            ->with(['department', 'manager.user', 'subordinates.user'])
            ->first();

        if (!$employee) {
            return Inertia::render('Customer/HR/Profile', [
                'employee' => null,
                'message' => 'Employee profile not found.',
            ]);
        }

        return Inertia::render('Customer/HR/Profile', [
            'employee' => $employee,
        ]);
    }

    /**
     * Display employee leave history.
     */
    public function leaves(Request $request): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            abort(404, 'Employee profile not found.');
        }

        $query = $employee->leaves()->with(['leaveType']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('year')) {
            $query->whereYear('start_date', $request->year);
        }

        $leaves = $query->orderBy('created_at', 'desc')->paginate(20);

        // Calculate leave balance
        $leaveBalance = $this->calculateLeaveBalance($employee);

        return Inertia::render('Customer/HR/Leaves', [
            'employee' => $employee,
            'leaves' => $leaves,
            'leave_balance' => $leaveBalance,
            'filters' => $request->only(['status', 'year']),
        ]);
    }

    /**
     * Display employee training history.
     */
    public function trainings(Request $request): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            abort(404, 'Employee profile not found.');
        }

        $query = $employee->trainingEnrollments()->with(['training']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('year')) {
            $query->whereYear('enrolled_at', $request->year);
        }

        $trainings = $query->orderBy('enrolled_at', 'desc')->paginate(20);

        // Get available trainings for enrollment
        $availableTrainings = Training::active()
            ->whereNotIn('id', $employee->trainingEnrollments()->pluck('training_id'))
            ->orderBy('title')
            ->get(['id', 'title', 'description', 'duration', 'type']);

        return Inertia::render('Customer/HR/Trainings', [
            'employee' => $employee,
            'trainings' => $trainings,
            'available_trainings' => $availableTrainings,
            'filters' => $request->only(['status', 'year']),
        ]);
    }

    /**
     * Display employee attendance records.
     */
    public function attendance(Request $request): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            abort(404, 'Employee profile not found.');
        }

        $query = $employee->attendances();

        // Apply filters
        if ($request->filled('month')) {
            $query->whereMonth('date', $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('date', $request->year);
        } else {
            // Default to current year
            $query->whereYear('date', now()->year);
        }

        $attendances = $query->orderBy('date', 'desc')->paginate(31);

        // Calculate attendance stats
        $attendanceStats = [
            'total_days' => $attendances->total(),
            'present_days' => $employee->attendances()
                ->whereYear('date', $request->year ?? now()->year)
                ->whereMonth('date', $request->month ?? now()->month)
                ->where('status', 'present')
                ->count(),
            'late_days' => $employee->attendances()
                ->whereYear('date', $request->year ?? now()->year)
                ->whereMonth('date', $request->month ?? now()->month)
                ->where('status', 'late')
                ->count(),
            'absent_days' => $employee->attendances()
                ->whereYear('date', $request->year ?? now()->year)
                ->whereMonth('date', $request->month ?? now()->month)
                ->where('status', 'absent')
                ->count(),
        ];

        return Inertia::render('Customer/HR/Attendance', [
            'employee' => $employee,
            'attendances' => $attendances,
            'attendance_stats' => $attendanceStats,
            'filters' => $request->only(['month', 'year']),
        ]);
    }

    /**
     * Display team directory.
     */
    public function team(): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            abort(404, 'Employee profile not found.');
        }

        // Get department colleagues
        $colleagues = Employee::where('department_id', $employee->department_id)
            ->where('id', '!=', $employee->id)
            ->where('employment_status', 'active')
            ->with(['user', 'department'])
            ->orderBy('job_title')
            ->get();

        // Get all departments for directory
        $departments = Department::active()
            ->with(['employees.user'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Customer/HR/Team', [
            'employee' => $employee,
            'colleagues' => $colleagues,
            'departments' => $departments,
        ]);
    }

    /**
     * Calculate leave balance for employee.
     */
    private function calculateLeaveBalance(Employee $employee): array
    {
        $currentYear = now()->year;
        
        // This is a simplified calculation - in reality, you'd have leave policies
        $annualLeaveEntitlement = 21; // 21 days per year
        
        $usedLeave = $employee->leaves()
            ->approved()
            ->whereYear('start_date', $currentYear)
            ->sum('days_requested');

        $pendingLeave = $employee->leaves()
            ->pending()
            ->whereYear('start_date', $currentYear)
            ->sum('days_requested');

        return [
            'entitlement' => $annualLeaveEntitlement,
            'used' => $usedLeave,
            'pending' => $pendingLeave,
            'remaining' => $annualLeaveEntitlement - $usedLeave - $pendingLeave,
        ];
    }

    /**
     * Calculate attendance rate for employee.
     */
    private function calculateAttendanceRate(Employee $employee): float
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $totalDays = $employee->attendances()
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->count();

        if ($totalDays === 0) {
            return 0;
        }

        $presentDays = $employee->attendances()
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->whereIn('status', ['present', 'late'])
            ->count();

        return round(($presentDays / $totalDays) * 100, 2);
    }
}
