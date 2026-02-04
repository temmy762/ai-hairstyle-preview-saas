import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSalonBySlug, updateSalon } from "@/lib/salons";
import type { HairStyle } from "@/lib/salons";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salonSlug = session.user.salonSlug;
    if (!salonSlug) {
      return NextResponse.json({ error: "No salon associated with user" }, { status: 400 });
    }

    const salon = await getSalonBySlug(salonSlug);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !imageFile) {
      return NextResponse.json({ error: "Name and image are required" }, { status: 400 });
    }

    // In a real app, you'd upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll simulate with a data URL
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const imageUrl = `data:${imageFile.type};base64,${base64}`;

    const newHairStyle: HairStyle = {
      id: String(Date.now()),
      name,
      imageUrl,
      uploadedAt: new Date(),
    };

    const updatedHairStyles = [...(salon.hairStyles || []), newHairStyle];
    await updateSalon(salon.id, { hairStyles: updatedHairStyles });

    return NextResponse.json({
      message: "Hair style uploaded successfully",
      hairStyle: {
        ...newHairStyle,
        uploadedAt: newHairStyle.uploadedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload hair style error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salonSlug = session.user.salonSlug;
    if (!salonSlug) {
      return NextResponse.json({ error: "No salon associated with user" }, { status: 400 });
    }

    const salon = await getSalonBySlug(salonSlug);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const hairStyleId = searchParams.get("id");

    if (!hairStyleId) {
      return NextResponse.json({ error: "Hair style ID is required" }, { status: 400 });
    }

    const updatedHairStyles = salon.hairStyles.filter((hs) => hs.id !== hairStyleId);
    await updateSalon(salon.id, { hairStyles: updatedHairStyles });

    return NextResponse.json({
      message: "Hair style deleted successfully",
    });
  } catch (error) {
    console.error("Delete hair style error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
