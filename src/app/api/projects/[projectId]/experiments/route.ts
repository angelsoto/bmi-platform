import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createExperimentSchema } from "@/lib/bmi/schemas/experiments";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const experiments = await prisma.experiment.findMany({
      where: { projectId },
      include: { hypothesis: { select: { title: true } }, results: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(experiments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(createExperimentSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const experiment = await prisma.experiment.create({
      data: {
        projectId,
        hypothesisId: d.hypothesisId,
        name: d.name,
        description: d.description,
        experimentType: d.experimentType,
        ownerUserId: d.ownerUserId || userId,
      },
    });
    return NextResponse.json(experiment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
