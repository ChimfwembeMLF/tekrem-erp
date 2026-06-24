<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\HR\Attendance;
use App\Models\HR\Employee;
use App\Models\HR\Leave;
use App\Models\HR\LeaveType;
use App\Models\HR\Payroll;
use App\Services\HR\HrActionQueueService;
use App\Services\HR\StaffAccessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffPortalController extends Controller
{
    public function __construct(private StaffAccessService $staffAccess) {}

    public function index(Request $request): Response
    {
        $employee = $request->attributes->get('staffEmployee');
        $employee->load(['department', 'manager.user']);

        $leaveBalances = LeaveType::active()
            ->orderBy('name')
            ->get()
            ->map(fn (LeaveType $type) => [
                'id' => $type->id,
                'name' => $type->name,
                'color' => $type->color,
                ...$type->getLeaveBalance($employee),
            ]);

        $recentLeaves = Leave::with('leaveType')
            ->where('employee_id', $employee->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Leave $leave) => [
                'id' => $leave->id,
                'status' => $leave->status,
                'start_date' => $leave->start_date?->format('Y-m-d'),
                'end_date' => $leave->end_date?->format('Y-m-d'),
                'leave_type' => $leave->leaveType ? ['name' => $leave->leaveType->name] : null,
            ]);

        $recentAttendance = Attendance::where('employee_id', $employee->id)
            ->latest('date')
            ->limit(7)
            ->get()
            ->map(fn (Attendance $row) => [
                'date' => $row->date?->format('Y-m-d'),
                'status' => $row->status,
                'clock_in' => $row->clock_in?->format('H:i'),
                'clock_out' => $row->clock_out?->format('H:i'),
            ]);

        $recentPayslips = Payroll::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->latest('period')
            ->limit(3)
            ->get(['id', 'period', 'amount', 'status', 'approved_at']);

        $managerQueue = app(HrActionQueueService::class)->managerQueue($request->user());

        return Inertia::render('Staff/Dashboard', [
            'employee' => [
                'id' => $employee->id,
                'employee_id' => $employee->employee_id,
                'job_title' => $employee->job_title,
                'department' => $employee->department?->name,
                'manager' => $employee->manager?->full_name,
                'emergency_contact_name' => $employee->emergency_contact_name,
                'emergency_contact_phone' => $employee->emergency_contact_phone,
            ],
            'leaveBalances' => $leaveBalances,
            'recentLeaves' => $recentLeaves,
            'recentAttendance' => $recentAttendance,
            'recentPayslips' => $recentPayslips,
            'managerQueue' => $managerQueue,
        ]);
    }
}
