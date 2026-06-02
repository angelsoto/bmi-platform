import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function PATCH(req: Request, { params }: { params: Promise<{ hypothesisId: string }> }) {
  try {
    const { hypothesisId } = await params;
    const { userId } = await requireAuth();
    const body = await req.json();

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
        changedReason: body.changedReason || "Updated",
        changedByUserId: userId,
      },
    });

    const updated = await prisma.hypothesis.update({
      where: { id: hypothesisId },
      data: {
        ...body,
        currentVersionNumber: { increment: 1 },
        changedReason: undefined,
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
