import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { makeExperimentDecisionSchema } from "@/lib/bmi/schemas/more";

export async function POST(req: Request, { params }: { params: Promise<{ experimentId: string }> }) {
  try {
    const { experimentId } = await params;
    await requireAuth();
    const body = await req.json();
    const result = validateBody(makeExperimentDecisionSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const updated = await prisma.experiment.update({
      where: { id: experimentId },
      data: { status: "decision_made", endDate: d.endDate || new Date() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
