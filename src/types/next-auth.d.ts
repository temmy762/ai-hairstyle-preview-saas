import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    salonId?: string;
    salonSlug?: string;
    image?: string | null;
  }

  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      salonId?: string;
      salonSlug?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    role?: string;
    salonId?: string;
    salonSlug?: string;
  }
}
