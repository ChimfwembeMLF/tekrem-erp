<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureActiveSubscription
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        $company = $user?->company;
        if (!$company || !$company->hasActiveSubscription()) {
            return response()->json(['message' => 'No active subscription.'], 402);
        }
        return $next($request);
    }
}
