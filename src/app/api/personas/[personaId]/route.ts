import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function PUT(req: Request, { params }: { params: Promise<{ personaId: string }> }) {
  try {
    const { personaId } = await params;
    await requireAuth();
    const body = await req.json();
    const updated = await prisma.persona.update({ where: { id: personaId }, data: body });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ personaId: string }> }) {
  try {
    const { personaId } = await params;
    await requireAuth();
    await prisma.persona.delete({ where: { id: personaId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ personaId: string }> }) {
  try {
    const { personaId } = await params;
    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(persona);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
