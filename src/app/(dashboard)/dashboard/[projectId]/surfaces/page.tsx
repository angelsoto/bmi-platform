import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Globe, ChevronRight, Plus } from "lucide-react";

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
    where: { projectId }, orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Experiment Surfaces</h1>
          <p className="text-sm text-gray-500">Landing pages and other deployment surfaces for validation.</p>
        </div>
        <Link
          href={`/dashboard/${projectId}/concept`}
          className="flex items-center gap-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Create Surface
        </Link>
      </div>

      {landingPages.length === 0 && surfaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <Globe className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No surfaces yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create a landing page linked to a persona, offer, and hypothesis.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {landingPages.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-navy-900 mb-3">Landing Pages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {landingPages.map((lp) => (
                  <Link
                    key={lp.id}
                    href={`/dashboard/${projectId}/surfaces/${lp.id}`}
                    className="group rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-navy-900 group-hover:text-navy-700">{lp.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">/{lp.slug}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <StatusBadge status={lp.status} />
                      <span className="capitalize">{lp.journeyStage}</span>
                    </div>
                    <div className="mt-1 flex gap-3 text-[10px] text-gray-400">
                      <span>{lp.ctas.length} CTAs</span>
                      <span>{lp.contentBlocks.length} blocks</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {surfaces.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-navy-900 mb-3">Experiment Surfaces</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {surfaces.map((s) => (
                  <div key={s.id} className="rounded-lg border bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-900 capitalize">{s.surfaceType.replace(/_/g, " ")}</span>
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
