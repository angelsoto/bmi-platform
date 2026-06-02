"use client";

import { useState } from "react";

interface ConceptIntakeFormProps {
  projectId: string;
  onComplete: (result: any) => void;
}

export function ConceptIntakeForm({ projectId, onComplete }: ConceptIntakeFormProps) {
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDemo, setUseDemo] = useState(false);

  const demoText = `I want to build a platform that helps founders validate their business ideas scientifically before they waste time and money building something nobody wants.

The target customers are early-stage founders who have a business idea but aren't sure if it's viable. They're tired of generic advice and want a structured, evidence-based approach.

The key problem is that most founders fall in love with their idea and skip validation, leading to a 90% failure rate. They need someone to play "devil's advocate" and force them to test their riskiest assumptions.

I plan to charge $29/month for the basic plan, with a free tier for the first 100 customers. The main competitors are Lean Canvas and business model canvas tools, but none of them include actual experiment deployment or bias detection.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = useDemo ? demoText : rawInput;
    if (!input.trim()) {
      setError("Please enter your business idea");
      setLoading(false);
      return;
    }

    try {
      // 1. Create the intake
      const intakeRes = await fetch(`/api/projects/${projectId}/concept-intakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: input }),
      });

      if (!intakeRes.ok) throw new Error("Failed to create intake");
      const intake = await intakeRes.json();

      // 2. Deconstruct via AI
      const deconstructRes = await fetch(`/api/concept-intakes/${intake.id}/deconstruct`, {
        method: "POST",
      });

      if (!deconstructRes.ok) throw new Error("AI deconstruction failed");
      const result = await deconstructRes.json();

      onComplete(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Mode B — Engine/Explanation UI */}
      <div className="relative overflow-hidden rounded-lg bg-navy-900 p-6 text-white">
        <div className="bg-blueprint-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="relative">
          <div className="mb-2 inline-block rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-medium text-cyan-400">
            Time-to-value: under 10 minutes
          </div>
          <h2 className="text-xl font-bold">Concept Intake</h2>
          <p className="mt-1 text-sm text-gray-300">
            Describe your business idea in plain language. Our AI will deconstruct it into structured assumptions, testable hypotheses, and a draft persona and offer.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={useDemo}
              onChange={(e) => setUseDemo(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
          </label>
          <span className="text-sm text-gray-600">Use GST Body demo idea</span>
        </div>

        <div className="relative">
          <textarea
            value={useDemo ? demoText : rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            readOnly={useDemo}
            rows={8}
            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
            placeholder="Describe your business idea. What problem do you solve? Who is it for? How will you make money?"
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {useDemo ? demoText.length : rawInput.length} characters
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!useDemo && !rawInput.trim())}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Deconstructing...
            </>
          ) : (
            "Deconstruct My Idea"
          )}
        </button>
      </form>
    </div>
  );
}
