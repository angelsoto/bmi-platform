import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function POST(req: Request, { params }: { params: Promise<{ experimentId: string }> }) {
  try {
    const { experimentId } = await params;
    await requireAuth();

    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: { decisionRule: true, metrics: true },
    });
    if (!experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });

    // Guardrails: cannot start unless linked hypothesis, metric, and decision rule exist
    if (!experiment.hypothesisId) return NextResponse.json({ error: "Linked hypothesis required" }, { status: 400 });
    if (!experiment.primaryMetricId) return NextResponse.json({ error: "Primary metric required" }, { status: 400 });
    if (!experiment.decisionRuleId) return NextResponse.json({ error: "Decision rule required" }, { status: 400 });

    const updated = await prisma.experiment.update({
      where: { id: experimentId },
      data: { status: "running", startDate: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
