"use client";

export default function HypothesesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-lg font-semibold text-red-700">Failed to load hypotheses</h2>
      <p className="mt-2 text-sm text-gray-500">{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
        Try again
      </button>
    </div>
  );
}
