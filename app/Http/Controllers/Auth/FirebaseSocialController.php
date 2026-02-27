<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth as FirebaseAuth;

class FirebaseSocialController extends Controller
{
    public function google(Request $request)
    {
        $idToken = $request->input('idToken');
        if (!$idToken) {
            return response()->json(['error' => 'Missing ID token'], 400);
        }

        $firebase = (new Factory)->withServiceAccount(storage_path('app/firebase-service-account.json'));
        $auth = $firebase->createAuth();

        try {
            $verifiedIdToken = $auth->verifyIdToken($idToken);
            $uid = $verifiedIdToken->claims()->get('sub');
            $firebaseUser = $auth->getUser($uid);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Invalid ID token'], 401);
        }

        // Find or create local user
        $user = User::where('firebase_uid', $uid)->first();
        if (!$user) {
            $user = User::create([
                'firebase_uid' => $uid,
                'name' => $firebaseUser->displayName ?? $firebaseUser->email,
                'email' => $firebaseUser->email,
                'avatar' => $firebaseUser->photoUrl ?? null,
                'password' => bcrypt(str()->random(32)), // random password
            ]);
        }

        // Log in the user
        Auth::login($user, true);

        return response()->json([
            'user' => $user,
            'token' => $idToken,
        ]);
    }
}
