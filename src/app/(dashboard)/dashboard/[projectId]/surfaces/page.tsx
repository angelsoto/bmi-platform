"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LandingPageForm } from "@/components/surfaces/LandingPageForm";
import { Globe, AlertTriangle, ChevronRight, Plus, Minus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SurfacesPage() {
  const params = useParams<{ projectId: string }>();
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [surfaces, setSurfaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lpRes, sRes] = await Promise.all([
        fetch(`/api/projects/${params.projectId}/landing-pages`),
        fetch(`/api/projects/${params.projectId}/experiment-surfaces`),
      ]);
      setLandingPages(lpRes.ok ? await lpRes.json() : []);
      setSurfaces(sRes.ok ? await sRes.json() : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params.projectId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: "Experiment Surfaces" }]} />
          <h1 className="text-2xl font-bold text-navy-900">Experiment Surfaces</h1>
          <p className="text-sm text-gray-500">Landing pages and other deployment surfaces for validation.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {showForm ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Create Surface"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="mb-3 text-sm font-semibold text-navy-900">New Landing Page</h2>
          <LandingPageForm projectId={params.projectId} onSaved={() => { loadData(); setShowForm(false); }} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg border bg-white p-4"><div className="h-4 w-3/4 rounded bg-gray-200" /><div className="mt-2 h-3 w-1/2 rounded bg-gray-100" /></div>)}</div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>
      ) : landingPages.length === 0 && surfaces.length === 0 ? (
        <EmptyState icon={Globe} title="No surfaces yet" description="Create a landing page linked to a persona, offer, and hypothesis." />
      ) : (
        <div className="space-y-4">
          {landingPages.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-navy-900 mb-3">Landing Pages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {landingPages.map((lp) => (
                  <Link
                    key={lp.id}
                    href={`/dashboard/${params.projectId}/surfaces/${lp.id}`}
                    className="group rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-navy-900 group-hover:text-navy-700">{lp.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">/{lp.slug}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <StatusBadge status={lp.status} />
                      <span className="capitalize">{lp.journeyStage}</span>
                    </div>
                    <div className="mt-1 flex gap-3 text-[10px] text-gray-400">
                      <span>{lp.ctas?.length || 0} CTAs</span>
                      <span>{lp.contentBlocks?.length || 0} blocks</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {surfaces.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-navy-900 mb-3">Experiment Surfaces</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {surfaces.map((s) => (
                  <div key={s.id} className="rounded-lg border bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-900 capitalize">{s.surfaceType?.replace(/_/g, " ")}</span>
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
