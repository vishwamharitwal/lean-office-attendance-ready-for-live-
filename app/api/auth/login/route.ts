import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawIdentifier = (body.email || body.username || "").trim();
    const { password } = body;

    // Validate required fields
    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: "Login ID and password are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const identifier = rawIdentifier.toLowerCase();

    const isSpecialAdmin = identifier === "admin" || identifier === "admin@attendance.com";
    const isSpecialEmployee = identifier === "employee" || identifier === "employee@attendance.com";

    let user = null;
    if (isSpecialAdmin) {
      user = await User.findOne({
        $or: [{ email: "admin@attendance.com" }, { role: "admin" }],
        isActive: true,
      }).select("+password");
    } else if (isSpecialEmployee) {
      user = await User.findOne({
        email: "employee@attendance.com",
        isActive: true,
      }).select("+password");
    } else {
      user = await User.findOne({
        $or: [
          { email: identifier },
          { employeeId: { $regex: new RegExp(`^${rawIdentifier.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        ],
      }).select("+password");
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid Login ID or password", code: "AUTH_ERROR" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is inactive", code: "ACCOUNT_INACTIVE" },
        { status: 403 }
      );
    }

    // Compare password (also allow "admin" for admin, "employee" for employee)
    const isPasswordValid =
      (isSpecialAdmin && password === "admin") ||
      (isSpecialEmployee && password === "employee") ||
      (await comparePassword(password, user.password));

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid Login ID or password", code: "AUTH_ERROR" },
        { status: 401 }
      );
    }

    // Sign JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("rbeas_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          role: user.role,
          user: {
            id: user._id.toString(),
            name: user.name,
            role: user.role,
            email: user.email,
          },
          token,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
