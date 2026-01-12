<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyHasModule
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $moduleSlug
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $moduleSlug)
    {
        $companyId = session('current_company_id');
        $user = $request->user();
        if (!$user || !$companyId) {
            abort(403, 'No company context.');
        }
        $company = $user->companies()->find($companyId);
        if (!$company || !$company->availableModules()->contains('slug', $moduleSlug)) {
            abort(403, 'You do not have access to this module.');
        }
        return $next($request);
    }
}
