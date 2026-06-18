<?php

namespace App\Http\Controllers;

use App\Models\HR\JobApplication;
use App\Models\HR\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CareerController extends Controller
{
    public function index()
    {
        JobPosting::closeExpired();

        $jobs = JobPosting::published()
            ->with('department')
            ->withCount('applications')
            ->latest('published_at')
            ->get();

        return Inertia::render('Careers/Index', [
            'jobs' => $jobs,
        ]);
    }

    public function show(string $slug)
    {
        JobPosting::closeExpired();

        $job = JobPosting::published()
            ->where('slug', $slug)
            ->with('department')
            ->firstOrFail();

        return Inertia::render('Careers/Show', [
            'job' => $job,
        ]);
    }

    public function apply(Request $request, string $slug)
    {
        JobPosting::closeExpired();

        $job = JobPosting::published()->where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'cover_letter' => 'nullable|string|max:5000',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('careers/resumes', 'public');
        }

        JobApplication::create([
            'job_posting_id' => $job->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'cover_letter' => $data['cover_letter'] ?? null,
            'resume_path' => $resumePath,
            'status' => 'applied',
            'applied_at' => now(),
        ]);

        return back()->with('success', 'Application submitted successfully. We will be in touch soon.');
    }
}
