import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ landingPageId: string }> }) {
  try {
    const { landingPageId } = await params;
    const [views, clicks, events] = await Promise.all([
      prisma.analyticsEvent.count({ where: { landingPageId, eventType: "page_view" } }),
      prisma.analyticsEvent.count({ where: { landingPageId, eventType: "cta_click" } }),
      prisma.analyticsEvent.findMany({ where: { landingPageId }, orderBy: { occurredAt: "desc" }, take: 100 }),
    ]);
    return NextResponse.json({ views, clicks, events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
