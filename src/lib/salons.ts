import { prisma } from "./db";

export type SalonStatus = "active" | "suspended";
export type SalonType = "barbershop" | "hairsalon";
export type SalonServices = "male" | "female" | "both";

export type HairStyle = {
  id: string;
  name: string;
  imageUrl: string;
  uploadedAt: Date;
};

export type Salon = {
  id: string;
  name: string;
  slug: string;
  status: SalonStatus;
  type: SalonType;
  services: SalonServices;
  credits: number;
  hairStyles: HairStyle[];
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllSalons(): Promise<Salon[]> {
  const salons = await prisma.salon.findMany({
    include: { hairStyles: true },
  });

  return salons.map(salon => ({
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    status: salon.status as SalonStatus,
    type: salon.type as SalonType,
    services: salon.services as SalonServices,
    credits: salon.credits,
    hairStyles: salon.hairStyles.map(hs => ({
      id: hs.id,
      name: hs.name,
      imageUrl: hs.imageUrl,
      uploadedAt: hs.uploadedAt,
    })),
    createdAt: salon.createdAt,
    updatedAt: salon.updatedAt,
  }));
}

export async function getSalonById(id: string): Promise<Salon | undefined> {
  const salon = await prisma.salon.findUnique({
    where: { id },
    include: { hairStyles: true },
  });

  if (!salon) return undefined;

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    status: salon.status as SalonStatus,
    type: salon.type as SalonType,
    services: salon.services as SalonServices,
    credits: salon.credits,
    hairStyles: salon.hairStyles.map(hs => ({
      id: hs.id,
      name: hs.name,
      imageUrl: hs.imageUrl,
      uploadedAt: hs.uploadedAt,
    })),
    createdAt: salon.createdAt,
    updatedAt: salon.updatedAt,
  };
}

export async function getSalonBySlug(slug: string): Promise<Salon | undefined> {
  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: { hairStyles: true },
  });

  if (!salon) return undefined;

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    status: salon.status as SalonStatus,
    type: salon.type as SalonType,
    services: salon.services as SalonServices,
    credits: salon.credits,
    hairStyles: salon.hairStyles.map(hs => ({
      id: hs.id,
      name: hs.name,
      imageUrl: hs.imageUrl,
      uploadedAt: hs.uploadedAt,
    })),
    createdAt: salon.createdAt,
    updatedAt: salon.updatedAt,
  };
}

export async function createSalon(
  salonData: Omit<Salon, "id" | "createdAt" | "updatedAt" | "credits"> & { credits?: number; userId: string }
): Promise<Salon> {
  const existingSalon = await getSalonBySlug(salonData.slug);
  if (existingSalon) {
    throw new Error("Salon with this slug already exists");
  }

  const salon = await prisma.salon.create({
    data: {
      name: salonData.name,
      slug: salonData.slug,
      status: salonData.status,
      type: salonData.type || "hairsalon",
      services: salonData.services || "both",
      credits: typeof salonData.credits === "number" ? salonData.credits : 0,
      userId: salonData.userId,
    },
    include: { hairStyles: true },
  });

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    status: salon.status as SalonStatus,
    type: salon.type as SalonType,
    services: salon.services as SalonServices,
    credits: salon.credits,
    hairStyles: [],
    createdAt: salon.createdAt,
    updatedAt: salon.updatedAt,
  };
}

export async function updateSalon(id: string, updates: Partial<Omit<Salon, "id" | "createdAt">>): Promise<Salon | undefined> {
  const existing = await prisma.salon.findUnique({ where: { id } });
  if (!existing) return undefined;

  if (updates.slug && updates.slug !== existing.slug) {
    const existingSalon = await getSalonBySlug(updates.slug);
    if (existingSalon) {
      throw new Error("Salon with this slug already exists");
    }
  }

  const salon = await prisma.salon.update({
    where: { id },
    data: {
      name: updates.name,
      slug: updates.slug,
      status: updates.status,
      type: updates.type,
      services: updates.services,
      credits: updates.credits,
    },
    include: { hairStyles: true },
  });

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    status: salon.status as SalonStatus,
    type: salon.type as SalonType,
    services: salon.services as SalonServices,
    credits: salon.credits,
    hairStyles: salon.hairStyles.map(hs => ({
      id: hs.id,
      name: hs.name,
      imageUrl: hs.imageUrl,
      uploadedAt: hs.uploadedAt,
    })),
    createdAt: salon.createdAt,
    updatedAt: salon.updatedAt,
  };
}

export async function deleteSalon(id: string): Promise<boolean> {
  try {
    await prisma.salon.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function deductCredits(salonId: string, amount: number): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
  const salon = await getSalonById(salonId);
  
  if (!salon) {
    return { success: false, error: "Salon not found" };
  }

  if (salon.credits < amount) {
    return { success: false, error: "Insufficient credits", remainingCredits: salon.credits };
  }

  const updatedSalon = await updateSalon(salonId, {
    credits: salon.credits - amount,
  });

  if (!updatedSalon) {
    return { success: false, error: "Failed to update credits" };
  }

  return { success: true, remainingCredits: updatedSalon.credits };
}
