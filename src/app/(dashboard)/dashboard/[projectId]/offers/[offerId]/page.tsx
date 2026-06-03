"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Gift, ArrowLeft, Save, Trash2 } from "lucide-react";

const FORMATS = ["service", "product", "subscription", "program", "other"];
const PRICE_MODELS = ["one_time", "recurring", "tiered", "free", "undecided"];

export default function OfferDetailPage() {
  const params = useParams<{ projectId: string; offerId: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", valueProposition: "", format: "service", priceModel: "", priceAmount: "" });

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}/offers`)
      .then((r) => r.ok ? r.json() : [])
      .then((list) => {
        const o = list.find((item: any) => item.id === params.offerId);
        if (o) {
          setOffer(o);
          setForm({ name: o.name, valueProposition: o.valueProposition, format: o.format || "service", priceModel: o.priceModel || "", priceAmount: o.priceAmount ? String(o.priceAmount) : "" });
        } else setError("Offer not found");
      })
      .catch(() => setError("Failed to load offer"))
      .finally(() => setLoading(false));
  }, [params.projectId, params.offerId]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.valueProposition.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/offers/${params.offerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priceAmount: form.priceAmount ? Number(form.priceAmount) : undefined }),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.push(`/dashboard/${params.projectId}/offers`);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this offer?")) return;
    try {
      await fetch(`/api/offers/${params.offerId}`, { method: "DELETE" });
      router.push(`/dashboard/${params.projectId}/offers`);
    } catch { setError("Failed to delete"); }
  };

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm text-red-600">{error}</p>
      <Link href={`/dashboard/${params.projectId}/offers`} className="mt-2 text-sm text-indigo-600">Back to offers</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${params.projectId}/offers`} className="rounded p-1 text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-navy-900">Edit Offer</h1>
          <p className="text-sm text-gray-500">{offer?.id}</p>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-widget space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Value Proposition</label>
          <input type="text" value={form.valueProposition} onChange={(e) => setForm({ ...form, valueProposition: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Format</label>
            <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              {FORMATS.map((f) => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Price Model</label>
            <select value={form.priceModel} onChange={(e) => setForm({ ...form, priceModel: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">None</option>
              {PRICE_MODELS.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Price Amount</label>
          <input type="number" value={form.priceAmount} onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="0.00" />
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !form.name || !form.valueProposition}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handleDelete}
            className="flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
