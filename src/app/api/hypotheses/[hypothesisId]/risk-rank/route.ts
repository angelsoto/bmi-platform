import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { computeValidationPriorityScore } from "@/lib/bmi/formulas";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { rankHypothesisSchema } from "@/lib/bmi/schemas/hypotheses";
import { getAIProvider, getLastAIResult } from "@/lib/ai/client";

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

    // Enrich with AI rationale (non-blocking)
    let aiRationale: string | null = null;
    try {
      const ai = getAIProvider();
      const rankings = await ai.rankHypotheses([{
        id: hypothesisId,
        title: hypothesis.title,
        statement: hypothesis.statement,
        type: hypothesis.type || "desirability",
      }]);
      if (rankings?.[0]?.rationale) {
        aiRationale = rankings[0].rationale;
        const aiResult = getLastAIResult();
        if (aiResult) {
          await prisma.aILog.create({
            data: {
              projectId: hypothesis.projectId,
              userId,
              functionType: "hypothesis_ranking",
              inputSummary: hypothesis.statement.substring(0, 200),
              model: aiResult.model,
              tokenUsage: JSON.stringify(aiResult.tokenUsage),
              latency: aiResult.latency,
              outputEntityType: "hypothesis_risk_rank",
              outputEntityId: hypothesisId,
            },
          });
        }
      }
    } catch {
      // AI enrichment is non-blocking
    }

    const rank = await prisma.hypothesisRiskRank.create({
      data: {
        hypothesisId,
        projectId: hypothesis.projectId,
        survivalCriticality: d.survivalCriticality,
        uncertainty: d.uncertainty,
        validationPriorityScore: score,
        rationale: aiRationale || d.rationale,
      },
    });

    return NextResponse.json(rank, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
