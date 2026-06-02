import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function POST(req: Request, { params }: { params: Promise<{ landingPageId: string }> }) {
  try {
    const { landingPageId } = await params;
    const { userId } = await requireAuth();

    const page = await prisma.landingPage.findUnique({ where: { id: landingPageId } });
    if (!page) return NextResponse.json({ error: "Landing page not found" }, { status: 404 });

    // Check membership + owner override for governance
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: page.projectId } },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    // Guardrails
    const blocks: string[] = [];
    if (!page.personaId) blocks.push("Persona required");
    if (!page.offerId) blocks.push("Offer required");
    if (!page.primaryCTAId) blocks.push("Primary CTA required");

    if (page.governanceStatus === "pending") {
      if (membership.role !== "owner") blocks.push("Governance approval: owner override required");
    }

    if (blocks.length > 0) {
      return NextResponse.json({ blocked: true, blocks, allowed: false }, { status: 400 });
    }

    // Create version snapshot
    await prisma.landingPageVersion.create({
      data: { landingPageId, versionNumber: 1, content: JSON.stringify({ status: "deployed" }), createdByUserId: userId },
    });

    const updated = await prisma.landingPage.update({
      where: { id: landingPageId },
      data: { status: "deployed" },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
