import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const userId = session.user.id;

  // Auto-attach seeded projects if user has none
  const userProjects = await prisma.projectMember.count({
    where: { userId },
  });

  if (userProjects === 0) {
    // Find projects owned by admin and add this user as member
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@test.com" },
    });
    if (adminUser) {
      const adminProjects = await prisma.project.findMany({
        where: { ownerId: adminUser.id },
      });
      for (const project of adminProjects) {
        const existing = await prisma.projectMember.findUnique({
          where: { userId_projectId: { userId, projectId: project.id } },
        });
        if (!existing) {
          await prisma.projectMember.create({
            data: { userId, projectId: project.id, role: "member" },
          });
        }
      }
    }
  }

  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      _count: { select: { hypotheses: true, experiments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Command Center</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your validation workspace
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
          <Link
            href="/dashboard/concept"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Or start with a concept intake
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
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${project.id}`}
                className="rounded-lg border bg-white p-4 shadow-widget transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-navy-900">{project.name}</h3>
                  {project.proofCaseMode && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      Demo
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="mt-3 flex gap-4 text-xs text-gray-400">
                  <span>{project._count.hypotheses} hypotheses</span>
                  <span>{project._count.experiments} experiments</span>
                </div>
                <div className="mt-2 text-xs text-gray-400 capitalize">
                  Stage: {project.currentStage}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
