import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { computeValidationPriorityScore } from "@/lib/bmi/formulas";

export async function POST(req: Request, { params }: { params: Promise<{ hypothesisId: string }> }) {
  try {
    const { hypothesisId } = await params;
    const { userId } = await requireAuth();
    const body = await req.json();

    const hypothesis = await prisma.hypothesis.findUnique({ where: { id: hypothesisId } });
    if (!hypothesis) return NextResponse.json({ error: "Hypothesis not found" }, { status: 404 });

    const score = computeValidationPriorityScore(body.survivalCriticality, body.uncertainty);

    const rank = await prisma.hypothesisRiskRank.create({
      data: {
        hypothesisId,
        projectId: hypothesis.projectId,
        survivalCriticality: body.survivalCriticality || "medium",
        uncertainty: body.uncertainty || "medium",
        validationPriorityScore: score,
        rationale: body.rationale || "",
      },
    });

    return NextResponse.json(rank, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
