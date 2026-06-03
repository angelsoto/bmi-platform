import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const mvv = await prisma.mVVStatement.findFirst({ where: { projectId } });
    return NextResponse.json(mvv || { mission: null, vision: null, values: "[]", founderAssumptions: "[]", unresolvedTensions: "[]" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();

    if (!body.mission || !body.vision) {
      return NextResponse.json({ error: "Mission and vision are required" }, { status: 400 });
    }

    const mvv = await prisma.mVVStatement.upsert({
      where: { projectId },
      update: {
        mission: body.mission,
        vision: body.vision,
        values: JSON.stringify(body.values || []),
        founderAssumptions: JSON.stringify(body.founderAssumptions || []),
        unresolvedTensions: JSON.stringify(body.unresolvedTensions || []),
        versionNumber: { increment: 1 },
      },
      create: {
        projectId,
        mission: body.mission,
        vision: body.vision,
        values: JSON.stringify(body.values || []),
        founderAssumptions: JSON.stringify(body.founderAssumptions || []),
        unresolvedTensions: JSON.stringify(body.unresolvedTensions || []),
        createdByUserId: userId,
      },
    });

    return NextResponse.json(mvv, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
