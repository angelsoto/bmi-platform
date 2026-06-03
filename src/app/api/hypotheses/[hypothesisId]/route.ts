import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { updateHypothesisSchema } from "@/lib/bmi/schemas/hypotheses";

export async function PATCH(req: Request, { params }: { params: Promise<{ hypothesisId: string }> }) {
  try {
    const { hypothesisId } = await params;
    const { userId } = await requireAuth();
    const body = await req.json();
    const result = validateBody(updateHypothesisSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const existing = await prisma.hypothesis.findUnique({ where: { id: hypothesisId } });
    if (!existing) return NextResponse.json({ error: "Hypothesis not found" }, { status: 404 });

    // Create version snapshot before updating
    await prisma.hypothesisVersion.create({
      data: {
        hypothesisId,
        projectId: existing.projectId,
        versionNumber: existing.currentVersionNumber,
        statement: existing.statement,
        confidence: existing.confidence,
        evidenceStrength: existing.evidenceStrength,
        changedReason: d.changedReason || "Updated",
        changedByUserId: userId,
      },
    });

    const { changedReason, ...updateFields } = d;
    const updated = await prisma.hypothesis.update({
      where: { id: hypothesisId },
      data: {
        ...updateFields,
        currentVersionNumber: { increment: 1 },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ hypothesisId: string }> }) {
  try {
    const { hypothesisId } = await params;
    const hypothesis = await prisma.hypothesis.findUnique({
      where: { id: hypothesisId },
      include: { riskRanks: true, versions: { orderBy: { createdAt: "desc" } }, evidence: true, experiments: true },
    });
    if (!hypothesis) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(hypothesis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
