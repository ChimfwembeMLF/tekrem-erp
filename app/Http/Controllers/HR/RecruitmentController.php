<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Department;
use App\Models\HR\JobApplication;
use App\Services\HR\StaffAccessService;
use App\Models\HR\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RecruitmentController extends Controller
{
    public function index(Request $request)
    {
        JobPosting::closeExpired();

        $postings = JobPosting::with(['department', 'applications'])
            ->withCount('applications')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $pipeline = [
            'draft' => JobPosting::where('status', 'draft')->count(),
            'published' => JobPosting::where('status', 'published')->count(),
            'closed' => JobPosting::where('status', 'closed')->count(),
            'applications' => JobApplication::count(),
            'interviews' => JobApplication::where('status', 'interview')->count(),
        ];

        return Inertia::render('HR/Recruitment/Index', [
            'postings' => $postings,
            'pipeline' => $pipeline,
            'filters' => $request->only('status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('HR/Recruitment/Create', [
            'departments' => Department::active()->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'nullable|exists:hr_departments,id',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'required|in:full_time,part_time,contract,internship',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'salary_range' => 'nullable|string|max:255',
            'closes_at' => 'nullable|date|after_or_equal:today',
        ]);

        $slug = Str::slug($data['title']);
        $base = $slug;
        $i = 1;
        while (JobPosting::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i;
            $i++;
        }

        $posting = JobPosting::create([
            ...$data,
            'slug' => $slug,
            'status' => 'draft',
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('hr.recruitment.show', $posting)->with('success', 'Job posting created.');
    }

    public function show(JobPosting $recruitment)
    {
        JobPosting::closeExpired();
        $recruitment->refresh();

        $recruitment->load(['department', 'applications' => fn ($q) => $q->latest('applied_at')]);

        return Inertia::render('HR/Recruitment/Show', [
            'posting' => $recruitment,
            'applicationsByStatus' => $recruitment->applications->groupBy('status'),
            'isPubliclyVisible' => $recruitment->isPubliclyVisible(),
        ]);
    }

    public function edit(JobPosting $recruitment)
    {
        return Inertia::render('HR/Recruitment/Edit', [
            'posting' => $recruitment,
            'departments' => Department::active()->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, JobPosting $recruitment)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'nullable|exists:hr_departments,id',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'required|in:full_time,part_time,contract,internship',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'salary_range' => 'nullable|string|max:255',
            'closes_at' => 'nullable|date|after_or_equal:today',
        ]);

        $recruitment->update($data);

        return redirect()->route('hr.recruitment.show', $recruitment)->with('success', 'Job posting updated.');
    }

    public function destroy(JobPosting $recruitment)
    {
        $recruitment->delete();

        return redirect()->route('hr.recruitment.index')->with('success', 'Job posting deleted.');
    }

    public function publish(JobPosting $recruitment)
    {
        if ($recruitment->closes_at?->isPast()) {
            return back()->with('error', 'Application deadline is in the past. Update the closing date before publishing.');
        }

        $recruitment->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return back()->with('success', 'Job published to career portal.');
    }

    public function close(JobPosting $recruitment)
    {
        $recruitment->update(['status' => 'closed']);

        return back()->with('success', 'Job posting closed.');
    }

    public function showApplication(JobApplication $application)
    {
        $application->load(['jobPosting.department', 'employee.user']);

        return Inertia::render('HR/Recruitment/ApplicationShow', [
            'application' => [
                'id' => $application->id,
                'first_name' => $application->first_name,
                'last_name' => $application->last_name,
                'email' => $application->email,
                'phone' => $application->phone,
                'cover_letter' => $application->cover_letter,
                'status' => $application->status,
                'notes' => $application->notes,
                'applied_at' => $application->applied_at?->toISOString(),
                'has_resume' => (bool) $application->resume_path,
                'resume_url' => $application->resume_path
                    ? route('hr.recruitment.applications.resume', $application)
                    : null,
                'employee' => $application->employee ? [
                    'id' => $application->employee->id,
                    'name' => $application->employee->full_name,
                    'employee_id' => $application->employee->employee_id,
                    'url' => route('hr.employees.show', $application->employee),
                ] : null,
                'create_employee_url' => route('hr.employees.create', [
                    'application_id' => $application->id,
                    'email' => $application->email,
                    'name' => $application->full_name,
                ]),
                'job_posting' => [
                    'id' => $application->jobPosting->id,
                    'title' => $application->jobPosting->title,
                    'slug' => $application->jobPosting->slug,
                    'department' => $application->jobPosting->department
                        ? ['name' => $application->jobPosting->department->name]
                        : null,
                ],
            ],
        ]);
    }

    public function downloadResume(JobApplication $application): StreamedResponse
    {
        if (!$application->resume_path || !Storage::disk('public')->exists($application->resume_path)) {
            abort(404, 'Resume not found.');
        }

        $filename = basename($application->resume_path);

        return Storage::disk('public')->download(
            $application->resume_path,
            "{$application->full_name}-resume-{$filename}",
        );
    }

    public function updateApplication(Request $request, JobApplication $application)
    {
        $data = $request->validate([
            'status' => 'required|in:applied,screening,interview,offer,hired,rejected',
            'notes' => 'nullable|string|max:5000',
        ]);

        $application->update($data);

        if ($data['status'] === 'hired') {
            app(StaffAccessService::class)->linkApplicationToEmployee($application->fresh());
        }

        return back()->with('success', 'Application updated.');
    }
}
