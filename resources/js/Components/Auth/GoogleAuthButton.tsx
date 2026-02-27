import React, { useState } from "react";
import { signInWithGoogle } from "@/firebase-auth";
import { Button } from "@/Components/ui/button";

type AuthedUser = {
  id: number | string;
  name?: string;
  email?: string;
  [key: string]: unknown;
};

type GoogleAuthResponse =
  | { ok: true; user: AuthedUser }
  | { ok: false; error?: string };

type Props = {
  onAuth?: (user: AuthedUser) => void;
  endpoint?: string; // default: /api/auth/google
  className?: string;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 533.5 544.3"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M533.5 278.4c0-18.6-1.7-37.2-5.2-55.3H272v104.7h146.9c-6.3 33.9-25 62.6-53.2 81.7v67h86.1c50.5-46.5 81.7-115.1 81.7-197.8z"
      />
      <path
        fill="#34A853"
        d="M272 544.3c72.6 0 133.6-23.9 178.1-64.9l-86.1-67c-23.9 16.3-54.6 25.7-92 25.7-70.5 0-130.3-47.6-151.7-111.4H31.7v69.9C76.7 486.1 168.5 544.3 272 544.3z"
      />
      <path
        fill="#FBBC05"
        d="M120.3 326.7c-11.3-33.9-11.3-70.5 0-104.4V152.4H31.7c-38.3 76.6-38.3 167.9 0 244.5l88.6-70.2z"
      />
      <path
        fill="#EA4335"
        d="M272 107.7c39.5-.6 77.6 14.1 106.6 41.1l79.4-79.4C407.1 24.5 344.6-.6 272 0 168.5 0 76.7 58.2 31.7 152.4l88.6 69.9C141.7 155.3 201.5 107.7 272 107.7z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({
  onAuth,
  endpoint = "/api/auth/google",
  className,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();

      if (!result?.user) {
        setError(result?.error?.message ?? "Google sign-in failed.");
        return;
      }

      const idToken = await result.user.getIdToken();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const payload = (await res.json()) as GoogleAuthResponse;

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Google authentication failed.");
        return;
      }

      onAuth?.(payload.user);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center gap-2"
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        <GoogleIcon className="h-4 w-4" />
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
}