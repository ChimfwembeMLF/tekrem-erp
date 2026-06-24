<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $employee = $request->attributes->get('staffEmployee');
        $employee->load('user');

        return Inertia::render('Staff/Profile', [
            'profile' => [
                'name' => $employee->user?->name,
                'email' => $employee->user?->email,
                'phone' => $employee->phone,
                'job_title' => $employee->job_title,
                'employee_id' => $employee->employee_id,
                'emergency_contact_name' => $employee->emergency_contact_name,
                'emergency_contact_phone' => $employee->emergency_contact_phone,
                'emergency_contact_relationship' => $employee->emergency_contact_relationship,
                'address' => $employee->address,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $employee = $request->attributes->get('staffEmployee');

        $validated = $request->validate([
            'phone' => 'nullable|string|max:30',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:30',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
        ]);

        $employee->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }
}
