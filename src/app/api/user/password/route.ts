import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUserPassword } from "@/lib/users";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await updateUserPassword(session.user.id, { currentPassword, newPassword });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Invalid current password")) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
