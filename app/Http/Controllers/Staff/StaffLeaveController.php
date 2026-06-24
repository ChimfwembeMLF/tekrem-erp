<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\HR\Leave;
use App\Models\HR\LeaveType;
use App\Models\User;
use App\Notifications\LeaveStatusChanged;
use App\Services\HR\StaffAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StaffLeaveController extends Controller
{
    public function __construct(private StaffAccessService $staffAccess) {}

    public function index(Request $request): Response
    {
        $employee = $request->attributes->get('staffEmployee');

        $leaves = Leave::with(['leaveType', 'approver'])
            ->where('employee_id', $employee->id)
            ->latest()
            ->paginate(10);

        $balances = LeaveType::active()
            ->orderBy('name')
            ->get()
            ->map(fn (LeaveType $type) => [
                'name' => $type->name,
                'color' => $type->color,
                ...$type->getLeaveBalance($employee),
            ]);

        return Inertia::render('Staff/Leave/Index', [
            'leaves' => $leaves,
            'balances' => $balances,
        ]);
    }

    public function create(Request $request): Response
    {
        $employee = $request->attributes->get('staffEmployee');

        return Inertia::render('Staff/Leave/Create', [
            'leaveTypes' => LeaveType::active()->orderBy('name')->get(['id', 'name', 'color', 'min_notice_days']),
            'balances' => LeaveType::active()->get()->mapWithKeys(
                fn (LeaveType $type) => [$type->id => $type->getLeaveBalance($employee)]
            ),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $employee = $request->attributes->get('staffEmployee');

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:hr_leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
            'is_half_day' => 'boolean',
            'half_day_period' => 'nullable|in:morning,afternoon',
        ]);

        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);
        $workingDays = $this->calculateWorkingDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['is_half_day'] ?? false
        );

        $errors = $leaveType->validateLeaveRequest($workingDays, new \DateTime($validated['start_date']));
        if (!empty($errors)) {
            return back()->withErrors(['validation' => $errors]);
        }

        $balance = $leaveType->getLeaveBalance($employee);
        if ($workingDays > $balance['remaining']) {
            return back()->withErrors([
                'days' => "Insufficient leave balance. Available: {$balance['remaining']} days",
            ]);
        }

        $leave = Leave::create([
            ...$validated,
            'employee_id' => $employee->id,
            'days_requested' => $workingDays,
            'submitted_at' => now(),
            'status' => 'pending',
        ]);

        $this->notifyManagers($leave);

        return redirect()->route('staff.leave.index')
            ->with('success', 'Leave request submitted successfully.');
    }

    private function notifyManagers(Leave $leave): void
    {
        $leave->load(['employee.user', 'employee.manager.user', 'leaveType']);

        $recipients = collect();

        if ($leave->employee?->manager?->user) {
            $recipients->push($leave->employee->manager->user);
        }

        $hrUsers = User::permission('view hr')->get();
        $recipients = $recipients->merge($hrUsers)->unique('id');

        foreach ($recipients as $user) {
            $user->notify(new LeaveStatusChanged($leave, 'submitted'));
        }
    }

    private function calculateWorkingDays(string $startDate, string $endDate, bool $isHalfDay = false): float
    {
        if ($isHalfDay) {
            return 0.5;
        }

        $start = new \DateTime($startDate);
        $end = new \DateTime($endDate);
        $workingDays = 0;

        while ($start <= $end) {
            if (!in_array($start->format('w'), ['0', '6'])) {
                $workingDays++;
            }
            $start->add(new \DateInterval('P1D'));
        }

        return $workingDays;
    }
}
