import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    let state = await prisma.userOnboardingState.findUnique({
      where: { userId },
    });

    if (!state) {
      state = await prisma.userOnboardingState.create({
        data: { userId },
      });
    }

    const tourSteps = await prisma.tourStep.findMany({
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({ state, tourSteps });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();

    const state = await prisma.userOnboardingState.upsert({
      where: { userId },
      update: body,
      create: { userId, ...body },
    });

    return NextResponse.json(state);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
