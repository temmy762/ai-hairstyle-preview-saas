import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createImage, getImagesBySalonId } from "@/lib/images";
import { getSalonById } from "@/lib/salons";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

async function uploadToImgBB(imageFile: File): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error("ImgBB API key not configured");
  }

  const formData = new FormData();
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  
  formData.append("image", base64);
  formData.append("key", apiKey);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ImgBB upload failed: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.data.url;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salonId = session.user.salonId;
    if (!salonId) {
      return NextResponse.json({ error: "No salon associated with user" }, { status: 400 });
    }

    const salon = await getSalonById(salonId);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    if (salon.status === "suspended") {
      return NextResponse.json({ error: "Salon is suspended" }, { status: 403 });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid image type. Allowed types: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    console.log("[Images API] Uploading to ImgBB...");
    let imageUrl: string;
    try {
      imageUrl = await uploadToImgBB(imageFile);
      console.log("[Images API] ImgBB upload successful:", imageUrl);
    } catch (uploadError) {
      console.error("[Images API] ImgBB upload failed:", uploadError);
      return NextResponse.json({ 
        error: `Image upload to ImgBB failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}` 
      }, { status: 500 });
    }

    const newImage = await createImage({
      id: String(Date.now()),
      salonId,
      filePath: imageUrl,
    });

    return NextResponse.json({
      message: "Image uploaded successfully",
      image: {
        id: newImage.id,
        salonId: newImage.salonId,
        filePath: newImage.filePath,
        createdAt: newImage.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload image error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "salon") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salonId = session.user.salonId;
    if (!salonId) {
      return NextResponse.json({ error: "No salon associated with user" }, { status: 400 });
    }

    const images = await getImagesBySalonId(salonId);

    return NextResponse.json({
      images: images.map((img) => ({
        id: img.id,
        salonId: img.salonId,
        filePath: img.filePath,
        createdAt: img.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get images error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
