import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { getAIProvider } from "@/lib/ai/client";

export async function POST(req: Request, { params }: { params: Promise<{ evidenceId: string }> }) {
  try {
    const { evidenceId } = await params;
    await requireAuth();

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
