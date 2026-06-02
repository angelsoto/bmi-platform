"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { OfferForm } from "@/components/personas-offers/OfferForm";
import { Gift } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OffersPage() {
  const params = useParams<{ projectId: string }>();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    const res = await fetch(`/api/projects/${params.projectId}/offers`);
    if (res.ok) setOffers(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadOffers(); }, [params.projectId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Offers</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="mb-3 text-sm font-semibold text-navy-900">New Offer</h2>
          <OfferForm projectId={params.projectId} onSaved={() => loadOffers()} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-navy-900">Existing Offers</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : offers.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No offers yet"
              description="Create one above or generate via concept intake."
            />
          ) : (
            offers.map((o: any) => (
              <div key={o.id} className="rounded-md border bg-white p-3 shadow-sm">
                <h3 className="text-sm font-medium text-navy-900">{o.name}</h3>
                <p className="text-xs text-gray-500">{o.valueProposition}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
