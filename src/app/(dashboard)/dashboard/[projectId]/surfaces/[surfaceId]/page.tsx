"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft, Save, Rocket, BarChart3 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function SurfaceDetailPage() {
  const params = useParams<{ projectId: string; surfaceId: string }>();
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", journeyStage: "awareness" });
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}/landing-pages`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const lp = list.find((item: any) => item.id === params.surfaceId);
        if (lp) {
          setPage(lp);
          setForm({ name: lp.name, slug: lp.slug, journeyStage: lp.journeyStage || "awareness" });
        } else {
          setError("Landing page not found");
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));

    fetch(`/api/landing-pages/${params.surfaceId}/analytics`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setAnalytics)
      .catch(() => {});
  }, [params.projectId, params.surfaceId]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/landing-pages/${params.surfaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok && res.status !== 405) throw new Error("Failed to update");
      setPage({ ...page, ...form });
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeploy = async () => {
    try {
      const res = await fetch(`/api/landing-pages/${params.surfaceId}/deploy`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.blocked) {
          setError(`Deploy blocked: ${data.blocks.join(", ")}`);
        } else {
          throw new Error(data.error || "Failed to deploy");
        }
        return;
      }
      setPage(data);
    } catch (err: any) { setError(err.message); }
  };

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;

  if (error && !page) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm text-red-600">{error}</p>
      <Link href={`/dashboard/${params.projectId}/surfaces`} className="mt-2 text-sm text-indigo-600">Back to surfaces</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${params.projectId}/surfaces`} className="rounded p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <Breadcrumbs items={[{ label: "Surfaces", href: `/dashboard/${params.projectId}/surfaces` }, { label: page?.name || "Detail" }]} />
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-navy-900">{page?.name}</h1>
            {page && <StatusBadge status={page.status} />}
          </div>
        </div>
      </div>

      {analytics && (
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-navy-900">Analytics</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-gray-50 p-3">
              <span className="block text-lg font-bold text-navy-900">{analytics.totalViews || 0}</span>
              <span className="text-xs text-gray-500">Views</span>
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <span className="block text-lg font-bold text-navy-900">{analytics.totalClicks || 0}</span>
              <span className="text-xs text-gray-500">CTA Clicks</span>
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <span className="block text-lg font-bold text-navy-900">{analytics.conversionRate ? `${(analytics.conversionRate * 100).toFixed(1)}%` : "N/A"}</span>
              <span className="text-xs text-gray-500">Conversion</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6 shadow-widget space-y-4">
        <h2 className="text-sm font-semibold text-navy-900">Edit Landing Page</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Journey Stage</label>
          <select value={form.journeyStage} onChange={(e) => setForm({ ...form, journeyStage: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="awareness">Awareness</option>
            <option value="consideration">Consideration</option>
            <option value="decision">Decision</option>
            <option value="retention">Retention</option>
          </select>
        </div>
        <p className="text-xs text-gray-400">/{page?.slug}</p>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </button>
          {page?.status !== "deployed" && (
            <button onClick={handleDeploy} className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <Rocket className="h-4 w-4" /> Deploy
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-widget">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-navy-900">Content</h3>
        </div>
        {page?.ctas && (
          <div className="mb-3">
            <span className="text-xs font-medium text-gray-700">CTAs ({page.ctas.length})</span>
            <div className="mt-1 space-y-1">
              {page.ctas.map((cta: any) => (
                <div key={cta.id} className="rounded bg-gray-50 px-3 py-1.5 text-xs text-gray-600">{cta.label || cta.text || "CTA"}</div>
              ))}
            </div>
          </div>
        )}
        {page?.contentBlocks && (
          <div>
            <span className="text-xs font-medium text-gray-700">Content Blocks ({page.contentBlocks.length})</span>
            <div className="mt-1 space-y-1">
              {page.contentBlocks.map((block: any) => (
                <div key={block.id} className="rounded bg-gray-50 px-3 py-1.5 text-xs text-gray-600 truncate">{block.content?.substring(0, 80) || block.type}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
