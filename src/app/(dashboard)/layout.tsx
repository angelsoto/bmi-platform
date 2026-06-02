import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?auto=demo@bmi-platform.com");
  }

  // Auto-attach seeded projects if user has none
  // (safety net for users who weren't auto-attached during sign-in)
  const membershipCount = await prisma.projectMember.count({
    where: { userId: session.user.id },
  });

  if (membershipCount === 0) {
    const seedOwner = await prisma.user.findFirst({
      where: { email: { not: session.user.email as string }, projects: { some: {} } },
      orderBy: { createdAt: "asc" },
    });
    if (seedOwner) {
      const seedProjects = await prisma.project.findMany({
        where: { ownerId: seedOwner.id },
        select: { id: true },
      });
      if (seedProjects.length > 0) {
        for (const p of seedProjects) {
          await prisma.projectMember.upsert({
            where: { userId_projectId: { userId: session.user.id, projectId: p.id } },
            update: {},
            create: { userId: session.user.id, projectId: p.id, role: "member" },
          });
        }
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">{children}</main>
      </div>
    </div>
  );
}
