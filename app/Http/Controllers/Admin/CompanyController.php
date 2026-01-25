<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CompanyController extends Controller
{
    public function switch(Request $request)
    {
        $request->validate([
            'company_id' => 'required|integer|exists:companies,id',
        ]);

        $user = Auth::user();
        $companyId = $request->input('company_id');


        // Allow super_user and admin to switch to any company
        if (!$user->hasRole(['super_user', 'admin'])) {
            if (!$user->companies->contains('id', $companyId)) {
                abort(403, 'Unauthorized company switch.');
            }
        }

        // Set the current company in the session
        Session::put('current_company_id', $companyId);

        // Optionally, update Inertia shared props or other context if needed

        return redirect()->back()->with('success', 'Company switched successfully.');
    }

        // Show company info/settings page (for admin settings)
    public function showInfo($id)
    {
        $company = \App\Models\Company::findOrFail($id);
        return inertia('Settings/Company', [
            'company' => $company,
        ]);
    }
      // List all companies (superadmin)
    public function index()
    {
        $companies = \App\Models\Company::with('package')->get();
        return inertia('Admin/Companies/Index', [
            'companies' => $companies,
        ]);
    }

    // Show create company form
    public function create()
    {
        $packages = \App\Models\Package::all();
        return inertia('Admin/Companies/Create', [
            'packages' => $packages,
        ]);
    }

    // Store new company
    public function store(Request $request)

    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'package_id' => 'nullable|exists:packages,id',
        ]);

        $company = \App\Models\Company::create($data);
        return redirect()->route('admin.companies.index')->with('success', 'Company created successfully.');
    }

    // Show edit company form
    public function edit($id)
    {
        $company = \App\Models\Company::findOrFail($id);

        $packages = \App\Models\Package::all();
        return inertia('Admin/Companies/Edit', [
            'company' => $company,
            'packages' => $packages,
        ]);
    }

    // Update company
    public function update(Request $request, $id)
    {
        $company = \App\Models\Company::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',

            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'package_id' => 'nullable|exists:packages,id',
        ]);
        $company->update($data);
        return redirect()->route('admin.companies.index')->with('success', 'Company updated successfully.');
    }

    // Delete company

    public function destroy($id)
    {
        $company = \App\Models\Company::findOrFail($id);
        $company->delete();
        return redirect()->route('admin.companies.index')->with('success', 'Company deleted successfully.');
    }

    // Show company details (optional, not used in UI yet)
    public function show($id)
    {
        $company = \App\Models\Company::with('package')->findOrFail($id);
        return inertia('Admin/Companies/Show', [
            'company' => $company,
        ]);

    }

    // Update company info from settings page (admin)
    public function updateInfo(Request $request, $id)
    {
        $company = \App\Models\Company::findOrFail($id);
        $data = $request->validate([

            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
        ]);
        $company->update($data);
        return redirect()->back()->with('success', 'Company info updated successfully.');
    }
}
