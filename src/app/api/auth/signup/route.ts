import { NextResponse } from "next/server";
import { createUser, findUserByEmail, hashPassword } from "@/lib/users";
import { getSalonBySlug, createSalon } from "@/lib/salons";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, salonSlug, salonType, salonServices } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "salon") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    if (role === "salon" && !salonSlug) {
      return NextResponse.json(
        { error: "Salon slug is required for salon users" },
        { status: 400 }
      );
    }

    if (role === "salon" && !salonType) {
      return NextResponse.json(
        { error: "Salon type is required for salon users" },
        { status: 400 }
      );
    }

    if (role === "salon" && !salonServices) {
      return NextResponse.json(
        { error: "Salon services is required for salon users" },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    // Create user first
    const newUser = await createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    // Then create salon if role is salon
    let salonId: string | undefined;
    if (role === "salon") {
      let salon = await getSalonBySlug(salonSlug);
      
      if (salon) {
        // Salon already exists - user should login instead
        return NextResponse.json(
          { error: "A salon with this slug already exists. If this is your salon, please login instead of signing up." },
          { status: 400 }
        );
      }
      
      try {
        salon = await createSalon({
          name,
          slug: salonSlug,
          status: "active",
          type: salonType,
          services: salonServices,
          credits: 50,
          hairStyles: [],
          userId: newUser.id,
        });
      } catch (err) {
        console.error("Salon creation error:", err);
        return NextResponse.json(
          { error: "Failed to create salon. Please try a different salon name or slug." },
          { status: 400 }
        );
      }
      
      if (salon.status === "suspended") {
        return NextResponse.json(
          { error: "This salon is currently suspended" },
          { status: 400 }
        );
      }
      salonId = salon.id;
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
