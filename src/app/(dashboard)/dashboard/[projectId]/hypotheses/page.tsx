import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Target, ChevronRight, Plus } from "lucide-react";

export default async function HypothesesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const hypotheses = await prisma.hypothesis.findMany({
    where: { projectId },
    include: { riskRanks: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { evidence: true, experiments: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Hypotheses</h1>
          <p className="text-sm text-gray-500">Track your testable assumptions and their evidence.</p>
        </div>
        <Link
          href={`/dashboard/${projectId}/concept`}
          className="flex items-center gap-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New via Concept Intake
        </Link>
      </div>

      {hypotheses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <Target className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No hypotheses yet</h3>
          <p className="mt-1 text-sm text-gray-500">Run a concept intake to generate hypotheses.</p>
          <Link href={`/dashboard/${projectId}/concept`} className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
            Concept Intake
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {hypotheses.map((h) => (
            <Link
              key={h.id}
              href={`/dashboard/${projectId}/hypotheses/${h.id}`}
              className="group block rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-navy-900 group-hover:text-navy-700">{h.title}</h3>
                    <StatusBadge status={h.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{h.statement}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="font-medium text-navy-700 capitalize">{h.type}</span>
                {h.riskRanks[0] && (
                  <>
                    <span>Priority: <strong>{h.riskRanks[0].validationPriorityScore ?? "?"}</strong></span>
                    <RiskBadge level={h.riskRanks[0].survivalCriticality} />
                  </>
                )}
                <span>Evidence: <StatusBadge status={h.evidenceStrength} /></span>
                <span>Confidence: {h.confidence}</span>
                <span>{h._count.evidence} evidence items</span>
                <span>{h._count.experiments} experiments</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
