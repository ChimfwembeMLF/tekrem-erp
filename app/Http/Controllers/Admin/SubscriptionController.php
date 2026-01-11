<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Company;
use App\Models\Package;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        $subscriptions = Subscription::with(['company', 'package'])->latest()->paginate(20);
        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
        ]);
    }

    public function create()
    {
        $companies = Company::all();
        $packages = Package::all();
        return Inertia::render('Admin/Subscriptions/Create', [
            'companies' => $companies,
            'packages' => $packages,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'package_id' => 'required|exists:packages,id',
            'starts_at' => 'required|date',
            'trial_ends_at' => 'nullable|date|after_or_equal:starts_at',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'required',
            'price' => 'nullable|numeric',
            'currency' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ]);
        $subscription = Subscription::create($data);
        $company = Company::find($data['company_id']);
        $company->package_id = $data['package_id'];
        $company->save();
        return redirect()->route('admin.subscriptions.index');
    }

    public function show(Subscription $subscription)
    {
        $subscription->load(['company', 'package']);
        return Inertia::render('Admin/Subscriptions/Show', [
            'subscription' => $subscription,
        ]);
    }

    public function edit(Subscription $subscription)
    {
        $companies = Company::all();
        $packages = Package::all();
        return Inertia::render('Admin/Subscriptions/Edit', [
            'subscription' => $subscription,
            'companies' => $companies,
            'packages' => $packages,
        ]);
    }

    public function update(Request $request, Subscription $subscription)
    {
        $data = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'package_id' => 'required|exists:packages,id',
            'starts_at' => 'required|date',
            'trial_ends_at' => 'nullable|date|after_or_equal:starts_at',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'required',
            'price' => 'nullable|numeric',
            'currency' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ]);
        $subscription->update($data);
        $company = Company::find($data['company_id']);
        $company->package_id = $data['package_id'];
        $company->save();
        return redirect()->route('admin.subscriptions.index');
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();
        return redirect()->route('admin.subscriptions.index');
    }
}
