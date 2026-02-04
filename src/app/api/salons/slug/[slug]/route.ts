import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSalonBySlug } from "@/lib/salons";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;

    if (session.user?.role !== "admin" && session.user?.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role === "salon" && session.user?.salonSlug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salon = await getSalonBySlug(slug);

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({
      salon: {
        ...salon,
        createdAt: salon.createdAt.toISOString(),
        updatedAt: salon.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get salon by slug error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
