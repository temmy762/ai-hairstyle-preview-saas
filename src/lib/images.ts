import { prisma } from "./db";

export type Image = {
  id: string;
  salonId: string;
  filePath: string;
  createdAt: Date;
};

export async function createImage(imageData: Omit<Image, "id" | "createdAt"> & { id: string }): Promise<Image> {
  const image = await prisma.image.create({
    data: {
      id: imageData.id,
      url: imageData.filePath,
      salonId: imageData.salonId,
    },
  });

  console.log(`[Images] Created image with ID: ${image.id} for salon: ${image.salonId}`);
  
  return {
    id: image.id,
    salonId: image.salonId,
    filePath: image.url,
    createdAt: image.createdAt,
  };
}

export async function getImageById(id: string): Promise<Image | undefined> {
  const image = await prisma.image.findUnique({
    where: { id },
  });

  console.log(`[Images] Looking for image ID: ${id}`);
  console.log(`[Images] Found: ${image ? 'Yes' : 'No'}`);

  if (!image) return undefined;

  return {
    id: image.id,
    salonId: image.salonId,
    filePath: image.url,
    createdAt: image.createdAt,
  };
}

export async function getImagesBySalonId(salonId: string): Promise<Image[]> {
  const images = await prisma.image.findMany({
    where: { salonId },
  });

  return images.map(img => ({
    id: img.id,
    salonId: img.salonId,
    filePath: img.url,
    createdAt: img.createdAt,
  }));
}

export async function deleteImage(id: string): Promise<boolean> {
  try {
    await prisma.image.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
