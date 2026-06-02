import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const pages = await prisma.landingPage.findMany({
      where: { projectId },
      include: { ctas: true, contentBlocks: { orderBy: { orderIndex: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId, "owner");
    const body = await req.json();

    const page = await prisma.landingPage.create({
      data: {
        projectId,
        name: body.name,
        slug: body.slug,
        personaId: body.personaId,
        offerId: body.offerId,
        hypothesisId: body.hypothesisId,
        journeyStage: body.journeyStage || "awareness",
      },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
