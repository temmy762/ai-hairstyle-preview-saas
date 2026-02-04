import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSalonById, updateSalon, deleteSalon } from "@/lib/salons";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const salon = await getSalonById(id);

    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      salon: {
        ...salon,
        createdAt: salon.createdAt.toISOString(),
        updatedAt: salon.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get salon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    if (body.type !== undefined && body.type !== "barbershop" && body.type !== "hairsalon") {
      return NextResponse.json(
        { error: "Invalid salon type" },
        { status: 400 }
      );
    }

    if (body.services !== undefined && body.services !== "male" && body.services !== "female" && body.services !== "both") {
      return NextResponse.json(
        { error: "Invalid services" },
        { status: 400 }
      );
    }

    if (body.credits !== undefined && (typeof body.credits !== "number" || Number.isNaN(body.credits) || body.credits < 0)) {
      return NextResponse.json(
        { error: "Invalid credits" },
        { status: 400 }
      );
    }

    const updatedSalon = await updateSalon(id, body);

    if (!updatedSalon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Salon updated successfully",
      salon: {
        ...updatedSalon,
        createdAt: updatedSalon.createdAt.toISOString(),
        updatedAt: updatedSalon.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update salon error:", error);
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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const deleted = await deleteSalon(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Salon deleted successfully",
    });
  } catch (error) {
    console.error("Delete salon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
