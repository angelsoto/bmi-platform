"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FlaskConical, ArrowLeft, Save, Play, BarChart3 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function ExperimentDetailPage() {
  const params = useParams<{ projectId: string; experimentId: string }>();
  const router = useRouter();
  const [experiment, setExperiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", experimentType: "manual_validation" });
  const [showResult, setShowResult] = useState(false);
  const [resultForm, setResultForm] = useState({ metricName: "", observedValue: "", threshold: "", notes: "" });

  useEffect(() => {
    fetch(`/api/experiments/${params.experimentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((exp) => {
        if (exp) {
          setExperiment(exp);
          setForm({ name: exp.name, description: exp.description || "", experimentType: exp.experimentType });
        } else {
          setError("Experiment not found");
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [params.experimentId]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/experiments/${params.experimentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      setExperiment({ ...experiment, ...form });
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleStart = async () => {
    try {
      const res = await fetch(`/api/experiments/${params.experimentId}/start`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start");
      const updated = await res.json();
      setExperiment(updated);
    } catch (err: any) { setError(err.message); }
  };

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/experiments/${params.experimentId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricName: resultForm.metricName,
          observedValue: parseFloat(resultForm.observedValue),
          threshold: parseFloat(resultForm.threshold),
          notes: resultForm.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to record result");
      const output = await res.json();
      router.push(`/dashboard/${params.projectId}/experiments`);
    } catch (err: any) { setError(err.message); }
  };

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;

  if (error && !experiment) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm text-red-600">{error}</p>
      <Link href={`/dashboard/${params.projectId}/experiments`} className="mt-2 text-sm text-indigo-600">Back to experiments</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${params.projectId}/experiments`} className="rounded p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <Breadcrumbs items={[{ label: "Experiments", href: `/dashboard/${params.projectId}/experiments` }, { label: experiment?.name || "Detail" }]} />
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-navy-900">{experiment?.name}</h1>
            {experiment && <StatusBadge status={experiment.status} />}
          </div>
        </div>
      </div>

      {experiment?.hypothesis && (
        <div className="rounded-lg border bg-indigo-50 p-3 text-sm">
          Testing hypothesis:{" "}
          <Link href={`/dashboard/${params.projectId}/hypotheses/${experiment.hypothesis.id}`} className="font-medium text-indigo-700 hover:underline">
            {experiment.hypothesis.title}
          </Link>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6 shadow-widget space-y-4">
        <h2 className="text-sm font-semibold text-navy-900">Edit Experiment</h2>
        <div>
          <label className="block text-xs font-medium text-gray-700">Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Type</label>
          <select value={form.experimentType} onChange={(e) => setForm({ ...form, experimentType: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="manual_validation">Manual Validation</option>
            <option value="landing_page_test">Landing Page Test</option>
            <option value="message_test">Message Test</option>
            <option value="cta_test">CTA Test</option>
            <option value="interview_test">Interview Test</option>
            <option value="survey_test">Survey Test</option>
          </select>
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </button>
          {experiment?.status !== "running" && experiment?.status !== "decision_made" && experiment?.status !== "applied" && (
            <button onClick={handleStart} className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <Play className="h-4 w-4" /> Start
            </button>
          )}
        </div>
      </div>

      {experiment?.results?.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-widget space-y-3">
          <h2 className="text-sm font-semibold text-navy-900">Results</h2>
          {experiment.results.map((r: any) => (
            <div key={r.id} className="rounded-md border bg-gray-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.metricName}: {r.observedValue}</span>
                <span className={`text-xs font-medium ${r.decisionRuleOutcome === "supports" ? "text-green-600" : r.decisionRuleOutcome === "weakens" ? "text-red-600" : "text-amber-600"}`}>{r.decisionRuleOutcome}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Threshold: {r.threshold} | {r.metThreshold ? "Met" : "Not met"}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-white p-6 shadow-widget">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-navy-900">Record Result</h2>
          <button onClick={() => setShowResult(!showResult)} className="flex items-center gap-1.5 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800">
            <BarChart3 className="h-3.5 w-3.5" /> {showResult ? "Cancel" : "Record"}
          </button>
        </div>
        {showResult && (
          <form onSubmit={handleRecordResult} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Metric</label>
                <input type="text" required value={resultForm.metricName}
                  onChange={(e) => setResultForm({ ...resultForm, metricName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" placeholder="conversion_rate" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Observed</label>
                <input type="number" step="any" required value={resultForm.observedValue}
                  onChange={(e) => setResultForm({ ...resultForm, observedValue: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Threshold</label>
                <input type="number" step="any" required value={resultForm.threshold}
                  onChange={(e) => setResultForm({ ...resultForm, threshold: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Notes</label>
              <input type="text" value={resultForm.notes}
                onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
            <button type="submit" className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800">Submit Result</button>
          </form>
        )}
      </div>
    </div>
  );
}
