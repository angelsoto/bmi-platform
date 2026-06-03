import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createIntakeSchema } from "@/lib/bmi/schemas/project";

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
    const result = validateBody(createIntakeSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const intake = await prisma.conceptIntake.create({
      data: {
        projectId,
        userId,
        rawInput: d.rawInput,
        inputType: d.inputType,
      },
    });

    return NextResponse.json(intake, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
