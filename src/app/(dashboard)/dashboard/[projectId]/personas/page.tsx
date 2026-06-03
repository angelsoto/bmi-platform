"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PersonaForm } from "@/components/personas-offers/PersonaForm";
import { Users, AlertTriangle, ChevronRight, Trash2, CheckSquare, Square, Edit3 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PersonasPage() {
  const params = useParams<{ projectId: string }>();
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const loadPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${params.projectId}/personas`);
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      setPersonas(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPersonas(); }, [params.projectId]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === personas.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(personas.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} persona${selected.size > 1 ? "s" : ""}?`)) return;
    try {
      const res = await fetch(`/api/projects/${params.projectId}/personas/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSelected(new Set());
      setSelectMode(false);
      loadPersonas();
    } catch { setError("Failed to delete selected items"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Personas</h1>
        <button onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
          {selectMode ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
          {selectMode ? "Done" : "Select"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="mb-3 text-sm font-semibold text-navy-900">New Persona</h2>
          <PersonaForm projectId={params.projectId} onSaved={() => loadPersonas()} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy-900">Existing Personas</h2>
            {selectMode && selected.size > 0 && (
              <button onClick={handleBulkDelete} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800">
                <Trash2 className="h-3 w-3" /> Delete ({selected.size})
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-md border bg-white p-3"><div className="h-4 w-3/4 rounded bg-gray-200" /><div className="mt-2 h-3 w-1/2 rounded bg-gray-100" /></div>)}</div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>
          ) : personas.length === 0 ? (
            <EmptyState icon={Users} title="No personas yet" description="Create one above or generate via concept intake." />
          ) : (
            <div className="space-y-2">
              {personas.map((p: any) => (
                <div key={p.id} className="group rounded-md border bg-white shadow-sm hover:shadow-md hover:border-navy-300 transition-all">
                  {selectMode ? (
                    <div className="flex items-center gap-3 p-3">
                      <button onClick={() => toggleSelect(p.id)} className="shrink-0">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border-2 ${selected.has(p.id) ? "border-navy-900 bg-navy-900" : "border-gray-300"}`}>
                          {selected.has(p.id) && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-navy-900">{p.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{p.primaryPain}</p>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/dashboard/${params.projectId}/personas/${p.id}`} className="flex items-center gap-3 p-3">
                      <Edit3 className="h-3.5 w-3.5 shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-navy-900 group-hover:text-navy-700">{p.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{p.primaryPain}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
