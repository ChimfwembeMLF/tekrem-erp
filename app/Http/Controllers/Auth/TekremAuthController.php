<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TekremAuthController extends Controller
{
    /**
     * Redirect the user to the Tekrem Auth authentication page.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect()
    {
        return \Laravel\Socialite\Facades\Socialite::driver('tekrem')->redirect();
    }

    /**
     * Obtain the user information from Tekrem Auth.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback()
    {
        try {
            $tekremUser = \Laravel\Socialite\Facades\Socialite::driver('tekrem')->user();
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['email' => 'Failed to authenticate with Tekrem Auth.']);
        }

        $user = \App\Models\User::updateOrCreate(
            ['email' => $tekremUser->getEmail()],
            [
                'name' => $tekremUser->getName() ?? $tekremUser->getNickname() ?? 'Tekrem User',
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(24)),
                'email_verified_at' => now(),
            ]
        );

        \Illuminate\Support\Facades\Auth::login($user);

        return redirect()->intended('/dashboard');
    }
}
