import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { getAIProvider, getLastAIResult } from "@/lib/ai/client";

export async function POST(req: Request, { params }: { params: Promise<{ evidenceId: string }> }) {
  try {
    const { evidenceId } = await params;
    const { userId } = await requireAuth();

    const evidence = await prisma.evidenceItem.findUnique({ where: { id: evidenceId } });
    if (!evidence) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });

    const ai = getAIProvider();
    const review = await ai.reviewEvidence(evidence.rawText || evidence.summary);

    const qualityReview = await prisma.evidenceQualityReview.create({
      data: {
        projectId: evidence.projectId,
        evidenceItemId: evidenceId,
        sourceEntityType: evidence.sourceType,
        sourceEntityId: evidence.relatedHypothesisId || evidenceId,
        originalEvidenceStrength: evidence.evidenceStrength,
        adjustedEvidenceStrength: review.adjustedEvidenceStrength,
        recommendedDisconfirmationTest: review.recommendedDisconfirmationTest,
      },
    });

    if (review.biasFlags.length > 0) {
      await prisma.biasFlag.createMany({
        data: review.biasFlags.map((f) => ({ reviewId: qualityReview.id, type: f.type, severity: f.severity, explanation: f.explanation })),
      });
    }

    await prisma.evidenceItem.update({ where: { id: evidenceId }, data: { evidenceStrength: review.adjustedEvidenceStrength } });
    // Log AI call
    const aiResult = getLastAIResult();
    await prisma.aILog.create({
      data: {
        projectId: evidence.projectId,
        userId,
        functionType: "evidence_quality_review",
        inputSummary: (evidence.rawText || evidence.summary).substring(0, 200),
        model: aiResult?.model || "mock",
        tokenUsage: aiResult?.tokenUsage ? JSON.stringify(aiResult.tokenUsage) : undefined,
        latency: aiResult?.latency,
        outputEntityType: "evidence_quality_review",
        outputEntityId: qualityReview.id,
      },
    });


    return NextResponse.json(qualityReview, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ evidenceId: string }> }) {
  try {
    const { evidenceId } = await params;
    const reviews = await prisma.evidenceQualityReview.findMany({
      where: { evidenceItemId: evidenceId },
      include: { biasFlags: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
