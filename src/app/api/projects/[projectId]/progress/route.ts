import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createProgressTrackSchema } from "@/lib/bmi/schemas/more";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const items = await prisma.progressTrack.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(createProgressTrackSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const item = await prisma.progressTrack.create({
      data: {
        projectId,
        name: d.name,
        type: d.type,
        description: d.description,
        health: d.health,
        completionScore: d.completionScore,
        currentFocus: d.currentFocus,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
