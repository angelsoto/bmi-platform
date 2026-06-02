"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    const autoEmail = searchParams?.get("auto");
    if (autoEmail && !autoSubmitted.current) {
      autoSubmitted.current = true;
      setEmail(autoEmail);
      setLoading(true);
      signIn("credentials", {
        email: autoEmail,
        callbackUrl: "/dashboard",
        redirect: true,
      }).catch((err: any) => {
        setError(err?.message || "Auto sign-in failed");
        setLoading(false);
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn("credentials", {
        email,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err: any) {
      setError(err?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blueprint-50">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-white p-8 shadow-widget">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-navy-950">BMI Platform</h1>
          <p className="text-sm text-gray-500">
            Scientific Validation Engine
          </p>
        </div>

        {loading && !error ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm text-gray-500">Signing you in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-gray-400">
          <p>Demo mode: you will be signed in automatically</p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-blueprint-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
