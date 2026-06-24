<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Attendance;
use App\Models\HR\Employee;
use App\Services\HR\OfficeLocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StaffClockController extends Controller
{
    public function __construct(
        private readonly OfficeLocationService $officeLocation
    ) {}

    /**
     * Self-service clock in for the authenticated staff member.
     */
    public function clockIn(Request $request): RedirectResponse
    {
        $employee = $this->resolveEmployee();
        $coordinates = $this->validateCoordinates($request);

        if (! $this->officeLocation->isWithinAllowedArea($coordinates['latitude'], $coordinates['longitude'])) {
            return back()->withErrors([
                'clock' => 'You must be at the office to clock in. Your current location is outside the allowed area.',
            ]);
        }

        $today = now()->format('Y-m-d');
        $location = $this->formatLocationPayload($coordinates);

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if ($attendance && $attendance->clock_in) {
            return back()->withErrors(['clock' => 'You have already clocked in today.']);
        }

        if ($attendance) {
            $attendance->clockIn($location, $request->ip());
        } else {
            Attendance::create([
                'employee_id' => $employee->id,
                'date' => $today,
                'clock_in' => now(),
                'status' => 'present',
                'location' => $location,
                'ip_address' => $request->ip(),
            ]);
        }

        return back()->with('success', 'Clocked in successfully.');
    }

    /**
     * Self-service clock out for the authenticated staff member.
     */
    public function clockOut(Request $request): RedirectResponse
    {
        $employee = $this->resolveEmployee();
        $coordinates = $this->validateCoordinates($request);

        if (! $this->officeLocation->isWithinAllowedArea($coordinates['latitude'], $coordinates['longitude'])) {
            return back()->withErrors([
                'clock' => 'You must be at the office to clock out. Your current location is outside the allowed area.',
            ]);
        }

        $today = now()->format('Y-m-d');

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if (! $attendance || ! $attendance->clock_in) {
            return back()->withErrors(['clock' => 'You must clock in before clocking out.']);
        }

        if ($attendance->clock_out) {
            return back()->withErrors(['clock' => 'You have already clocked out today.']);
        }

        $attendance->clockOut();

        return back()->with('success', 'Clocked out successfully.');
    }

    private function resolveEmployee(): Employee
    {
        $employee = auth()->user()?->employee()
            ->where('employment_status', 'active')
            ->first();

        if (! $employee) {
            abort(403, 'No active employee record is linked to your account.');
        }

        return $employee;
    }

    /**
     * @return array{latitude: float, longitude: float}
     */
    private function validateCoordinates(Request $request): array
    {
        return $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);
    }

    /**
     * @param  array{latitude: float, longitude: float}  $coordinates
     */
    private function formatLocationPayload(array $coordinates): string
    {
        return json_encode([
            'latitude' => $coordinates['latitude'],
            'longitude' => $coordinates['longitude'],
            'captured_at' => now()->toIso8601String(),
        ], JSON_THROW_ON_ERROR);
    }
}
