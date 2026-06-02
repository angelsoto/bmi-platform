import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { hypotheses: true, experiments: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const { name, description, businessType, currentStage, primaryGoal } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const project = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          description,
          businessType: businessType || "startup",
          currentStage: currentStage || "idea",
          primaryGoal,
          ownerId: userId,
          proofCaseMode: false,
        },
      });

      await tx.projectMember.create({
        data: {
          userId,
          projectId: project.id,
          role: "owner",
        },
      });

      return project;
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
