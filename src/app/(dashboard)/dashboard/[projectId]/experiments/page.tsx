import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FlaskConical } from "lucide-react";

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
    include: {
      hypothesis: { select: { title: true } },
      results: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Experiments</h1>
        <p className="text-sm text-gray-500">Disciplined validation activity — every experiment needs a metric, threshold, and decision rule.</p>
      </div>

      {experiments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <FlaskConical className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No experiments yet</h3>
          <p className="mt-1 text-sm text-gray-500">Design an experiment from your highest-risk hypothesis.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {experiments.map((exp) => (
            <div key={exp.id} className="rounded-lg border bg-white p-4 shadow-widget">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-navy-900">{exp.name}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{exp.description}</p>
                  {exp.hypothesis && (
                    <p className="mt-1 text-xs text-gray-400">
                      Testing: &quot;{exp.hypothesis.title}&quot;
                    </p>
                  )}
                </div>
                <StatusBadge status={exp.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Type: {exp.experimentType.replace(/_/g, " ")}</span>
                {exp.startDate && (
                  <span>Started: {exp.startDate.toLocaleDateString()}</span>
                )}
                {exp.results[0] && (
                  <span className="font-medium text-navy-700">
                    Result: {exp.results[0].decisionRuleOutcome} ({exp.results[0].observedValue})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
