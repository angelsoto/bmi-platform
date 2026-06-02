import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

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

    const experiment = await prisma.experiment.create({
      data: {
        projectId,
        hypothesisId: body.hypothesisId,
        name: body.name,
        description: body.description,
        experimentType: body.experimentType || "manual_validation",
        ownerUserId: body.ownerUserId || userId,
      },
    });
    return NextResponse.json(experiment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
