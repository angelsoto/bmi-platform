"use client";

import { useState, useEffect } from "react";

interface LandingPageFormProps {
  projectId: string;
  onSaved: (page: any) => void;
}

export function LandingPageForm({ projectId, onSaved }: LandingPageFormProps) {
  const [form, setForm] = useState({
    name: "", slug: "", personaId: "", offerId: "", hypothesisId: "",
    journeyStage: "awareness",
  });
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [hypotheses, setHypotheses] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/personas`).then((r) => r.ok ? r.json() : []).then(setPersonas).catch(() => {});
    fetch(`/api/projects/${projectId}/offers`).then((r) => r.ok ? r.json() : []).then(setOffers).catch(() => {});
    fetch(`/api/projects/${projectId}/hypotheses`).then((r) => r.ok ? r.json() : []).then(setHypotheses).catch(() => {});
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/landing-pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onSaved(data);
        setForm({ name: "", slug: "", personaId: "", offerId: "", hypothesisId: "", journeyStage: "awareness" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            placeholder="e.g., Pricing landing page"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Slug</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            placeholder="pricing-v1"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Linked Persona</label>
        <select
          value={form.personaId}
          onChange={(e) => setForm({ ...form, personaId: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">None</option>
          {personas.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Linked Offer</label>
        <select
          value={form.offerId}
          onChange={(e) => setForm({ ...form, offerId: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">None</option>
          {offers.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Linked Hypothesis</label>
        <select
          value={form.hypothesisId}
          onChange={(e) => setForm({ ...form, hypothesisId: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">None</option>
          {hypotheses.map((h: any) => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Journey Stage</label>
        <select
          value={form.journeyStage}
          onChange={(e) => setForm({ ...form, journeyStage: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="awareness">Awareness</option>
          <option value="consideration">Consideration</option>
          <option value="decision">Decision</option>
          <option value="retention">Retention</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Landing Page"}
      </button>
    </form>
  );
}
