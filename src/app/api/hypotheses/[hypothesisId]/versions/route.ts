import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ hypothesisId: string }> }) {
  try {
    const { hypothesisId } = await params;
    const versions = await prisma.hypothesisVersion.findMany({
      where: { hypothesisId },
      orderBy: { versionNumber: "desc" },
    });
    return NextResponse.json(versions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
