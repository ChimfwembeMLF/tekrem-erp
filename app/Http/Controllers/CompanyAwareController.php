<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Company;

class CompanyAwareController extends Controller
{
    /**
     * Example: Get current company for the request.
     */
    public function index(Request $request)
    {
        $company = app('currentCompany');
        if (!$company) {
            abort(403, 'No company selected.');
        }
        // Use $company for scoping queries, etc.
        return response()->json([
            'company_id' => $company->id,
            'company_name' => $company->name,
            'user_count' => $company->users()->count(),
        ]);
    }
}
