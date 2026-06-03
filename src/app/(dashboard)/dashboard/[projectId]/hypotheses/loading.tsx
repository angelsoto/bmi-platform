import { Target } from "lucide-react";

export default function HypothesesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="mt-1 h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-48 rounded-md bg-gray-200" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-full rounded bg-gray-100" />
              </div>
              <div className="h-6 w-6 rounded bg-gray-100" />
            </div>
            <div className="mt-3 flex gap-4">
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-16 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
