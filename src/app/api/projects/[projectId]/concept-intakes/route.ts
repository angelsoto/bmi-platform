import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);

    const intakes = await prisma.conceptIntake.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { assumptions: true } } },
    });

    return NextResponse.json(intakes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { userId } = await authorizeProject(projectId);
    const body = await req.json();
    const { rawInput, inputType } = body;

    if (!rawInput) {
      return NextResponse.json({ error: "rawInput is required" }, { status: 400 });
    }

    const intake = await prisma.conceptIntake.create({
      data: {
        projectId,
        userId,
        rawInput,
        inputType: inputType || "typed_text",
      },
    });

    return NextResponse.json(intake, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
