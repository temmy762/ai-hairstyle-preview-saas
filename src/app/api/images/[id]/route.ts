import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getImageById, deleteImage } from "@/lib/images";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const image = await getImageById(id);

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.salonId !== session.user.salonId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      image: {
        id: image.id,
        salonId: image.salonId,
        filePath: image.filePath,
        createdAt: image.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const image = await getImageById(id);

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.salonId !== session.user.salonId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await deleteImage(id);

    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
