<?php

namespace App\Services\Guest;

use App\Models\GuestSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;

class GuestSessionResolver
{
    public const COOKIE_NAME = 'erp_guest_chat_token';

    public function resolve(Request $request, bool $create = true): ?GuestSession
    {
        $token = $this->resolveToken($request);

        if ($token) {
            $session = GuestSession::query()->where('session_id', $token)->first();
            if ($session) {
                $session->updateActivity();

                return $session;
            }
        }

        if (!$create) {
            return null;
        }

        $token = (string) Str::uuid();

        return GuestSession::create([
            'session_id' => $token,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_activity_at' => now(),
        ]);
    }

    public function resolveToken(Request $request): ?string
    {
        $token = $request->input('session_id')
            ?? $request->cookie(self::COOKIE_NAME);

        if (is_string($token) && Str::isUuid($token)) {
            return $token;
        }

        $legacyToken = $request->input('session_id') ?? $request->cookie(self::COOKIE_NAME);
        if (is_string($legacyToken) && $legacyToken !== '') {
            return $legacyToken;
        }

        return null;
    }

    public function attachCookie(\Illuminate\Http\JsonResponse $response, GuestSession $session, Request $request): \Illuminate\Http\JsonResponse
    {
        return $response->cookie($this->makeCookie($session->session_id, $request));
    }

    public function makeCookie(string $token, Request $request): Cookie
    {
        return Cookie::create(
            self::COOKIE_NAME,
            $token,
            60 * 24 * 365,
            '/',
            null,
            $request->isSecure(),
            true,
            false,
            Cookie::SAMESITE_LAX,
        );
    }
}
