import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createLandingPageSchema } from "@/lib/bmi/schemas/more";
import { getAIProvider, getLastAIResult } from "@/lib/ai/client";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);
    const pages = await prisma.landingPage.findMany({
      where: { projectId },
      include: { ctas: true, contentBlocks: { orderBy: { orderIndex: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId, "owner");
    const body = await req.json();
    const result = validateBody(createLandingPageSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const page = await prisma.landingPage.create({
      data: {
        projectId,
        name: d.name,
        slug: d.slug,
        personaId: d.personaId || "",
        offerId: d.offerId || "",
        hypothesisId: d.hypothesisId || "",
        journeyStage: d.journeyStage,
      },
    });

    // Enrich with AI-generated copy (non-blocking)
    let aiCopy: Record<string, unknown> | null = null;
    try {
      let personaName = "your target customer";
      let primaryPain = "their core challenge";
      let offerName = d.name;
      let valueProposition = "evidence-based validation";

      if (d.personaId) {
        const persona = await prisma.persona.findUnique({ where: { id: d.personaId }, select: { name: true, primaryPain: true } });
        if (persona) { personaName = persona.name; primaryPain = persona.primaryPain; }
      }
      if (d.offerId) {
        const offer = await prisma.offer.findUnique({ where: { id: d.offerId }, select: { name: true, valueProposition: true } });
        if (offer) { offerName = offer.name; valueProposition = offer.valueProposition; }
      }

      const ai = getAIProvider();
      const copy = await ai.generateLandingPageCopy({ personaName, primaryPain, offerName, valueProposition });
      aiCopy = copy as unknown as Record<string, unknown>;
      const aiResult = getLastAIResult();
      if (aiResult) {
        await prisma.aILog.create({
          data: {
            projectId,
            userId,
            functionType: "landing_page_copy",
            inputSummary: `${offerName}: ${valueProposition}`.substring(0, 200),
            model: aiResult.model,
            tokenUsage: JSON.stringify(aiResult.tokenUsage),
            latency: aiResult.latency,
            outputEntityType: "landing_page",
            outputEntityId: page.id,
          },
        });
      }
    } catch {
      // AI enrichment is non-blocking
    }

    return NextResponse.json({ ...page, aiCopy }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
