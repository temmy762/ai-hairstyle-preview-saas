import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin route protection
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Salon route protection
    if (path.startsWith("/salon/")) {
      if (token?.role !== "salon") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Extract slug from path
      const pathParts = path.split("/");
      const slugFromPath = pathParts[2];

      // Ensure salon users can only access their own dashboard
      if (token?.salonSlug && token.salonSlug !== slugFromPath) {
        return NextResponse.redirect(new URL(`/salon/${token.salonSlug}/dashboard`, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/salon/:path*"],
};
