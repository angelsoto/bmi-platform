"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Save, Trash2 } from "lucide-react";

export default function PersonaDetailPage() {
  const params = useParams<{ projectId: string; personaId: string }>();
  const router = useRouter();
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", primaryPain: "", description: "", context: "" });

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}/personas`)
      .then((r) => r.ok ? r.json() : [])
      .then((list) => {
        const p = list.find((item: any) => item.id === params.personaId);
        if (p) {
          setPersona(p);
          setForm({ name: p.name, primaryPain: p.primaryPain, description: p.description || "", context: p.context || "" });
        } else {
          setError("Persona not found");
        }
      })
      .catch(() => setError("Failed to load persona"))
      .finally(() => setLoading(false));
  }, [params.projectId, params.personaId]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.primaryPain.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/personas/${params.personaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      setPersona({ ...persona, ...form });
      router.push(`/dashboard/${params.projectId}/personas`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this persona?")) return;
    try {
      await fetch(`/api/personas/${params.personaId}`, { method: "DELETE" });
      router.push(`/dashboard/${params.projectId}/personas`);
    } catch {
      setError("Failed to delete");
    }
  };

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm text-red-600">{error}</p>
      <Link href={`/dashboard/${params.projectId}/personas`} className="mt-2 text-sm text-indigo-600">Back to personas</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${params.projectId}/personas`} className="rounded p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-navy-900">Edit Persona</h1>
          <p className="text-sm text-gray-500">{persona?.id}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-widget space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Primary Pain</label>
          <input type="text" value={form.primaryPain} onChange={(e) => setForm({ ...form, primaryPain: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Context</label>
          <textarea rows={2} value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !form.name || !form.primaryPain}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
