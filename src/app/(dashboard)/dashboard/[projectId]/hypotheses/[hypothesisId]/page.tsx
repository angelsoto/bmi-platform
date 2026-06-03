"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Target, ArrowLeft, Save, Shield, FlaskConical } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function HypothesisDetailPage() {
  const params = useParams<{ projectId: string; hypothesisId: string }>();
  const router = useRouter();
  const [hypothesis, setHypothesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", statement: "", type: "desirability", status: "draft", confidence: "medium" });
  const [showRank, setShowRank] = useState(false);
  const [rankForm, setRankForm] = useState({ survivalCriticality: "medium", uncertainty: "medium", rationale: "" });

  useEffect(() => {
    fetch(`/api/hypotheses/${params.hypothesisId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((h) => {
        if (h) {
          setHypothesis(h);
          setForm({ title: h.title, statement: h.statement, type: h.type, status: h.status, confidence: h.confidence });
        } else {
          setError("Hypothesis not found");
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [params.hypothesisId]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.statement.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hypotheses/${params.hypothesisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, changedReason: "Manual edit" }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setHypothesis({ ...hypothesis, ...form });
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleRank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/hypotheses/${params.hypothesisId}/risk-rank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rankForm),
      });
      if (!res.ok) throw new Error("Failed to rank");
      const rank = await res.json();
      setHypothesis({ ...hypothesis, riskRanks: [rank, ...(hypothesis.riskRanks || [])] });
      setShowRank(false);
    } catch (err: any) { setError(err.message); }
  };

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;

  if (error && !hypothesis) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm text-red-600">{error}</p>
      <Link href={`/dashboard/${params.projectId}/hypotheses`} className="mt-2 text-sm text-indigo-600">Back to hypotheses</Link>
    </div>
  );

  const latestRank = hypothesis?.riskRanks?.[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${params.projectId}/hypotheses`} className="rounded p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <Breadcrumbs items={[{ label: "Hypotheses", href: `/dashboard/${params.projectId}/hypotheses` }, { label: hypothesis?.title || "Detail" }]} />
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-navy-900">{hypothesis?.title}</h1>
            {hypothesis && <StatusBadge status={hypothesis.status} />}
          </div>
        </div>
      </div>

      {latestRank && (
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy-900">Risk Assessment</h3>
            <span className={`text-xs font-bold uppercase ${latestRank.survivalCriticality === "critical" ? "text-red-600" : latestRank.survivalCriticality === "high" ? "text-amber-600" : "text-gray-600"}`}>{latestRank.survivalCriticality}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Priority Score: <span className="font-mono font-bold text-navy-900">{latestRank.validationPriorityScore?.toFixed(1)}</span></p>
          {latestRank.rationale && <p className="mt-2 text-xs italic text-indigo-600">{latestRank.rationale}</p>}
        </div>
      )}

      <div className="rounded-lg border bg-white p-6 shadow-widget space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy-900">Edit Hypothesis</h2>
          <button onClick={() => setShowRank(!showRank)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            {showRank ? "Cancel" : "Risk Rank"}
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Title</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Statement</label>
          <textarea rows={3} value={form.statement} onChange={(e) => setForm({ ...form, statement: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="desirability">Desirability</option>
              <option value="viability">Viability</option>
              <option value="feasibility">Feasibility</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Confidence</label>
            <select value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="testing">Testing</option>
              <option value="supported">Supported</option>
              <option value="weakened">Weakened</option>
            </select>
          </div>
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {showRank && (
        <div className="rounded-lg border bg-white p-6 shadow-widget">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">Risk Rank</h2>
          <form onSubmit={handleRank} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Survival Criticality</label>
                <select value={rankForm.survivalCriticality} onChange={(e) => setRankForm({ ...rankForm, survivalCriticality: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Uncertainty</label>
                <select value={rankForm.uncertainty} onChange={(e) => setRankForm({ ...rankForm, uncertainty: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Rationale</label>
              <textarea rows={2} value={rankForm.rationale} onChange={(e) => setRankForm({ ...rankForm, rationale: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800">Save Rank</button>
          </form>
        </div>
      )}

      {hypothesis?.evidence?.length > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-navy-900">Evidence ({hypothesis.evidence.length})</h3>
          </div>
          <div className="space-y-1">
            {hypothesis.evidence.map((e: any) => (
              <div key={e.id} className="text-xs text-gray-600 truncate">
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${e.evidenceStrength === "strong" ? "bg-green-500" : e.evidenceStrength === "moderate" ? "bg-amber-500" : "bg-gray-300"}`} />
                {e.summary}
              </div>
            ))}
          </div>
        </div>
      )}

      {hypothesis?.experiments?.length > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-navy-900">Experiments ({hypothesis.experiments.length})</h3>
          </div>
          <div className="space-y-1">
            {hypothesis.experiments.map((e: any) => (
              <Link key={e.id} href={`/dashboard/${params.projectId}/experiments/${e.id}`}
                className="block text-xs text-indigo-600 hover:underline">{e.name}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
