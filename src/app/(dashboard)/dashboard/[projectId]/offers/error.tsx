"use client";

import { AlertTriangle } from "lucide-react";

export default function SectionError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8">
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 max-w-md text-center">
        <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
        <h2 className="text-sm font-semibold text-red-700">Failed to load</h2>
        <p className="mt-1 text-xs text-red-600">{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700">
          Try again
        </button>
      </div>
    </div>
  );
}
