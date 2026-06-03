import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeProject } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createOfferSchema } from "@/lib/bmi/schemas/project";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await authorizeProject(projectId);

    const offers = await prisma.offer.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(offers);
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
    const result = validateBody(createOfferSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const offer = await prisma.offer.create({
      data: {
        projectId,
        name: d.name,
        valueProposition: d.valueProposition,
        format: d.format,
        priceModel: d.priceModel,
        priceAmount: d.priceAmount,
        relatedHypothesisIds: "[]",
        createdByUserId: userId,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
