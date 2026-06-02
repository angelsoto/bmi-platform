import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ConceptPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session.user.id } } },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
    take: 1,
  });

  if (projects.length > 0) {
    redirect(`/dashboard/${projects[0].id}/concept`);
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-lg font-semibold text-gray-700">No projects yet</h2>
      <p className="mt-2 text-sm text-gray-500">Create a project first to start concept intake.</p>
      <Link
        href="/dashboard/projects/new"
        className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        Create Project
      </Link>
    </div>
  );
}
