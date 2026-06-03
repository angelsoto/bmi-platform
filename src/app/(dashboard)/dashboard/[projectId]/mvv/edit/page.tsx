"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function MVVEditPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    mission: "", vision: "", values: "", founderAssumptions: "", unresolvedTensions: "",
  });

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}/mvv`)
      .then((r) => r.json())
      .then((data) => {
        if (data.mission) {
          setForm({
            mission: data.mission,
            vision: data.vision,
            values: JSON.parse(data.values || "[]").join("\n"),
            founderAssumptions: JSON.parse(data.founderAssumptions || "[]").join("\n"),
            unresolvedTensions: JSON.parse(data.unresolvedTensions || "[]").join("\n"),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mission.trim() || !form.vision.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${params.projectId}/mvv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission: form.mission,
          vision: form.vision,
          values: form.values.split("\n").filter(Boolean),
          founderAssumptions: form.founderAssumptions.split("\n").filter(Boolean),
          unresolvedTensions: form.unresolvedTensions.split("\n").filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.push(`/dashboard/${params.projectId}/mvv`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${params.projectId}/mvv`} className="rounded p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-navy-900">Edit MVV</h1>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-widget">
        <div>
          <label className="block text-xs font-medium text-gray-700">Mission</label>
          <textarea rows={3} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Vision</label>
          <textarea rows={3} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Values (one per line)</label>
          <textarea rows={4} value={form.values} onChange={(e) => setForm({ ...form, values: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Founder Assumptions (one per line)</label>
          <textarea rows={4} value={form.founderAssumptions} onChange={(e) => setForm({ ...form, founderAssumptions: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Unresolved Tensions (one per line)</label>
          <textarea rows={3} value={form.unresolvedTensions} onChange={(e) => setForm({ ...form, unresolvedTensions: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <button type="submit" disabled={saving || !form.mission || !form.vision}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save MVV"}
        </button>
      </form>
    </div>
  );
}
