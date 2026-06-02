"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PersonaForm } from "@/components/personas-offers/PersonaForm";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PersonasPage() {
  const params = useParams<{ projectId: string }>();
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPersonas = async () => {
    const res = await fetch(`/api/projects/${params.projectId}/personas`);
    if (res.ok) setPersonas(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadPersonas(); }, [params.projectId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Personas</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="mb-3 text-sm font-semibold text-navy-900">New Persona</h2>
          <PersonaForm projectId={params.projectId} onSaved={() => loadPersonas()} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-navy-900">Existing Personas</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : personas.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No personas yet"
              description="Create one above or generate via concept intake."
            />
          ) : (
            personas.map((p: any) => (
              <div key={p.id} className="rounded-md border bg-white p-3 shadow-sm">
                <h3 className="text-sm font-medium text-navy-900">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.primaryPain}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
