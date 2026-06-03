import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createAnalyticsEventSchema } from "@/lib/bmi/schemas/more";

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const result = validateBody(createAnalyticsEventSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const event = await prisma.analyticsEvent.create({
      data: {
        projectId: d.projectId,
        eventName: d.eventName,
        eventType: d.eventType,
        anonymousId: d.anonymousId,
        userId,
        sessionId: d.sessionId,
        landingPageId: d.landingPageId,
        ctaId: d.ctaId,
        experimentId: d.experimentId,
        variantId: d.variantId,
        source: d.source,
        medium: d.medium,
        campaign: d.campaign,
        metadata: d.metadata ? JSON.stringify(d.metadata) : undefined,
        occurredAt: new Date(d.occurredAt || Date.now()),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
