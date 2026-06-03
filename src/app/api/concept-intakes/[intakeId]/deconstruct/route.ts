import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { getAIProvider, getLastAIResult } from "@/lib/ai/client";

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

    if (!intake) {
      return NextResponse.json({ error: "Concept intake not found" }, { status: 404 });
    }

    if (intake.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Call AI deconstruction
    const ai = getAIProvider();
    const output = await ai.deconstruct(intake.rawInput);

    // Store the output as parsedSummary, but DON'T create records yet
    // The user will select which items to accept via the accept endpoint
    await prisma.conceptIntake.update({
      where: { id: intakeId },
      data: {
        status: "processed",
        parsedSummary: output.summary,
        processedAt: new Date(),
      },
    });
    // Log AI call
    const aiResult = getLastAIResult();
    await prisma.aILog.create({
      data: {
        projectId: intake.projectId,
        userId,
        functionType: "concept_deconstruction",
        inputSummary: intake.rawInput.substring(0, 200),
        model: aiResult?.model || "mock",
        tokenUsage: aiResult?.tokenUsage ? JSON.stringify(aiResult.tokenUsage) : undefined,
        latency: aiResult?.latency,
        outputEntityType: "concept_intake",
        outputEntityId: intakeId,
      },
    });


    return NextResponse.json({
      intakeId,
      summary: output.summary,
      assumptions: output.assumptions,
      hypotheses: output.hypotheses,
      suggestedPersona: output.suggestedPersona,
      suggestedOffer: output.suggestedOffer,
      suggestedNextActions: output.suggestedNextActions,
    });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
