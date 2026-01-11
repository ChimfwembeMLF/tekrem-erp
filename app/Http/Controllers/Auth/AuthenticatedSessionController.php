<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class AuthenticatedSessionController extends Controller
{
    public function store(Request $request)
    {
        // ...existing login logic...
        $response = Auth::attempt($request->only('email', 'password'), $request->filled('remember'));
        if ($response) {
            $user = Auth::user();
            // Set current company context after login
            if ($user && function_exists('currentCompanyId')) {
                if ($user->companies()->exists()) {
                    currentCompanyId($user->companies()->first()->id);
                }
            } else if ($user && $user->companies()->exists()) {
                Session::put('current_company_id', $user->companies()->first()->id);
            }
        }
        // ...existing redirect/response logic...
    }
}
