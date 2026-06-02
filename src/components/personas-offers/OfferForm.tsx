"use client";

import { useState } from "react";

interface OfferFormProps {
  projectId: string;
  onSaved: (offer: any) => void;
}

export function OfferForm({ projectId, onSaved }: OfferFormProps) {
  const [form, setForm] = useState({
    name: "", valueProposition: "", format: "service",
    priceModel: "", priceAmount: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceAmount: form.priceAmount ? Number(form.priceAmount) : undefined,
          priceModel: form.priceModel || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSaved(data);
        setForm({ name: "", valueProposition: "", format: "service", priceModel: "", priceAmount: "" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700">Offer Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          placeholder="e.g., Scientific Validation Engine"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Value Proposition</label>
        <input
          type="text"
          required
          value={form.valueProposition}
          onChange={(e) => setForm({ ...form, valueProposition: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          placeholder="What the persona gets"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Offer"}
      </button>
    </form>
  );
}
