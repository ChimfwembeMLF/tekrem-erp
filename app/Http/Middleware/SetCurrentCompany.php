<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\Company;

class SetCurrentCompany
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user) {
            return $next($request);
        }

        // Determine current company (from session, subdomain, or default to first)
        $companyId = Session::get('current_company_id');
        if (!$companyId && $user->companies()->exists()) {
            $companyId = $user->companies()->first()->id;
            Session::put('current_company_id', $companyId);
        }

        if ($companyId) {
            $company = Company::find($companyId);
            if ($company && $user->companies->contains($company)) {
                app()->instance('currentCompany', $company);
            }
        }

        return $next($request);
    }
}
