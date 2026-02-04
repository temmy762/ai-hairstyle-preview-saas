import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllSalons, createSalon } from "@/lib/salons";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const salons = await getAllSalons();
    return NextResponse.json({
      salons: salons.map((salon) => ({
        ...salon,
        createdAt: salon.createdAt.toISOString(),
        updatedAt: salon.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get salons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, slug, status, type, services, credits } = body;

    if (!name || !slug || !status || !type || !services) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (status !== "active" && status !== "suspended") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    if (type !== "barbershop" && type !== "hairsalon") {
      return NextResponse.json(
        { error: "Invalid salon type" },
        { status: 400 }
      );
    }

    if (services !== "male" && services !== "female" && services !== "both") {
      return NextResponse.json(
        { error: "Invalid services" },
        { status: 400 }
      );
    }

    if (credits !== undefined && (typeof credits !== "number" || Number.isNaN(credits) || credits < 0)) {
      return NextResponse.json(
        { error: "Invalid credits" },
        { status: 400 }
      );
    }

    const newSalon = await createSalon({ name, slug, status, type, services, credits });

    return NextResponse.json(
      { message: "Salon created successfully", salon: newSalon },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create salon error:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
