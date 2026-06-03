"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

interface HypothesisItem {
  title: string;
  statement: string;
  type: string;
  survivalCriticality: string;
  recommendedFirstTest: string;
}

interface AssumptionItem {
  statement: string;
  category: string;
  riskLevel: string;
}

interface ResultData {
  summary?: string;
  assumptions?: AssumptionItem[];
  hypotheses?: HypothesisItem[];
  persona?: { name: string; primaryPain: string } | null;
  offer?: { name: string; valueProposition: string } | null;
  suggestedPersona?: { name: string; primaryPain: string } | null;
  suggestedOffer?: { name: string; valueProposition: string } | null;
  suggestedNextActions?: string[];
  intakeId?: string;
}

interface DeconstructionResultsProps {
  result: ResultData;
  projectId: string;
  onReset: () => void;
}

export function DeconstructionResults({ result, projectId, onReset }: DeconstructionResultsProps) {
  const [selectedHypotheses, setSelectedHypotheses] = useState<boolean[]>(
    (result.hypotheses || []).map(() => true)
  );
  const [acceptPersona, setAcceptPersona] = useState(true);
  const [acceptOffer, setAcceptOffer] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  const personaData = (result as any).suggestedPersona || (result as any).persona;
  const offerData = (result as any).suggestedOffer || (result as any).offer;
  const hasSelections = selectedHypotheses.some(Boolean) || (!!personaData && acceptPersona) || (!!offerData && acceptOffer);

  const handleAccept = async () => {
    if (!hasSelections || !result.intakeId) return;
    setSaving(true);
    try {
      const selectedHyps = (result.hypotheses || []).filter((_, i) => selectedHypotheses[i]);
      const res = await fetch(`/api/concept-intakes/${result.intakeId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hypotheses: selectedHyps,
          acceptPersona: acceptPersona && !!personaData,
          acceptOffer: acceptOffer && !!offerData,
          persona: personaData,
          offer: offerData,
        }),
      });
      if (!res.ok) throw new Error("Failed to save selections");
      setAccepted(true);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (accepted) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border-2 border-teal-200 bg-teal-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
            <Check className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold text-teal-800">Selections saved</h2>
          <p className="mt-1 text-sm text-teal-600">
            {selectedHypotheses.filter(Boolean).length} hypotheses{personaData && acceptPersona ? ", 1 persona" : ""}{offerData && acceptOffer ? ", 1 offer" : ""} added to your project.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href={`/dashboard/${projectId}`}
              className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
              Go to Command Center
            </Link>
            <button onClick={onReset}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Start New Intake
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        AI-generated suggestions require human review before they are saved.
      </div>
      {/* AI Summary */}
      <div className="rounded-lg border bg-white p-4 shadow-widget">
        <h2 className="text-sm font-semibold text-navy-900">AI Summary</h2>
        <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
      </div>

      {/* Assumptions Grid */}
      {result.assumptions && result.assumptions.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-navy-900">
            Structured Assumptions
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.assumptions.map((a: any, i: number) => (
              <div key={i} className="rounded-md border bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-900">{a.statement}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.riskLevel === "critical" ? "bg-red-100 text-red-700" :
                    a.riskLevel === "high" ? "bg-orange-100 text-orange-700" :
                    a.riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-green-100 text-green-700"
                  }`}>{a.riskLevel}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">{a.category.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Persona & Offer — toggleable */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-navy-900">Suggested Persona & Offer</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {personaData && (
            <div
              onClick={() => setAcceptPersona(!acceptPersona)}
              className={`relative cursor-pointer rounded-md border p-4 transition-all ${
                acceptPersona
                  ? "border-navy-900 bg-blueprint-50 ring-1 ring-navy-900"
                  : "border-gray-200 bg-white opacity-50 hover:opacity-80"
              }`}
            >
              {acceptPersona && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-700">Persona</h4>
              <p className="mt-1 text-sm font-medium text-navy-900">{personaData.name}</p>
              <p className="text-xs text-gray-600">{personaData.primaryPain}</p>
            </div>
          )}
          {offerData && (
            <div
              onClick={() => setAcceptOffer(!acceptOffer)}
              className={`relative cursor-pointer rounded-md border p-4 transition-all ${
                acceptOffer
                  ? "border-navy-900 bg-blueprint-50 ring-1 ring-navy-900"
                  : "border-gray-200 bg-white opacity-50 hover:opacity-80"
              }`}
            >
              {acceptOffer && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-700">Offer</h4>
              <p className="mt-1 text-sm font-medium text-navy-900">{offerData.name}</p>
              <p className="text-xs text-gray-600">{offerData.valueProposition}</p>
            </div>
          )}
        </div>
      </div>

      {/* Generated Hypotheses — multi-select */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-navy-900">
            Generated Hypotheses
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({selectedHypotheses.filter(Boolean).length} of {result.hypotheses?.length || 0} selected)
            </span>
          </h3>
          <button
            onClick={() => {
              const allSelected = selectedHypotheses.every(Boolean);
              setSelectedHypotheses((result.hypotheses || []).map(() => !allSelected));
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            {selectedHypotheses.every(Boolean) ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="space-y-2">
          {(result.hypotheses || []).map((h: HypothesisItem, i: number) => (
            <div
              key={i}
              onClick={() => {
                const next = [...selectedHypotheses];
                next[i] = !next[i];
                setSelectedHypotheses(next);
              }}
              className={`relative cursor-pointer rounded-md border p-3 transition-all ${
                selectedHypotheses[i]
                  ? "border-navy-900 bg-white shadow-sm hover:shadow-md"
                  : "border-gray-200 bg-gray-50 opacity-60 hover:opacity-90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Checkbox */}
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    selectedHypotheses[i] ? "border-navy-900 bg-navy-900" : "border-gray-300"
                  }`}>
                    {selectedHypotheses[i] && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">{h.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{h.statement}</p>
                    <p className="mt-1.5 text-xs text-gray-400">
                      First test: {h.recommendedFirstTest}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  <span className="rounded-full bg-blueprint-100 px-2 py-0.5 text-xs text-navy-700">
                    {h.type}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    h.survivalCriticality === "critical" ? "bg-red-100 text-red-700" :
                    h.survivalCriticality === "high" ? "bg-orange-100 text-orange-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {h.survivalCriticality}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions */}
      {result.suggestedNextActions && result.suggestedNextActions.length > 0 && (
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
      )}

      {/* Accept / Reset actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAccept}
          disabled={!hasSelections || saving || !result.intakeId}
          className="flex items-center justify-center gap-2 rounded-md bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : `Accept ${selectedHypotheses.filter(Boolean).length} hypotheses`}
          {!saving && <ChevronRight className="h-4 w-4" />}
        </button>
        <Link
          href={`/dashboard/${projectId}`}
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </Link>
        <button
          onClick={onReset}
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
