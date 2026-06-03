import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createProjectSchema } from "@/lib/bmi/schemas/project";

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
    const result = validateBody(createProjectSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const project = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: d.name,
          description: d.description,
          businessType: d.businessType,
          currentStage: d.currentStage,
          primaryGoal: d.primaryGoal,
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
