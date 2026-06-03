import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createLearningLoopSchema } from "@/lib/bmi/schemas/more";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const loops = await prisma.learningLoop.findMany({ where: { projectId }, orderBy: { updatedAt: "desc" } });
    return NextResponse.json(loops);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(createLearningLoopSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const loop = await prisma.learningLoop.create({
      data: {
        projectId,
        sourceEntityType: d.sourceEntityType,
        sourceEntityId: d.sourceEntityId,
        outcomeSummary: d.outcomeSummary,
        insight: d.insight || "",
        targetEntityType: d.targetEntityType,
        targetEntityId: d.targetEntityId,
        ownerUserId: userId,
      },
    });
    return NextResponse.json(loop, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
