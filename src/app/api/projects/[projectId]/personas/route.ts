import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);

    const personas = await prisma.persona.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(personas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();

    const persona = await prisma.persona.create({
      data: {
        projectId,
        name: body.name,
        description: body.description,
        primaryPain: body.primaryPain,
        context: body.context,
        relatedHypothesisIds: JSON.stringify(body.relatedHypothesisIds || []),
        createdByUserId: userId,
      },
    });

    return NextResponse.json(persona, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
