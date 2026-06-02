import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { runExperimentResultChain } from "@/lib/bmi/experiment-evidence-chain/result-processor";

export async function POST(req: Request, { params }: { params: Promise<{ experimentId: string }> }) {
  try {
    const { experimentId } = await params;
    const { userId } = await requireAuth();
    const body = await req.json();

    const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
    if (!experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });

    const output = await runExperimentResultChain({
      experimentId,
      projectId: experiment.projectId,
      metricName: body.metricName,
      observedValue: body.observedValue,
      threshold: body.threshold,
      metThreshold: body.metThreshold ?? body.observedValue >= body.threshold,
      decisionRuleOutcome: body.decisionRuleOutcome || (body.observedValue >= body.threshold ? "supports" : "weakens"),
      notes: body.notes,
      userId,
    });

    return NextResponse.json(output, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
