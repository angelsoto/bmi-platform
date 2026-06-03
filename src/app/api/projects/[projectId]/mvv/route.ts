import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { upsertMVVSchema } from "@/lib/bmi/schemas/more";
import { getAIProvider, getLastAIResult } from "@/lib/ai/client";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const mvv = await prisma.mVVStatement.findFirst({ where: { projectId } });
    return NextResponse.json(mvv || { mission: null, vision: null, values: "[]", founderAssumptions: "[]", unresolvedTensions: "[]" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(upsertMVVSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const mvv = await prisma.mVVStatement.upsert({
      where: { projectId },
      update: {
        mission: d.mission,
        vision: d.vision,
        values: JSON.stringify(d.values || []),
        founderAssumptions: JSON.stringify(d.founderAssumptions || []),
        unresolvedTensions: JSON.stringify(d.unresolvedTensions || []),
        versionNumber: { increment: 1 },
      },
      create: {
        projectId,
        mission: d.mission,
        vision: d.vision,
        values: JSON.stringify(d.values || []),
        founderAssumptions: JSON.stringify(d.founderAssumptions || []),
        unresolvedTensions: JSON.stringify(d.unresolvedTensions || []),
        createdByUserId: userId,
      },
    });

    // Enrich with AI MVV clarification (non-blocking)
    let aiClarification: Record<string, unknown> | null = null;
    try {
      const ai = getAIProvider();
      const clarification = await ai.clarifyMVV(`${d.mission}\n${d.vision}\n${(d.values || []).join(", ")}`);
      aiClarification = clarification as unknown as Record<string, unknown>;
      const aiResult = getLastAIResult();
      if (aiResult) {
        await prisma.aILog.create({
          data: {
            projectId,
            userId,
            functionType: "mvv_clarification",
            inputSummary: d.mission.substring(0, 200),
            model: aiResult.model,
            tokenUsage: JSON.stringify(aiResult.tokenUsage),
            latency: aiResult.latency,
            outputEntityType: "mvv_statement",
            outputEntityId: mvv.id,
          },
        });
      }
    } catch {
      // AI enrichment is non-blocking
    }

    return NextResponse.json({ ...mvv, aiClarification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
