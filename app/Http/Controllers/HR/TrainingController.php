<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Training;
use App\Models\HR\TrainingEnrollment;
use App\Models\HR\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TrainingController extends Controller
{
    /**
     * Display a listing of training programs.
     */
    public function index(Request $request): Response
    {
        $companyId = currentCompanyId();
        $query = Training::with(['instructor', 'enrollments'])
            ->withCount('enrollments')
            ->where('company_id', $companyId)
            ->when($request->search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($request->is_mandatory !== null, function ($query) use ($request) {
                $query->where('is_mandatory', $request->boolean('is_mandatory'));
            });

        $trainings = $query->latest()->paginate(15)->withQueryString();
        $categories = Training::where('company_id', $companyId)->distinct()->pluck('category')->filter()->sort()->values();

        return Inertia::render('HR/Training/Index', [
            'trainings' => $trainings,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'type', 'category', 'is_mandatory']),
        ]);
    }

    /**
     * Show the form for creating a new training program.
     */
    public function create(): Response
    {
        $companyId = currentCompanyId();
        $instructors = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'staff']);
        })->orderBy('name')->get(['id', 'name']);
        $categories = Training::where('company_id', $companyId)->distinct()->pluck('category')->filter()->sort()->values();
        return Inertia::render('HR/Training/Create', [
            'instructors' => $instructors,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created training program.
     */
    public function store(Request $request): RedirectResponse
    {
        $companyId = currentCompanyId();
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:internal,external,online,certification',
            'category' => 'nullable|string|max:255',
            'instructor_id' => 'nullable|exists:users,id',
            'provider' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'location' => 'nullable|string|max:255',
            'mode' => 'required|in:in_person,online,hybrid',
            'max_participants' => 'nullable|integer|min:1',
            'cost_per_participant' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'prerequisites' => 'nullable|string',
            'learning_objectives' => 'nullable|string',
            'materials' => 'nullable|array',
            'is_mandatory' => 'boolean',
            'requires_certification' => 'boolean',
            'certification_validity_months' => 'nullable|integer|min:1',
            'attachments' => 'nullable|array',
        ]);
        $validated['company_id'] = $companyId;
        $training = Training::create($validated);
        return redirect()->route('hr.training.show', $training)
            ->with('success', 'Training program created successfully.');
    }

    /**
     * Display the specified training program.
     */
    public function show(Training $training): Response
    {
        $companyId = currentCompanyId();
        if ($training->company_id !== $companyId) {
            abort(403);
        }
        $training->load(['instructor', 'enrollments.employee.user']);
        return Inertia::render('HR/Training/Show', [
            'training' => $training,
        ]);
    }

    /**
     * Show the form for editing the training program.
     */
    public function edit(Training $training): Response
    {
        $companyId = currentCompanyId();
        if ($training->company_id !== $companyId) {
            abort(403);
        }
        $training->load(['instructor']);
        $instructors = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'staff']);
        })->orderBy('name')->get(['id', 'name']);
        $categories = Training::where('company_id', $companyId)->distinct()->pluck('category')->filter()->sort()->values();
        return Inertia::render('HR/Training/Edit', [
            'training' => $training,
            'instructors' => $instructors,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified training program.
     */
    public function update(Request $request, Training $training): RedirectResponse
    {
        $companyId = currentCompanyId();
        if ($training->company_id !== $companyId) {
            abort(403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:internal,external,online,certification',
            'category' => 'nullable|string|max:255',
            'instructor_id' => 'nullable|exists:users,id',
            'provider' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'location' => 'nullable|string|max:255',
            'mode' => 'required|in:in_person,online,hybrid',
            'max_participants' => 'nullable|integer|min:1',
            'cost_per_participant' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'prerequisites' => 'nullable|string',
            'learning_objectives' => 'nullable|string',
            'materials' => 'nullable|array',
            'is_mandatory' => 'boolean',
            'requires_certification' => 'boolean',
            'certification_validity_months' => 'nullable|integer|min:1',
            'attachments' => 'nullable|array',
        ]);
        $training->update($validated);
        return redirect()->route('hr.training.show', $training)
            ->with('success', 'Training program updated successfully.');
    }

    /**
     * Remove the specified training program.
     */
    public function destroy(Training $training): RedirectResponse
    {
        $companyId = currentCompanyId();
        if ($training->company_id !== $companyId) {
            abort(403);
        }
        if ($training->enrollments()->exists()) {
            return back()->withErrors(['training' => 'Cannot delete training with enrollments.']);
        }
        $training->delete();
        return redirect()->route('hr.training.index')
            ->with('success', 'Training program deleted successfully.');
    }

    /**
     * Enroll an employee in training.
     */
    public function enroll(Request $request, Training $training): RedirectResponse
    {
        $companyId = currentCompanyId();
        if ($training->company_id !== $companyId) {
            abort(403);
        }
        $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
        ]);
        $employee = Employee::where('company_id', $companyId)->findOrFail($request->employee_id);
        if (!$training->canEnroll($employee)) {
            return back()->withErrors(['enrollment' => 'Employee cannot be enrolled in this training.']);
        }
        $enrollment = $training->enrollEmployee($employee);
        if (!$enrollment) {
            return back()->withErrors(['enrollment' => 'Failed to enroll employee in training.']);
        }
        return back()->with('success', 'Employee enrolled successfully.');
    }

    /**
     * Complete training for an employee.
     */
    public function complete(Request $request, Training $training): RedirectResponse
    {
        $companyId = currentCompanyId();
        if ($training->company_id !== $companyId) {
            abort(403);
        }
        $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
            'score' => 'nullable|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);
        $enrollment = TrainingEnrollment::where('training_id', $training->id)
            ->where('employee_id', $request->employee_id)
            ->first();
        if (!$enrollment) {
            return back()->withErrors(['enrollment' => 'Employee is not enrolled in this training.']);
        }
        $enrollment->complete($request->score, $request->score >= 70);
        if ($request->feedback) {
            $enrollment->update(['feedback' => $request->feedback]);
        }
        return back()->with('success', 'Training completed successfully.');
    }
}
