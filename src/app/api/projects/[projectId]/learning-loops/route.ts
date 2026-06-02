import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

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

    const loop = await prisma.learningLoop.create({
      data: {
        projectId,
        sourceEntityType: body.sourceEntityType,
        sourceEntityId: body.sourceEntityId,
        outcomeSummary: body.outcomeSummary,
        insight: body.insight,
        targetEntityType: body.targetEntityType,
        targetEntityId: body.targetEntityId,
        ownerUserId: userId,
      },
    });
    return NextResponse.json(loop, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
