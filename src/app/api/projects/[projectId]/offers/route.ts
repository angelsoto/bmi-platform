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

    const offer = await prisma.offer.create({
      data: {
        projectId,
        name: body.name,
        valueProposition: body.valueProposition,
        format: body.format || "service",
        priceModel: body.priceModel,
        priceAmount: body.priceAmount,
        relatedHypothesisIds: JSON.stringify(body.relatedHypothesisIds || []),
        createdByUserId: userId,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
