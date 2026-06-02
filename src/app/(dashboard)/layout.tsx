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

  // Middleware handles unauthenticated redirects, but guard here too
  if (!session?.user) {
    redirect("/auth/signin?auto=demo@bmi-platform.com");
  }

  const userId = session.user.id;

  // Auto-attach seeded projects if user has none
  const userProjects = await prisma.projectMember.count({
    where: { userId },
  });

  if (userProjects === 0 && session.user.email) {
    const firstProjectOwner = await prisma.user.findFirst({
      where: { email: { not: session.user.email as string } },
      orderBy: { createdAt: "asc" },
    });
    if (firstProjectOwner) {
      const adminProjects = await prisma.project.findMany({
        where: { ownerId: firstProjectOwner.id },
      });
      for (const project of adminProjects) {
        await prisma.projectMember.upsert({
          where: { userId_projectId: { userId, projectId: project.id } },
          update: {},
          create: { userId, projectId: project.id, role: "member" },
        });
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
