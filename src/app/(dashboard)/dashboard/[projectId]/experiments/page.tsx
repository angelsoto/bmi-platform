import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FlaskConical, ChevronRight, Plus } from "lucide-react";

export default async function ExperimentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const experiments = await prisma.experiment.findMany({
    where: { projectId },
    include: { hypothesis: { select: { title: true, id: true } }, results: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Experiments</h1>
          <p className="text-sm text-gray-500">Every experiment needs a metric, threshold, and decision rule.</p>
        </div>
        <Link
          href={`/dashboard/${projectId}/hypotheses`}
          className="flex items-center gap-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Create from Hypothesis
        </Link>
      </div>

      {experiments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <FlaskConical className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No experiments yet</h3>
          <p className="mt-1 text-sm text-gray-500">Design an experiment from your highest-risk hypothesis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {experiments.map((exp) => {
            const lastResult = exp.results[0];
            return (
              <Link
                key={exp.id}
                href={`/dashboard/${projectId}/experiments/${exp.id}`}
                className="group block rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-navy-900 group-hover:text-navy-700">{exp.name}</h3>
                      <StatusBadge status={exp.status} />
                    </div>
                    {exp.description && (
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{exp.description}</p>
                    )}
                    {exp.hypothesis && (
                      <p className="mt-1 text-xs text-gray-400">
                        Testing: &ldquo;{exp.hypothesis.title}&rdquo;
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="font-medium text-navy-700">{exp.experimentType.replace(/_/g, " ")}</span>
                  {exp.startDate && (
                    <span>Started: {exp.startDate.toLocaleDateString()}</span>
                  )}
                  {lastResult && (
                    <span className={`font-medium ${
                      lastResult.decisionRuleOutcome === "supports" ? "text-green-600" :
                      lastResult.decisionRuleOutcome === "weakens" ? "text-red-600" :
                      "text-amber-600"
                    }`}>
                      Result: {lastResult.decisionRuleOutcome} ({lastResult.observedValue})
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
