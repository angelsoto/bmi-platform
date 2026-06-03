import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { computePmfScore, computeEvidenceDistortionCoefficient, computeValidationCoverage, resolveReadinessState } from "@/lib/bmi/formulas";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createPMFReadinessSchema } from "@/lib/bmi/schemas/more";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const assessment = await prisma.pMFReadinessAssessment.findFirst({
      where: { projectId }, orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assessment || { readinessState: "not_ready", pmfScore: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(createPMFReadinessSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    // Compute from current data
    const highRiskHyps = await prisma.hypothesis.findMany({
      where: { projectId, riskRanks: { some: { survivalCriticality: { in: ["high", "critical"] } } } },
      select: { id: true, evidenceStrength: true },
    });

    const totalHighRisk = highRiskHyps.length;
    const validated = highRiskHyps.filter((h) => h.evidenceStrength === "moderate" || h.evidenceStrength === "strong").length;
    const invalidated = highRiskHyps.filter((h) => h.evidenceStrength === "none" || h.evidenceStrength === "weak").length;

    const reviews = await prisma.evidenceQualityReview.findMany({ where: { projectId }, include: { biasFlags: true } });
    const allFlags = reviews.flatMap((r) => r.biasFlags);
    const distortion = computeEvidenceDistortionCoefficient(allFlags.map((f) => ({ severity: f.severity as "low" | "medium" | "high" })), reviews.length);

    const coverage = computeValidationCoverage(totalHighRisk, validated);
    const pmfScore = computePmfScore(coverage, d.customerDisappointmentScore ?? null, distortion);
    const readinessState = resolveReadinessState(pmfScore, coverage, invalidated > 0);

    const assessment = await prisma.pMFReadinessAssessment.create({
      data: {
        projectId,
        customerDisappointmentScore: d.customerDisappointmentScore,
        totalHighRiskHypotheses: totalHighRisk,
        unvalidatedHighRiskHypotheses: invalidated,
        evidenceDistortionCoefficient: distortion,
        pmfScore,
        readinessState,
        blockingHypothesisIds: JSON.stringify(highRiskHyps.filter((h) => h.evidenceStrength === "none" || h.evidenceStrength === "weak").map((h) => h.id)),
        explanation: `PMF score of ${(pmfScore * 100).toFixed(0)}% based on ${totalHighRisk} high-risk hypotheses.`,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
