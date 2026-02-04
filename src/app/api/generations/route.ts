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

    const body = await request.json();
    const { inputImageId, prompt, hairStyleId, variations = 1 } = body;

    if (!inputImageId) {
      return NextResponse.json(
        { error: "Input image ID is required" },
        { status: 400 }
      );
    }

    if (!prompt && !hairStyleId) {
      return NextResponse.json(
        { error: "Either prompt or hairStyleId must be provided" },
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

    let styleReferencePath: string | undefined;
    const generationType = hairStyleId ? "style-reference" : "prompt";

    if (hairStyleId) {
      const hairStyle = salon.hairStyles?.find((hs: any) => hs.id === hairStyleId);
      if (!hairStyle) {
        return NextResponse.json({ error: "Hair style not found" }, { status: 404 });
      }
      styleReferencePath = hairStyle.imageUrl;
      console.log(`[Generation] Using hair style reference: ${hairStyle.name}`);
    }

    const creditCost = getCreditCost(generationType);
    
    console.log(`[Generation] Credit cost for ${generationType}: ${creditCost}`);
    console.log(`[Generation] Current salon credits: ${salon.credits}`);

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

    console.log(`[Generation] Credits deducted: ${creditCost}`);
    console.log(`[Generation] Remaining credits: ${creditResult.remainingCredits}`);
    console.log(`[Generation] Starting ${generationType} generation for salon: ${salonId}`);
    console.log(`[Generation] Input image ID: ${inputImageId}`);
    if (prompt) console.log(`[Generation] Prompt: "${prompt}"`);
    if (hairStyleId) console.log(`[Generation] Hair Style ID: ${hairStyleId}`);
    console.log(`[Generation] Variations: ${variations}`);

    const aiResponse = await aiService.generateHairstyle({
      inputImagePath: inputImage.filePath,
      prompt,
      styleReferencePath,
      variations,
      generationType,
    });

    console.log(`[Generation] AI processing completed in ${aiResponse.processingTime}ms`);

    const generation = await createGeneration({
      id: String(Date.now()),
      salonId,
      inputImageId,
      outputImagePath: aiResponse.outputImagePath,
      prompt,
      hairStyleId,
      generationType,
      variations,
      processingTime: aiResponse.processingTime,
      creditCost,
    });

    console.log(`[Generation] Generation logged with ID: ${generation.id}`);
    console.log(`[Generation] Created at: ${generation.createdAt.toISOString()}`);

    return NextResponse.json({
      message: "Generation completed successfully",
      generation: {
        id: generation.id,
        salonId: generation.salonId,
        inputImageId: generation.inputImageId,
        outputImagePath: generation.outputImagePath,
        prompt: generation.prompt,
        hairStyleId: generation.hairStyleId,
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
    console.error("[Generation] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salonId = session.user.salonId;
    if (!salonId) {
      return NextResponse.json({ error: "No salon associated with user" }, { status: 400 });
    }

    const generations = await getGenerationsBySalonId(salonId);

    console.log(`[Generation] Retrieved ${generations.length} generations for salon: ${salonId}`);

    return NextResponse.json({
      generations: generations.map((gen) => ({
        id: gen.id,
        salonId: gen.salonId,
        inputImageId: gen.inputImageId,
        outputImagePath: gen.outputImagePath,
        prompt: gen.prompt,
        hairStyleId: gen.hairStyleId,
        generationType: gen.generationType,
        createdAt: gen.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[Generation] Get generations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
