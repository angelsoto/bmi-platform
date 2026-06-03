"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExperimentForm } from "@/components/experiments/ExperimentForm";
import { FlaskConical, AlertTriangle, ChevronRight, Plus, Minus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_FILTERS = ["running", "analyzing", "decision_made", "applied"];

export default function ExperimentsPage() {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const statusFilter = STATUS_FILTERS.includes(sp.get("status") as string) ? sp.get("status")! : undefined;

  const loadExperiments = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/projects/${params.projectId}/experiments${statusFilter ? `?status=${statusFilter}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      setExperiments(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExperiments(); }, [params.projectId, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: "Experiments" }]} />
          <h1 className="text-2xl font-bold text-navy-900">Experiments</h1>
          <p className="text-sm text-gray-500">Every experiment needs a metric, threshold, and decision rule.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {showForm ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Create from Hypothesis"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="mb-3 text-sm font-semibold text-navy-900">New Experiment</h2>
          <ExperimentForm projectId={params.projectId} onSaved={() => { loadExperiments(); setShowForm(false); }} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/dashboard/${params.projectId}/experiments`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            !statusFilter ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}>All</Link>
        {STATUS_FILTERS.map((s) => (
          <Link key={s} href={`/dashboard/${params.projectId}/experiments?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>{s.replace(/_/g, " ")}</Link>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg border bg-white p-4"><div className="h-4 w-3/4 rounded bg-gray-200" /><div className="mt-2 h-3 w-1/2 rounded bg-gray-100" /></div>)}</div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>
      ) : experiments.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No experiments yet" description="Design an experiment from your highest-risk hypothesis." />
      ) : (
        <div className="space-y-3">
          {experiments.map((exp) => {
            const lastResult = exp.results?.[0];
            const duration = exp.startDate && exp.endDate
              ? `${Math.round((exp.endDate.getTime() - exp.startDate.getTime()) / (1000 * 60 * 60 * 24))}d`
              : null;
            return (
              <Link key={exp.id} href={`/dashboard/${params.projectId}/experiments/${exp.id}`}
                className="group block rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-navy-900 group-hover:text-navy-700">{exp.name}</h3>
                      <StatusBadge status={exp.status} />
                    </div>
                    {exp.description && (
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{exp.description}</p>
                    )}
                    {exp.hypothesis && (
                      <p className="mt-1 text-xs text-gray-400">
                        Testing: &ldquo;
                        <span className="text-indigo-600">{exp.hypothesis.title}</span>&rdquo;
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="font-medium text-navy-700">{exp.experimentType?.replace(/_/g, " ")}</span>
                  {exp.startDate && <span>Started: {new Date(exp.startDate).toLocaleDateString()}</span>}
                  {duration && <span>Duration: {duration}</span>}
                  {exp.endDate && <span>Ended: {new Date(exp.endDate).toLocaleDateString()}</span>}
                  {lastResult && (
                    <span className={`font-medium ${
                      lastResult.decisionRuleOutcome === "supports" ? "text-green-600" :
                      lastResult.decisionRuleOutcome === "weakens" ? "text-red-600" : "text-amber-600"
                    }`}>
                      Result: {lastResult.decisionRuleOutcome} ({lastResult.observedValue})
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
