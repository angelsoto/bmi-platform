import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { acceptIntakeSchema } from "@/lib/bmi/schemas/more";

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
    const result = validateBody(acceptIntakeSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const created = await prisma.$transaction(async (tx) => {
      const created: any = { hypotheses: [], persona: null, offer: null };

      // Create selected hypotheses
      if (d.hypotheses) {
        for (const h of d.hypotheses) {
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
      if (d.acceptPersona && d.persona) {
        created.persona = await tx.persona.create({
          data: {
            projectId: intake.projectId,
            name: d.persona.name,
            primaryPain: d.persona.primaryPain,
            description: `AI-generated from concept intake`,
            relatedHypothesisIds: JSON.stringify(created.hypotheses.map((h: any) => h.id)),
            createdByUserId: userId,
          },
        });
      }

      // Create offer if accepted
      if (d.acceptOffer && d.offer) {
        created.offer = await tx.offer.create({
          data: {
            projectId: intake.projectId,
            name: d.offer.name,
            valueProposition: d.offer.valueProposition,
            format: "service",
            relatedHypothesisIds: JSON.stringify(created.hypotheses.map((h: any) => h.id)),
            createdByUserId: userId,
          },
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, ...created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
