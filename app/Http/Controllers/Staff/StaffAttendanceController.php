<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\HR\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffAttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $employee = $request->attributes->get('staffEmployee');

        $attendance = Attendance::where('employee_id', $employee->id)
            ->latest('date')
            ->paginate(20)
            ->through(fn (Attendance $row) => [
                'date' => $row->date?->format('Y-m-d'),
                'status' => $row->status,
                'clock_in' => $row->clock_in?->format('H:i'),
                'clock_out' => $row->clock_out?->format('H:i'),
                'total_hours' => $row->total_hours,
            ]);

        return Inertia::render('Staff/Attendance/Index', [
            'attendance' => $attendance,
        ]);
    }
}
