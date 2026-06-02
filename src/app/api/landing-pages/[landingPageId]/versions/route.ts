import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ landingPageId: string }> }) {
  try {
    const { landingPageId } = await params;
    const versions = await prisma.landingPageVersion.findMany({
      where: { landingPageId },
      orderBy: { versionNumber: "desc" },
    });
    return NextResponse.json(versions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
