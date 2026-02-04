import bcrypt from "bcryptjs";
import { prisma } from "./db";

export type UserRole = "admin" | "salon";

export type AdminUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  image?: string;
  role: "admin";
};

export type SalonUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  image?: string;
  role: "salon";
  salonId: string;
  salonSlug: string;
};

export type User = AdminUser | SalonUser;

export type NewUser = Omit<AdminUser, "id"> | Omit<SalonUser, "id">;

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { salons: true },
  });

  if (!user) return undefined;

  if (user.role === "salon" && user.salons.length > 0) {
    const salon = user.salons[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name || "",
      role: "salon",
      salonId: salon.id,
      salonSlug: salon.slug,
    } as SalonUser;
  }

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name || "",
    role: user.role as UserRole,
  } as AdminUser;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { salons: true },
  });

  if (!user) return undefined;

  if (user.role === "salon" && user.salons.length > 0) {
    const salon = user.salons[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name || "",
      role: "salon",
      salonId: salon.id,
      salonSlug: salon.slug,
    } as SalonUser;
  }

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name || "",
    role: user.role as UserRole,
  } as AdminUser;
}

export async function createUser(userData: NewUser): Promise<User> {
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
    },
    include: { salons: true },
  });

  // For salon users, salons will be created separately after user creation
  // Then linked via the salon's userId field
  if (userData.role === "salon" && user.salons.length > 0) {
    const salon = user.salons[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name || "",
      role: "salon",
      salonId: salon.id,
      salonSlug: salon.slug,
    } as SalonUser;
  }

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name || "",
    role: user.role as UserRole,
  } as AdminUser;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function updateUserProfile(
  id: string,
  updates: { name: string; email: string; image?: string }
): Promise<User> {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: updates.email.toLowerCase(),
      NOT: { id },
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: updates.name,
      email: updates.email,
    },
    include: { salons: true },
  });

  if (user.role === "salon" && user.salons.length > 0) {
    const salon = user.salons[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name || "",
      role: "salon",
      salonId: salon.id,
      salonSlug: salon.slug,
    } as SalonUser;
  }

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name || "",
    role: user.role as UserRole,
  } as AdminUser;
}

export async function updateUserPassword(
  id: string,
  input: { currentPassword: string; newPassword: string }
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  
  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await verifyPassword(input.currentPassword, user.password);
  if (!isValid) {
    throw new Error("Invalid current password");
  }

  await prisma.user.update({
    where: { id },
    data: { password: hashPassword(input.newPassword) },
  });
}
