import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { computeValidationPriorityScore } from "@/lib/bmi/formulas";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { rankHypothesisSchema } from "@/lib/bmi/schemas/hypotheses";

export async function POST(req: Request, { params }: { params: Promise<{ hypothesisId: string }> }) {
  try {
    const { hypothesisId } = await params;
    const { userId } = await requireAuth();
    const body = await req.json();
    const result = validateBody(rankHypothesisSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const hypothesis = await prisma.hypothesis.findUnique({ where: { id: hypothesisId } });
    if (!hypothesis) return NextResponse.json({ error: "Hypothesis not found" }, { status: 404 });

    const score = computeValidationPriorityScore(d.survivalCriticality, d.uncertainty);

    const rank = await prisma.hypothesisRiskRank.create({
      data: {
        hypothesisId,
        projectId: hypothesis.projectId,
        survivalCriticality: d.survivalCriticality,
        uncertainty: d.uncertainty,
        validationPriorityScore: score,
        rationale: d.rationale,
      },
    });

    return NextResponse.json(rank, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
