import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function POST(req: Request, { params }: { params: Promise<{ loopId: string }> }) {
  try {
    const { loopId } = await params;
    await requireAuth();
    const body = await req.json();

    if (!body.actionTaken || !body.measurementPlan) {
      return NextResponse.json({ error: "Cannot close: actionTaken and measurementPlan required" }, { status: 400 });
    }

    const updated = await prisma.learningLoop.update({
      where: { id: loopId },
      data: { status: "closed", actionTaken: body.actionTaken, measurementPlan: body.measurementPlan, closedAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
