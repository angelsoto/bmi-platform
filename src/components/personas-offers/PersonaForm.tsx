"use client";

import { useState } from "react";

interface PersonaFormProps {
  projectId: string;
  onSaved: (persona: any) => void;
}

export function PersonaForm({ projectId, onSaved }: PersonaFormProps) {
  const [form, setForm] = useState({ name: "", primaryPain: "", description: "", context: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onSaved(data);
        setForm({ name: "", primaryPain: "", description: "", context: "" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          placeholder="e.g., Time-poor founder"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Primary Pain</label>
        <input
          type="text"
          required
          value={form.primaryPain}
          onChange={(e) => setForm({ ...form, primaryPain: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          placeholder="The main problem this persona faces"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Persona"}
      </button>
    </form>
  );
}
