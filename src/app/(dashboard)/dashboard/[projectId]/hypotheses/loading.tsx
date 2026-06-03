import { Target } from "lucide-react";

export default function HypothesesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-3 w-32 rounded bg-gray-200" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="mt-1 h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-48 rounded-md bg-gray-200" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-16 rounded-md bg-gray-200" />
        ))}
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-5 w-16 rounded-full bg-gray-100" />
                </div>
                <div className="mt-2 h-4 w-full rounded bg-gray-100" />
              </div>
              <div className="h-5 w-5 rounded bg-gray-100" />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-16 rounded bg-gray-100" />
              <div className="h-4 w-16 rounded-full bg-gray-100" />
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
