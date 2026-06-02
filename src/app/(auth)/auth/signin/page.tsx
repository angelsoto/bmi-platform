"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            Sign in to the Scientific Validation Engine
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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

        <div className="text-center text-xs text-gray-400">
          <p>Dev mode: enter any email to sign in</p>
          <button
            type="button"
            onClick={() => setEmail("admin@test.com")}
            className="mt-2 text-indigo-500 hover:text-indigo-700"
          >
            Use demo account (admin@test.com)
          </button>
        </div>
      </div>
    </div>
  );
}
