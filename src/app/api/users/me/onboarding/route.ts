import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorize";
import { validateBody } from "@/lib/bmi/schemas/validate";
import { updateOnboardingSchema } from "@/lib/bmi/schemas/more";

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
    const result = validateBody(updateOnboardingSchema, body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const d = result.data!;

    const state = await prisma.userOnboardingState.upsert({
      where: { userId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: d as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { userId, ...(d as any) },
    });

    return NextResponse.json(state);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
