/**
 * Helper: redirects to the current user's first project route.
 * Used by top-level nav pages that need a project context.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export async function redirectToFirstProject(subPath: string) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const firstProject = await prisma.project.findFirst({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (!firstProject) {
    redirect("/dashboard");
  }

  redirect(`/dashboard/${firstProject.id}/${subPath}`);
}
