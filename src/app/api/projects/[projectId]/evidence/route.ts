import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createEvidenceSchema } from "@/lib/bmi/schemas/evidence";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const evidence = await prisma.evidenceItem.findMany({
      where: { projectId },
      include: { qualityReviews: { include: { biasFlags: true }, take: 1 }, hypothesis: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(evidence);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(createEvidenceSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const item = await prisma.evidenceItem.create({
      data: {
        projectId,
        sourceType: d.sourceType,
        summary: d.summary,
        rawText: d.rawText,
        relatedHypothesisId: d.relatedHypothesisId,
        relatedExperimentId: d.relatedExperimentId,
        collectedByUserId: userId,
        collectedAt: new Date(),
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
