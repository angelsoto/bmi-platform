"use client";

import Link from "next/link";

interface DeconstructionResultsProps {
  result: any;
  projectId: string;
  onReset: () => void;
}

export function DeconstructionResults({ result, projectId, onReset }: DeconstructionResultsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4 shadow-widget">
        <h2 className="text-sm font-semibold text-navy-900">AI Summary</h2>
        <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
      </div>

      {/* Assumptions Grid */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-navy-900">Structured Assumptions</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {(result.assumptions || []).map((a: any, i: number) => (
            <div key={i} className="rounded-md border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-900">{a.statement}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  a.riskLevel === "critical" ? "bg-red-100 text-red-700" :
                  a.riskLevel === "high" ? "bg-orange-100 text-orange-700" :
                  a.riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {a.riskLevel}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{a.category.replace(/_/g, " ")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Persona & Offer */}
      {(result.persona || result.offer) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.persona && (
            <div className="rounded-md border bg-blueprint-50 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                Suggested Persona
              </h4>
              <p className="mt-1 text-sm font-medium text-navy-900">{result.persona.name}</p>
              <p className="text-xs text-gray-600">{result.persona.primaryPain}</p>
            </div>
          )}
          {result.offer && (
            <div className="rounded-md border bg-blueprint-50 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                Suggested Offer
              </h4>
              <p className="mt-1 text-sm font-medium text-navy-900">{result.offer.name}</p>
              <p className="text-xs text-gray-600">{result.offer.valueProposition}</p>
            </div>
          )}
        </div>
      )}

      {/* Generated Hypotheses */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-navy-900">Generated Hypotheses</h3>
        <div className="space-y-2">
          {(result.hypotheses || []).map((h: any, i: number) => (
            <div key={i} className="rounded-md border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-navy-900">{h.title}</p>
                  <p className="text-xs text-gray-500">{h.statement}</p>
                </div>
                <span className="shrink-0 rounded-full bg-blueprint-100 px-2 py-0.5 text-xs text-navy-700">
                  {h.type}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span>First test: {h.recommendedFirstTest}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions */}
      <div className="rounded-lg border bg-white p-4 shadow-widget">
        <h3 className="text-sm font-semibold text-navy-900">Suggested Next Actions</h3>
        <ul className="mt-2 space-y-1">
          {(result.suggestedNextActions || []).map((action: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              {action}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/${projectId}`}
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
        >
          Go to Command Center
        </Link>
        <button
          onClick={onReset}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
