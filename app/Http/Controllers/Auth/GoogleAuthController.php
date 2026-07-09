<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Client;
use App\Services\DashboardRedirectService;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Check if user already exists
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Update Google ID and tokens if not set
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                ]);
            } else {
                // Create a new user
                $user = User::create([
                    'name' => $googleUser->getName() ?? 'Google User',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'password' => bcrypt(Str::random(24)), // Random password
                ]);

                // Create associated client and assign role
                Client::create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_id' => $user->id,
                    'status' => 'active',
                ]);
                
                $user->assignRole('customer');
            }

            Auth::login($user, true);

            return redirect()->intended(app(DashboardRedirectService::class)->resolve($user));

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Google Auth Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return redirect('/login')->withErrors(['google' => 'Failed to authenticate with Google. Please try again.']);
        }
    }
}
