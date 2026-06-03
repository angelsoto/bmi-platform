import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RefreshCw, ChevronRight } from "lucide-react";

export default async function LoopsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ status?: string }>;
}) {
  const { projectId } = await params;
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const statusFilter = sp?.status === "closed" ? "closed" : sp?.status === "open" ? "open" : undefined;

  const loops = await prisma.learningLoop.findMany({
    where: { projectId, ...(statusFilter ? { status: statusFilter } : {}) },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Learning Loops</h1>
        <p className="text-sm text-gray-500">Outcome → Insight → Action → Measurement. Close the validation system.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/dashboard/${projectId}/loops`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            !statusFilter ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}>All</Link>
        {["open", "closed"].map((s) => (
          <Link key={s} href={`/dashboard/${projectId}/loops?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>{s}</Link>
        ))}
      </div>

      {loops.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <RefreshCw className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No learning loops yet</h3>
          <p className="mt-1 text-sm text-gray-500">Learning loops are created automatically when you record experiment results.</p>
          <Link href={`/dashboard/${projectId}/experiments`}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            View Experiments
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loops.map((loop) => (
            <Link
              key={loop.id}
              href={`/dashboard/${projectId}/loops/${loop.id}`}
              className="group block rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusBadge status={loop.status} />
                    <span className="text-xs text-gray-400">{loop.sourceEntityType.replace(/_/g, " ")}</span>
                  </div>
                  <h3 className="font-medium text-navy-900 group-hover:text-navy-700">{loop.outcomeSummary}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-700">Insight:</span> {loop.insight}</p>
                    {loop.actionTaken && (
                      <p><span className="font-medium text-gray-700">Action:</span> {loop.actionTaken}</p>
                    )}
                    {loop.measurementPlan && (
                      <p><span className="font-medium text-gray-700">Measurement:</span> {loop.measurementPlan}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>Created: {loop.createdAt.toLocaleDateString()}</span>
                {loop.closedAt && <span>Closed: {loop.closedAt.toLocaleDateString()}</span>}
                {loop.closedAt && loop.createdAt && (
                  <span>
                    Duration: {Math.round((loop.closedAt.getTime() - loop.createdAt.getTime()) / (1000 * 60 * 60 * 24))}d
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
