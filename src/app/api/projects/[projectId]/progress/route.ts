import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject, requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createProgressTrackSchema } from "@/lib/bmi/schemas/more";
import { getAIProvider, getLastAIResult } from "@/lib/ai/client";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const items = await prisma.progressTrack.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const body = await req.json();
    const result = validateBody(createProgressTrackSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const item = await prisma.progressTrack.create({
      data: {
        projectId,
        name: d.name,
        type: d.type,
        description: d.description,
        health: d.health,
        completionScore: d.completionScore,
        currentFocus: d.currentFocus,
      },
    });

    // Enrich with AI operating brief (non-blocking)
    let aiBrief: Record<string, unknown> | null = null;
    try {
      const projectContext = `Project progress track: ${d.name} (${d.type}), health: ${d.health}, focus: ${d.currentFocus || "N/A"}, score: ${d.completionScore ?? 0}`;
      const ai = getAIProvider();
      const brief = await ai.generateOperatingBrief(projectContext);
      aiBrief = brief as unknown as Record<string, unknown>;
      const aiResult = getLastAIResult();
      if (aiResult) {
        const { userId } = await requireAuth();
        await prisma.aILog.create({
          data: {
            projectId,
            userId,
            functionType: "operating_brief",
            inputSummary: projectContext.substring(0, 200),
            model: aiResult.model,
            tokenUsage: JSON.stringify(aiResult.tokenUsage),
            latency: aiResult.latency,
            outputEntityType: "progress_track",
            outputEntityId: item.id,
          },
        });
      }
    } catch {
      // AI enrichment is non-blocking
    }

    return NextResponse.json({ ...item, aiBrief }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
