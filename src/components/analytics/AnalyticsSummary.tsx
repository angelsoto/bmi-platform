"use client";

import { useState, useEffect } from "react";
import { BarChart3, Eye, MousePointerClick, Activity } from "lucide-react";

interface Props {
  projectId: string;
}

export function AnalyticsSummary({ projectId }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/analytics/summary`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg border bg-white p-4" />)}
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: "Total Events", value: data.totalEvents || 0, icon: Activity, color: "text-navy-900" },
    { label: "Page Views", value: data.pageViews || 0, icon: Eye, color: "text-indigo-600" },
    { label: "CTA Clicks", value: data.ctaClicks || 0, icon: MousePointerClick, color: "text-green-600" },
  ];

  // Build simple daily counts for bar chart
  const dailyCounts = new Map<string, number>();
  if (data.recentEvents) {
    for (const ev of data.recentEvents) {
      const day = new Date(ev.occurredAt).toLocaleDateString();
      dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
    }
  }
  const days = Array.from(dailyCounts.entries()).slice(0, 14).reverse();
  const maxCount = Math.max(...days.map((d) => d[1]), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border bg-white p-4 shadow-widget">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${card.color}`} />
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <span className={`mt-1 block text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      {days.length > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last 14 Days</h3>
          <div className="flex items-end gap-1 h-24">
            {days.map(([day, count]) => (
              <div key={day} className="flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-full rounded-sm bg-indigo-500 transition-all hover:bg-indigo-600"
                  style={{ height: `${Math.max((count / maxCount) * 100, 4)}%` }}
                  title={`${day}: ${count} events`}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>{days[0]?.[0]}</span>
            <span>{days[days.length - 1]?.[0]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
