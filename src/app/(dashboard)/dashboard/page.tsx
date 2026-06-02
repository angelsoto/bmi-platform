import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?auto=demo@bmi-platform.com");

  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      _count: { select: { hypotheses: true, experiments: true, evidenceItems: true, learningLoops: true } },
      pmfAssessments: { orderBy: { createdAt: "desc" }, take: 1, select: { pmfScore: true, readinessState: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Command Center</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your validation workspace — select a project to drill in
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-700">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create a project to get started with scientific validation.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
            <Link
              href="/dashboard/projects/new"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              + New Project
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const pmf = project.pmfAssessments[0];
              const pmfScore = pmf?.pmfScore ?? 0;
              const pmfColor = pmfScore >= 0.6 ? "bg-teal-500" : pmfScore >= 0.3 ? "bg-amber-500" : "bg-gray-300";
              const evidenceCount = project._count.evidenceItems;
              const loopCount = project._count.learningLoops;

              return (
                <Link
                  key={project.id}
                  href={`/dashboard/${project.id}`}
                  className="group rounded-lg border bg-white p-5 shadow-widget transition-all hover:shadow-md hover:border-navy-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-navy-900 group-hover:text-navy-700">{project.name}</h3>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {project.proofCaseMode && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          Demo
                        </span>
                      )}
                      {pmf && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          pmf.readinessState === "strong_signal" || pmf.readinessState === "scale_ready"
                            ? "bg-teal-100 text-teal-700"
                            : pmf.readinessState === "emerging"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {pmf.readinessState.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* PMF Bar */}
                  {pmf && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>PMF Score</span>
                        <span className="font-semibold text-navy-700">{(pmfScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${pmfColor}`}
                          style={{ width: `${pmfScore * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metrics Grid */}
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-navy-900">{project._count.hypotheses}</div>
                      <div className="text-[10px] text-gray-400">Hypotheses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-navy-900">{project._count.experiments}</div>
                      <div className="text-[10px] text-gray-400">Experiments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-navy-900">{evidenceCount}</div>
                      <div className="text-[10px] text-gray-400">Evidence</div>
                    </div>
                  </div>

                  {/* Stage + Loops footer */}
                  <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
                    <span className="capitalize">Stage: {project.currentStage}</span>
                    {loopCount > 0 && <span>{loopCount} loop{loopCount !== 1 ? "s" : ""}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
