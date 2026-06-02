import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { getAIProvider } from "@/lib/ai/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;
    const { userId } = await requireAuth();

    const intake = await prisma.conceptIntake.findUnique({
      where: { id: intakeId },
    });

    if (!intake) {
      return NextResponse.json({ error: "Concept intake not found" }, { status: 404 });
    }

    if (intake.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Call AI deconstruction chain
    const ai = getAIProvider();
    const output = await ai.deconstruct(intake.rawInput);

    // Create assumptions and hypotheses in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update intake status
      await tx.conceptIntake.update({
        where: { id: intakeId },
        data: {
          status: "processed",
          parsedSummary: output.summary,
          processedAt: new Date(),
        },
      });

      // Create assumptions
      const assumptions = [];
      for (const a of output.assumptions) {
        const assumption = await tx.businessAssumption.create({
          data: {
            projectId: intake.projectId,
            conceptIntakeId: intakeId,
            statement: a.statement,
            category: a.category,
            riskLevel: a.riskLevel,
          },
        });
        assumptions.push(assumption);
      }

      // Create hypotheses
      const hypotheses = [];
      for (const h of output.hypotheses) {
        const hypothesis = await tx.hypothesis.create({
          data: {
            projectId: intake.projectId,
            title: h.title,
            statement: h.statement,
            type: h.type,
            status: "active",
            confidence: "medium",
          },
        });

        // Create risk rank
        await tx.hypothesisRiskRank.create({
          data: {
            hypothesisId: hypothesis.id,
            projectId: intake.projectId,
            survivalCriticality: h.survivalCriticality,
            uncertainty: "high",
            validationPriorityScore: null, // computed below
            rationale: `AI-generated from concept intake. Recommended first test: ${h.recommendedFirstTest}`,
          },
        });

        hypotheses.push(hypothesis);
      }

      // Create draft persona if suggested
      let persona = null;
      if (output.suggestedPersona) {
        persona = await tx.persona.create({
          data: {
            projectId: intake.projectId,
            name: output.suggestedPersona.name,
            primaryPain: output.suggestedPersona.primaryPain,
            description: `AI-generated from concept intake: ${intake.rawInput.slice(0, 200)}`,
            relatedHypothesisIds: JSON.stringify(hypotheses.map((h) => h.id)),
            createdByUserId: userId,
          },
        });
      }

      // Create draft offer if suggested
      let offer = null;
      if (output.suggestedOffer) {
        offer = await tx.offer.create({
          data: {
            projectId: intake.projectId,
            name: output.suggestedOffer.name,
            valueProposition: output.suggestedOffer.valueProposition,
            format: "service",
            relatedHypothesisIds: JSON.stringify(hypotheses.map((h) => h.id)),
            createdByUserId: userId,
          },
        });
      }

      return { intakeId, assumptions, hypotheses, persona, offer, summary: output.summary, suggestedNextActions: output.suggestedNextActions };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
