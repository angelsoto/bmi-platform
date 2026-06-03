"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  projectId: string;
}

export function EventTimeline({ projectId }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/analytics/summary`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setEvents(data?.recentEvents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed bg-white p-8 text-center">
        <Clock className="mx-auto mb-2 h-6 w-6 text-gray-300" />
        <p className="text-sm text-gray-500">No events recorded yet</p>
        <p className="mt-1 text-xs text-gray-400">Events will appear here as users interact with your surfaces.</p>
      </div>
    );
  }

  const badgeColor = (type: string) => {
    switch (type) {
      case "page_view": return "bg-blue-100 text-blue-700";
      case "cta_click": return "bg-green-100 text-green-700";
      case "form_submit": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
      {events.map((ev) => (
        <div key={ev.id} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2 text-sm shadow-sm">
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badgeColor(ev.eventType)}`}>
            {ev.eventType?.replace(/_/g, " ")}
          </span>
          <span className="min-w-0 flex-1 truncate text-gray-700">{ev.eventName}</span>
          {ev.landingPageId && <span className="text-[10px] text-gray-400">surface</span>}
          <span className="shrink-0 text-[10px] text-gray-400">
            {new Date(ev.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ))}
    </div>
  );
}
