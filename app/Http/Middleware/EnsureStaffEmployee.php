<?php

namespace App\Http\Middleware;

use App\Models\HR\Employee;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaffEmployee
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        $employee = $user->employee()
            ->where('employment_status', 'active')
            ->first();

        if (!$employee) {
            abort(403, 'No active employee record linked to your account.');
        }

        $request->attributes->set('staffEmployee', $employee);

        return $next($request);
    }
}
