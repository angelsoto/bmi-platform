import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();

    const event = await prisma.analyticsEvent.create({
      data: {
        projectId: body.projectId,
        eventName: body.eventName,
        eventType: body.eventType || "custom",
        anonymousId: body.anonymousId,
        userId,
        sessionId: body.sessionId,
        landingPageId: body.landingPageId,
        ctaId: body.ctaId,
        experimentId: body.experimentId,
        variantId: body.variantId,
        source: body.source,
        medium: body.medium,
        campaign: body.campaign,
        metadata: body.metadata ? JSON.stringify(body.metadata) : undefined,
        occurredAt: new Date(body.occurredAt || Date.now()),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
