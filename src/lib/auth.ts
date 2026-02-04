import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword } from "./users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email);
        if (!user) {
          return null;
        }

        const isValidPassword = await verifyPassword(credentials.password, user.password);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          salonId: user.role === "salon" ? user.salonId : undefined,
          salonSlug: user.role === "salon" ? user.salonSlug : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = (user as { image?: string | null }).image ?? undefined;
        token.role = user.role;
        token.salonId = (user as { salonId?: string }).salonId;
        token.salonSlug = user.salonSlug;
      }

      if (trigger === "update" && session?.user) {
        if (session.user.email !== undefined) {
          token.email = session.user.email;
        }
        if (session.user.name !== undefined) {
          token.name = session.user.name;
        }
        if (session.user.image !== undefined) {
          token.image = session.user.image as string | null | undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? token.sub;
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.image = (token.image as string | undefined) ?? session.user.image;
        session.user.role = token.role as string;
        session.user.salonId = token.salonId as string | undefined;
        session.user.salonSlug = token.salonSlug as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
  debug: process.env.NODE_ENV === "development",
};
