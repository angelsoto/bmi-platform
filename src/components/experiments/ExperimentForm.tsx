"use client";

import { useState, useEffect } from "react";

interface ExperimentFormProps {
  projectId: string;
  onSaved: (experiment: any) => void;
}

export function ExperimentForm({ projectId, onSaved }: ExperimentFormProps) {
  const [form, setForm] = useState({ hypothesisId: "", name: "", description: "", experimentType: "manual_validation" });
  const [loading, setLoading] = useState(false);
  const [hypotheses, setHypotheses] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/hypotheses`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setHypotheses(data))
      .catch(() => {});
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.hypothesisId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/experiments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onSaved(data);
        setForm({ hypothesisId: "", name: "", description: "", experimentType: "manual_validation" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700">Hypothesis</label>
        <select
          required
          value={form.hypothesisId}
          onChange={(e) => setForm({ ...form, hypothesisId: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Select a hypothesis...</option>
          {hypotheses.map((h: any) => (
            <option key={h.id} value={h.id}>{h.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          placeholder="e.g., Landing page smoke test for pricing"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          rows={2}
          placeholder="What will this experiment test?"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Experiment Type</label>
        <select
          value={form.experimentType}
          onChange={(e) => setForm({ ...form, experimentType: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="manual_validation">Manual Validation</option>
          <option value="landing_page_test">Landing Page Test</option>
          <option value="message_test">Message Test</option>
          <option value="cta_test">CTA Test</option>
          <option value="interview_test">Interview Test</option>
          <option value="survey_test">Survey Test</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Experiment"}
      </button>
    </form>
  );
}
