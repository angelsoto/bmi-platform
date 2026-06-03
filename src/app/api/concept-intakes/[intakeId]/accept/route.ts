import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

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
    if (!intake) return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    if (intake.userId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { hypotheses, acceptPersona, acceptOffer, persona, offer } = body;

    const result = await prisma.$transaction(async (tx) => {
      const created: any = { hypotheses: [], persona: null, offer: null };

      // Create selected hypotheses
      if (hypotheses && Array.isArray(hypotheses)) {
        for (const h of hypotheses) {
          const hypothesis = await tx.hypothesis.create({
            data: {
              projectId: intake.projectId,
              title: h.title,
              statement: h.statement,
              type: h.type || "desirability",
              status: "active",
              confidence: "medium",
            },
          });
          await tx.hypothesisRiskRank.create({
            data: {
              hypothesisId: hypothesis.id,
              projectId: intake.projectId,
              survivalCriticality: h.survivalCriticality || "high",
              uncertainty: "high",
              rationale: `AI-generated from concept intake. Recommended first test: ${h.recommendedFirstTest || "N/A"}`,
            },
          });
          created.hypotheses.push(hypothesis);
        }
      }

      // Create persona if accepted
      if (acceptPersona && persona) {
        created.persona = await tx.persona.create({
          data: {
            projectId: intake.projectId,
            name: persona.name,
            primaryPain: persona.primaryPain,
            description: `AI-generated from concept intake`,
            relatedHypothesisIds: JSON.stringify(created.hypotheses.map((h: any) => h.id)),
            createdByUserId: userId,
          },
        });
      }

      // Create offer if accepted
      if (acceptOffer && offer) {
        created.offer = await tx.offer.create({
          data: {
            projectId: intake.projectId,
            name: offer.name,
            valueProposition: offer.valueProposition,
            format: "service",
            relatedHypothesisIds: JSON.stringify(created.hypotheses.map((h: any) => h.id)),
            createdByUserId: userId,
          },
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
