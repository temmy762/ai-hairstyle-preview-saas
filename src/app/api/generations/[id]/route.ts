import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGenerationById } from "@/lib/generations";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const generation = await getGenerationById(id);

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    if (generation.salonId !== session.user.salonId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[Generation] Retrieved generation ID: ${id} for salon: ${generation.salonId}`);

    return NextResponse.json({
      generation: {
        id: generation.id,
        salonId: generation.salonId,
        inputImageId: generation.inputImageId,
        outputImagePath: generation.outputImagePath,
        prompt: generation.prompt,
        createdAt: generation.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[Generation] Get generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
