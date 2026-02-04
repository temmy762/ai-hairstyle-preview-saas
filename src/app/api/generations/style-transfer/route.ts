import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createGeneration, getGenerationsBySalonId } from "@/lib/generations";
import { getImageById } from "@/lib/images";
import { getSalonById, deductCredits } from "@/lib/salons";
import { aiService } from "@/lib/ai-service";
import { getCreditCost } from "@/lib/credits";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salonId = session.user.salonId;
    if (!salonId) {
      return NextResponse.json({ error: "No salon associated with user" }, { status: 400 });
    }

    const salon = await getSalonById(salonId);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    if (salon.status === "suspended") {
      return NextResponse.json({ error: "Salon is suspended" }, { status: 403 });
    }

    if (salon.type !== "hairsalon") {
      return NextResponse.json(
        { error: "Style transfer is only available for hair salons" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { inputImageId, hairStyleId, variations = 1 } = body;

    if (!inputImageId || !hairStyleId) {
      return NextResponse.json(
        { error: "Input image ID and hair style ID are required" },
        { status: 400 }
      );
    }

    const inputImage = await getImageById(inputImageId);
    if (!inputImage) {
      return NextResponse.json({ error: "Input image not found" }, { status: 404 });
    }

    if (inputImage.salonId !== salonId) {
      return NextResponse.json(
        { error: "Input image does not belong to this salon" },
        { status: 403 }
      );
    }

    const hairStyle = salon.hairStyles?.find((hs: any) => hs.id === hairStyleId);
    if (!hairStyle) {
      return NextResponse.json({ error: "Hair style not found in salon library" }, { status: 404 });
    }

    const creditCost = getCreditCost("style-reference");
    
    console.log(`[StyleTransfer] Credit cost for style transfer: ${creditCost}`);
    console.log(`[StyleTransfer] Current salon credits: ${salon.credits}`);

    if (salon.credits < creditCost) {
      return NextResponse.json(
        { 
          error: "Insufficient credits", 
          required: creditCost,
          available: salon.credits,
          message: `You need ${creditCost} credits but only have ${salon.credits}. Please purchase more credits.`
        },
        { status: 402 }
      );
    }

    const creditResult = await deductCredits(salonId, creditCost);

    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || "Failed to deduct credits" },
        { status: 400 }
      );
    }

    console.log(`[StyleTransfer] Credits deducted: ${creditCost}`);
    console.log(`[StyleTransfer] Remaining credits: ${creditResult.remainingCredits}`);
    console.log(`[StyleTransfer] Starting style transfer for salon: ${salonId}`);
    console.log(`[StyleTransfer] Input image ID: ${inputImageId}`);
    console.log(`[StyleTransfer] Hair style: ${hairStyle.name} (ID: ${hairStyleId})`);
    console.log(`[StyleTransfer] Variations: ${variations}`);

    const aiResponse = await aiService.generateFromStyleReference(
      inputImage.filePath,
      hairStyle.imageUrl,
      variations
    );

    console.log(`[StyleTransfer] Style transfer completed in ${aiResponse.processingTime}ms`);

    const generation = await createGeneration({
      id: String(Date.now()),
      salonId,
      inputImageId,
      outputImagePath: aiResponse.outputImagePath,
      hairStyleId,
      generationType: "style-reference",
      variations,
      processingTime: aiResponse.processingTime,
      creditCost: variations,
    });

    console.log(`[StyleTransfer] Generation logged with ID: ${generation.id}`);
    console.log(`[StyleTransfer] Created at: ${generation.createdAt.toISOString()}`);

    return NextResponse.json({
      message: "Style transfer completed successfully",
      generation: {
        id: generation.id,
        salonId: generation.salonId,
        inputImageId: generation.inputImageId,
        outputImagePath: generation.outputImagePath,
        hairStyleId: generation.hairStyleId,
        hairStyleName: hairStyle.name,
        generationType: generation.generationType,
        createdAt: generation.createdAt.toISOString(),
        processingTime: aiResponse.processingTime,
      },
      credits: {
        used: creditCost,
        remaining: creditResult.remainingCredits,
      },
    });
  } catch (error) {
    console.error("[StyleTransfer] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
