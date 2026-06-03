import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function PUT(req: Request, { params }: { params: Promise<{ offerId: string }> }) {
  try {
    const { offerId } = await params;
    await requireAuth();
    const body = await req.json();
    const updated = await prisma.offer.update({ where: { id: offerId }, data: body });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ offerId: string }> }) {
  try {
    const { offerId } = await params;
    await requireAuth();
    await prisma.offer.delete({ where: { id: offerId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ offerId: string }> }) {
  try {
    const { offerId } = await params;
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(offer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
