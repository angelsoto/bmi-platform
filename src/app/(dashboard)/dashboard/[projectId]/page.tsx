import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TourPopover } from "@/components/onboarding-tour/TourPopover";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: {
          hypotheses: true,
          experiments: true,
          evidenceItems: true,
          learningLoops: true,
          landingPages: true,
        },
      },
      hypotheses: {
        include: { riskRanks: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
      experiments: {
        where: { status: { in: ["running", "analyzing"] } },
        take: 3,
      },
      pmfAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-semibold text-gray-700">Project not found</h2>
        <Link href="/dashboard" className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const pmf = project.pmfAssessments[0];
  const topHypotheses = project.hypotheses
    .filter((h) => h.riskRanks[0])
    .sort((a, b) => (b.riskRanks[0]?.validationPriorityScore ?? 0) - (a.riskRanks[0]?.validationPriorityScore ?? 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <TourPopover projectId={projectId} />
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="rounded-full bg-blueprint-100 px-2 py-1">{project.businessType}</span>
          <span className="rounded-full bg-blueprint-100 px-2 py-1">{project.currentStage}</span>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Riskiest Hypotheses */}
        <div className="col-span-2 rounded-lg border bg-white p-4 shadow-widget">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-navy-900">Riskiest Hypotheses</h2>
            <Link href={`/dashboard/${projectId}/hypotheses`} className="text-xs text-indigo-600 hover:text-indigo-800">
              View all
            </Link>
          </div>
          {topHypotheses.length === 0 ? (
            <p className="text-sm text-gray-400">No hypotheses ranked yet. Start with concept intake.</p>
          ) : (
            <div className="space-y-2">
              {topHypotheses.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{h.title}</p>
                    <p className="truncate text-xs text-gray-500">{h.type} · {h.evidenceStrength}</p>
                  </div>
                  <span className="ml-2 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {h.riskRanks[0]?.validationPriorityScore ?? "?"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PMF Readiness */}
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">PMF Readiness</h2>
          {pmf ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke={pmf.pmfScore && pmf.pmfScore >= 0.6 ? "#16a34a" : pmf.pmfScore && pmf.pmfScore >= 0.3 ? "#f59e0b" : "#dc2626"}
                      strokeWidth="8"
                      strokeDasharray={`${(pmf.pmfScore ?? 0) * 264} 264`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-lg font-bold text-navy-900">
                    {pmf.pmfScore ? `${Math.round(pmf.pmfScore * 100)}%` : "N/A"}
                  </span>
                </div>
              </div>
              <p className="text-center text-xs font-medium text-gray-600">{pmf.readinessState}</p>
              <Link href={`/dashboard/${projectId}/pmf`} className="block text-center text-xs text-indigo-600 hover:text-indigo-800">
                View details
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Assess PMF readiness after running experiments.</p>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active Experiments */}
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">Active Experiments</h2>
          {project.experiments.length === 0 ? (
            <p className="text-sm text-gray-400">No active experiments.</p>
          ) : (
            <div className="space-y-2">
              {project.experiments.map((e) => (
                <div key={e.id} className="text-sm">
                  <span className="font-medium text-gray-900">{e.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{e.status}</span>
                </div>
              ))}
            </div>
          )}
          <Link href={`/dashboard/${projectId}/experiments`} className="mt-2 block text-xs text-indigo-600 hover:text-indigo-800">
            Manage experiments
          </Link>
        </div>

        {/* Evidence Quality */}
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">Evidence Quality</h2>
          <p className="text-2xl font-bold text-navy-900">{project._count.evidenceItems}</p>
          <p className="text-xs text-gray-500">evidence items collected</p>
          <Link href={`/dashboard/${projectId}/evidence`} className="mt-2 block text-xs text-indigo-600 hover:text-indigo-800">
            Review evidence
          </Link>
        </div>

        {/* Learning Loops */}
        <div className="rounded-lg border bg-white p-4 shadow-widget">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">Learning Loops</h2>
          <p className="text-2xl font-bold text-navy-900">{project._count.learningLoops}</p>
          <p className="text-xs text-gray-500">loops created</p>
          <Link href={`/dashboard/${projectId}/loops`} className="mt-2 block text-xs text-indigo-600 hover:text-indigo-800">
            View learning loops
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-white p-4 shadow-widget">
        <h2 className="text-sm font-semibold text-navy-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/${projectId}/concept`}
            className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800"
          >
            Concept Intake
          </Link>
          <Link
            href={`/dashboard/${projectId}/hypotheses/new`}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Create Hypothesis
          </Link>
          <Link
            href={`/dashboard/${projectId}/experiments/new`}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Create Experiment
          </Link>
          <Link
            href={`/dashboard/${projectId}/surfaces/new`}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Create Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
