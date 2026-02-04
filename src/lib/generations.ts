import { prisma } from "./db";

export type Generation = {
  id: string;
  salonId: string;
  inputImageId: string;
  outputImagePath: string;
  prompt?: string;
  hairStyleId?: string;
  generationType: "prompt" | "style-reference";
  variations?: number;
  processingTime?: number;
  creditCost?: number;
  createdAt: Date;
};

export async function createGeneration(
  generationData: Omit<Generation, "id" | "createdAt"> & { id: string; variations: number; processingTime: number; creditCost: number }
): Promise<Generation> {
  const generation = await prisma.generation.create({
    data: {
      id: generationData.id,
      salonId: generationData.salonId,
      inputImageId: generationData.inputImageId,
      outputImagePath: generationData.outputImagePath,
      prompt: generationData.prompt,
      generationType: generationData.generationType,
      variations: generationData.variations,
      processingTime: generationData.processingTime,
      creditCost: generationData.creditCost,
    },
  });

  return {
    id: generation.id,
    salonId: generation.salonId,
    inputImageId: generation.inputImageId,
    outputImagePath: generation.outputImagePath,
    prompt: generation.prompt || undefined,
    generationType: generation.generationType as "prompt" | "style-reference",
    variations: generation.variations,
    processingTime: generation.processingTime,
    creditCost: generation.creditCost,
    createdAt: generation.createdAt,
  };
}

export async function getGenerationById(id: string): Promise<Generation | undefined> {
  const generation = await prisma.generation.findUnique({
    where: { id },
  });

  if (!generation) return undefined;

  return {
    id: generation.id,
    salonId: generation.salonId,
    inputImageId: generation.inputImageId,
    outputImagePath: generation.outputImagePath,
    prompt: generation.prompt || undefined,
    generationType: generation.generationType as "prompt" | "style-reference",
    variations: generation.variations,
    processingTime: generation.processingTime,
    creditCost: generation.creditCost,
    createdAt: generation.createdAt,
  };
}

export async function getGenerationsBySalonId(salonId: string): Promise<Generation[]> {
  const generations = await prisma.generation.findMany({
    where: { salonId },
    orderBy: { createdAt: 'desc' },
  });

  return generations.map(gen => ({
    id: gen.id,
    salonId: gen.salonId,
    inputImageId: gen.inputImageId,
    outputImagePath: gen.outputImagePath,
    prompt: gen.prompt || undefined,
    generationType: gen.generationType as "prompt" | "style-reference",
    variations: gen.variations,
    processingTime: gen.processingTime,
    creditCost: gen.creditCost,
    createdAt: gen.createdAt,
  }));
}

export async function getAllGenerations(): Promise<Generation[]> {
  const generations = await prisma.generation.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return generations.map(gen => ({
    id: gen.id,
    salonId: gen.salonId,
    inputImageId: gen.inputImageId,
    outputImagePath: gen.outputImagePath,
    prompt: gen.prompt || undefined,
    generationType: gen.generationType as "prompt" | "style-reference",
    variations: gen.variations,
    processingTime: gen.processingTime,
    creditCost: gen.creditCost,
    createdAt: gen.createdAt,
  }));
}
