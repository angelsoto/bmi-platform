import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { upsertMVVSchema } from "@/lib/bmi/schemas/more";

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
    const result = validateBody(upsertMVVSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const mvv = await prisma.mVVStatement.upsert({
      where: { projectId },
      update: {
        mission: d.mission,
        vision: d.vision,
        values: JSON.stringify(d.values || []),
        founderAssumptions: JSON.stringify(d.founderAssumptions || []),
        unresolvedTensions: JSON.stringify(d.unresolvedTensions || []),
        versionNumber: { increment: 1 },
      },
      create: {
        projectId,
        mission: d.mission,
        vision: d.vision,
        values: JSON.stringify(d.values || []),
        founderAssumptions: JSON.stringify(d.founderAssumptions || []),
        unresolvedTensions: JSON.stringify(d.unresolvedTensions || []),
        createdByUserId: userId,
      },
    });

    return NextResponse.json(mvv, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
