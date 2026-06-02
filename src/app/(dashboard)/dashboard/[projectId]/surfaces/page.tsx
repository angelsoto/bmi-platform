import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Globe } from "lucide-react";
import Link from "next/link";

export default async function SurfacesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const landingPages = await prisma.landingPage.findMany({
    where: { projectId },
    include: { ctas: true, contentBlocks: { take: 3, orderBy: { orderIndex: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  const surfaces = await prisma.experimentSurface.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Experiment Surfaces</h1>
        <p className="text-sm text-gray-500">Landing pages and other deployment surfaces for validation experiments.</p>
      </div>

      {landingPages.length === 0 && surfaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <Globe className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No surfaces yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create a landing page linked to a persona, offer, and hypothesis.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {landingPages.map((lp) => (
            <div key={lp.id} className="rounded-lg border bg-white p-4 shadow-widget">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-navy-900">{lp.name}</h3>
                  <p className="text-xs text-gray-500">/{lp.slug}</p>
                </div>
                <StatusBadge status={lp.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Stage: {lp.journeyStage}</span>
                <span>CTA count: {lp.ctas.length}</span>
                <span>Content blocks: {lp.contentBlocks.length}</span>
                <StatusBadge status={lp.governanceStatus} />
              </div>
            </div>
          ))}

          {surfaces.map((s) => (
            <div key={s.id} className="rounded-lg border bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy-900">
                  {s.surfaceType.replace(/_/g, " ")}
                </span>
                <StatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
