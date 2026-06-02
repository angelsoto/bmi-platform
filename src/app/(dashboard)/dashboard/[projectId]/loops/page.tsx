import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RefreshCw } from "lucide-react";

export default async function LoopsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const loops = await prisma.learningLoop.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Learning Loops</h1>
        <p className="text-sm text-gray-500">Outcome → Insight → Action → Measurement. Close the validation system.</p>
      </div>

      {loops.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <RefreshCw className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No learning loops yet</h3>
          <p className="mt-1 text-sm text-gray-500">Learning loops are created automatically when you record experiment results.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {loops.map((loop) => (
            <div key={loop.id} className="rounded-lg border bg-white p-4 shadow-widget">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={loop.status} />
                    <span className="text-xs text-gray-400">{loop.sourceEntityType.replace(/_/g, " ")}</span>
                  </div>
                  <h3 className="font-medium text-navy-900">{loop.outcomeSummary}</h3>
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
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>Created: {loop.createdAt.toLocaleDateString()}</span>
                {loop.closedAt && <span>Closed: {loop.closedAt.toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
