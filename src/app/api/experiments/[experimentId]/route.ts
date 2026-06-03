import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { updateExperimentSchema } from "@/lib/bmi/schemas/experiments";

export async function PATCH(req: Request, { params }: { params: Promise<{ experimentId: string }> }) {
  try {
    const { experimentId } = await params;
    await requireAuth();
    const body = await req.json();
    const result = validateBody(updateExperimentSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const updated = await prisma.experiment.update({ where: { id: experimentId }, data: result.data! });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ experimentId: string }> }) {
  try {
    const { experimentId } = await params;
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: { hypothesis: true, metrics: true, results: true, surfaces: true },
    });
    if (!experiment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(experiment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
