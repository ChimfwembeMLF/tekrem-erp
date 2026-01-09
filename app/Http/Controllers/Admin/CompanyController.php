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
}
