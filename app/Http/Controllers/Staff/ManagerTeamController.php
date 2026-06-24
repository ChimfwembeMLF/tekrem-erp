<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\HR\Employee;
use App\Models\HR\Leave;
use App\Notifications\LeaveStatusChanged;
use App\Services\HR\StaffAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ManagerTeamController extends Controller
{
    public function __construct(private StaffAccessService $staffAccess) {}

    public function index(Request $request): Response
    {
        $manager = $request->attributes->get('staffEmployee');

        if (!$this->staffAccess->isManager($request->user())) {
            abort(403, 'You do not manage any team members.');
        }

        $subordinateIds = Employee::query()
            ->where('manager_id', $manager->id)
            ->where('employment_status', 'active')
            ->pluck('id');

        $pendingLeaves = Leave::with(['employee.user', 'leaveType'])
            ->pending()
            ->whereIn('employee_id', $subordinateIds)
            ->latest()
            ->get();

        $onLeaveToday = Leave::with(['employee.user', 'leaveType'])
            ->approved()
            ->whereIn('employee_id', $subordinateIds)
            ->whereDate('start_date', '<=', today())
            ->whereDate('end_date', '>=', today())
            ->get();

        $team = Employee::with('user')
            ->whereIn('id', $subordinateIds)
            ->get()
            ->map(fn (Employee $e) => [
                'id' => $e->id,
                'name' => $e->full_name,
                'job_title' => $e->job_title,
                'on_leave' => $onLeaveToday->contains('employee_id', $e->id),
            ]);

        return Inertia::render('Staff/Team/Index', [
            'pendingLeaves' => $pendingLeaves,
            'onLeaveToday' => $onLeaveToday,
            'team' => $team,
        ]);
    }

    public function approve(Request $request, Leave $leave): RedirectResponse
    {
        if (!$this->staffAccess->canManageLeave($request->user(), $leave)) {
            abort(403);
        }

        $request->validate(['approval_notes' => 'nullable|string|max:1000']);

        if (!$leave->approve(Auth::user(), $request->approval_notes)) {
            return back()->withErrors(['leave' => 'Unable to approve this leave request.']);
        }

        $leave->employee?->user?->notify(new LeaveStatusChanged($leave, 'approved'));

        return back()->with('success', 'Leave request approved.');
    }

    public function reject(Request $request, Leave $leave): RedirectResponse
    {
        if (!$this->staffAccess->canManageLeave($request->user(), $leave)) {
            abort(403);
        }

        $request->validate(['rejection_reason' => 'required|string|max:1000']);

        if (!$leave->reject(Auth::user(), $request->rejection_reason)) {
            return back()->withErrors(['leave' => 'Unable to reject this leave request.']);
        }

        $leave->employee?->user?->notify(new LeaveStatusChanged($leave, 'rejected'));

        return back()->with('success', 'Leave request rejected.');
    }
}
