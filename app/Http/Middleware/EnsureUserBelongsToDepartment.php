<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Policies\DepartmentAccessPolicy;
use Illuminate\Support\Facades\Auth;

class EnsureUserBelongsToDepartment
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        $department = $request->route('department');
        if ($user && $department) {
            $policy = new DepartmentAccessPolicy();
            if (!$policy->belongsToDepartment($user, $department)) {
                abort(403, 'Unauthorized: You do not belong to this department.');
            }
        }
        return $next($request);
    }
}
