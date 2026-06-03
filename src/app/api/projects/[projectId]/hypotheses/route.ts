import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createHypothesisSchema } from "@/lib/bmi/schemas/hypotheses";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const hypotheses = await prisma.hypothesis.findMany({
      where: { projectId },
      include: { riskRanks: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { evidence: true, experiments: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(hypotheses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(createHypothesisSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const hypothesis = await prisma.hypothesis.create({
      data: {
        projectId,
        title: d.title,
        statement: d.statement,
        type: d.type,
        confidence: d.confidence,
        status: d.status,
        relatedPersonaId: d.relatedPersonaId,
        relatedOfferId: d.relatedOfferId,
      },
    });
    return NextResponse.json(hypothesis, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
