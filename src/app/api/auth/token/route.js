import { NextResponse } from "next/server";
import { signJwt } from "@/lib/jwt";
import { auth } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: No active session to issue JWT" },
        { status: 401 }
      );
    }

    const payload = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role || "user",
    };

    const token = signJwt(payload);

    const response = NextResponse.json({
      token,
      user: payload,
    });

    // Also set as httpOnly / standard cookie for seamless browser fetch
    response.cookies.set("jwt_token", token, {
      httpOnly: false, // Accessible to client scripts if needed
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error("Error generating JWT token:", error);
    return NextResponse.json(
      { error: "Failed to generate JWT token", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, id } = body;

    if (!email) {
      return NextResponse.json(
        { error: "email is required to sign JWT" },
        { status: 400 }
      );
    }

    const payload = {
      id: id || null,
      email,
      name: name || "User",
      role: "user",
    };

    const token = signJwt(payload);

    const response = NextResponse.json({
      token,
      user: payload,
    });

    response.cookies.set("jwt_token", token, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error("Error generating JWT token via POST:", error);
    return NextResponse.json(
      { error: "Failed to generate JWT token" },
      { status: 500 }
    );
  }
}
