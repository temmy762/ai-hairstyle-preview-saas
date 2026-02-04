import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSalonBySlug, updateSalon } from "@/lib/salons";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { services } = body;

    if (!services || (services !== "male" && services !== "female" && services !== "both")) {
      return NextResponse.json({ error: "Invalid services value" }, { status: 400 });
    }

    const salonSlug = session.user.salonSlug;
    if (!salonSlug) {
      return NextResponse.json({ error: "No salon associated with user" }, { status: 400 });
    }

    const salon = await getSalonBySlug(salonSlug);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const updatedSalon = await updateSalon(salon.id, { services });

    return NextResponse.json({
      message: "Salon settings updated successfully",
      salon: updatedSalon,
    });
  } catch (error) {
    console.error("Update salon settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
