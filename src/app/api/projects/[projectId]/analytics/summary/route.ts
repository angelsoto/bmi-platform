import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalEvents, pageViews, ctaClicks, recentEvents] = await Promise.all([
      prisma.analyticsEvent.count({ where: { projectId } }),
      prisma.analyticsEvent.count({ where: { projectId, eventType: "page_view" } }),
      prisma.analyticsEvent.count({ where: { projectId, eventType: "cta_click" } }),
      prisma.analyticsEvent.findMany({
        where: { projectId, occurredAt: { gte: thirtyDaysAgo } },
        orderBy: { occurredAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({ totalEvents, pageViews, ctaClicks, recentEvents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
