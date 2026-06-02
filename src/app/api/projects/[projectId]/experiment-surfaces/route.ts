import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const surfaces = await prisma.experimentSurface.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(surfaces);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();
    const surface = await prisma.experimentSurface.create({
      data: { projectId, experimentId: body.experimentId, surfaceType: body.surfaceType || "landing_page", linkedEntityId: body.linkedEntityId },
    });
    return NextResponse.json(surface, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
