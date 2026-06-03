import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { closeLearningLoopSchema } from "@/lib/bmi/schemas/more";
import { getAIProvider, getLastAIResult } from "@/lib/ai/client";

export async function POST(req: Request, { params }: { params: Promise<{ loopId: string }> }) {
  try {
    const { loopId } = await params;
    const { userId } = await requireAuth();
    const body = await req.json();
    const result = validateBody(closeLearningLoopSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    // Enrich with AI synthesis (non-blocking)
    let aiSynthesis: Record<string, unknown> | null = null;
    const loop = await prisma.learningLoop.findUnique({ where: { id: loopId }, select: { outcomeSummary: true, projectId: true } });
    try {
      if (loop) {
        const ai = getAIProvider();
        const synth = await ai.synthesizeLearningLoop(loop.outcomeSummary);
        aiSynthesis = synth as unknown as Record<string, unknown>;
        const aiResult = getLastAIResult();
        if (aiResult) {
          await prisma.aILog.create({
            data: {
              projectId: loop.projectId,
              userId,
              functionType: "learning_loop_synthesis",
              inputSummary: loop.outcomeSummary.substring(0, 200),
              model: aiResult.model,
              tokenUsage: JSON.stringify(aiResult.tokenUsage),
              latency: aiResult.latency,
              outputEntityType: "learning_loop",
              outputEntityId: loopId,
            },
          });
        }
      }
    } catch {
      // AI enrichment is non-blocking
    }

    const aiInsight = aiSynthesis?.insight as string | undefined;
    const aiAction = aiSynthesis?.recommendedAction as string | undefined;
    const aiMeasurement = aiSynthesis?.recommendedMeasurement as string | undefined;

    const updated = await prisma.learningLoop.update({
      where: { id: loopId },
      data: {
        status: "closed",
        actionTaken: aiAction || d.actionTaken,
        measurementPlan: aiMeasurement || d.measurementPlan,
        closedAt: new Date(),
        ...(aiInsight ? { insight: aiInsight } : {}),
      },
    });
    return NextResponse.json({ ...updated, aiSynthesis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
