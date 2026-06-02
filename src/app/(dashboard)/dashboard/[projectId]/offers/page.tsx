"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OfferForm } from "@/components/personas-offers/OfferForm";
import { Gift, AlertTriangle, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OffersPage() {
  const params = useParams<{ projectId: string }>();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${params.projectId}/offers`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load (${res.status})`);
      }
      setOffers(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-md border bg-white p-3">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : offers.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No offers yet"
              description="Create one above or generate via concept intake."
            />
          ) : (
            offers.map((o: any) => (
              <Link key={o.id} href={`/dashboard/${params.projectId}/offers/${o.id}`}
                className="group block rounded-md border bg-white p-3 shadow-sm hover:shadow-md hover:border-navy-300 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-navy-900 group-hover:text-navy-700">{o.name}</h3>
                    <p className="text-xs text-gray-500">{o.valueProposition}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
