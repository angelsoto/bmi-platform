import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { closeLearningLoopSchema } from "@/lib/bmi/schemas/more";

export async function POST(req: Request, { params }: { params: Promise<{ loopId: string }> }) {
  try {
    const { loopId } = await params;
    await requireAuth();
    const body = await req.json();
    const result = validateBody(closeLearningLoopSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const updated = await prisma.learningLoop.update({
      where: { id: loopId },
      data: { status: "closed", actionTaken: d.actionTaken, measurementPlan: d.measurementPlan, closedAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
