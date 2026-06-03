import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { EventTimeline } from "@/components/analytics/EventTimeline";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Analytics" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Analytics</h1>
        <p className="text-sm text-gray-500">Event tracking and conversion metrics for your validation surfaces.</p>
      </div>

      <AnalyticsSummary projectId={projectId} />

      <div className="rounded-lg border bg-white p-4 shadow-widget">
        <h2 className="mb-3 text-sm font-semibold text-navy-900">Recent Events</h2>
        <EventTimeline projectId={projectId} />
      </div>
    </div>
  );
}
