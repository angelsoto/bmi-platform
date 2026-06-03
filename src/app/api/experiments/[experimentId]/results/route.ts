import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { runExperimentResultChain } from "@/lib/bmi/experiment-evidence-chain/result-processor";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { recordResultSchema } from "@/lib/bmi/schemas/experiments";

export async function POST(req: Request, { params }: { params: Promise<{ experimentId: string }> }) {
  try {
    const { experimentId } = await params;
    const { userId } = await requireAuth();
    const body = await req.json();
    const result = validateBody(recordResultSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
    if (!experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });

    const output = await runExperimentResultChain({
      experimentId,
      projectId: experiment.projectId,
      metricName: d.metricName,
      observedValue: d.observedValue,
      threshold: d.threshold,
      metThreshold: d.metThreshold ?? d.observedValue >= d.threshold,
      decisionRuleOutcome: d.decisionRuleOutcome || (d.observedValue >= d.threshold ? "supports" : "weakens"),
      notes: d.notes,
      userId,
    });

    return NextResponse.json(output, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
