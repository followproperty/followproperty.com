import { verifyAuthRequest } from "@/lib/auth-guards";
import connectToDatabase from "@/lib/db";
import BuilderApplication from "@/models/BuilderApplication";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authResult = await verifyAuthRequest({ checkRevoked: true });
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
      response.cookies.set("token", "", { expires: new Date(0), path: "/" });
      response.cookies.set("user_role", "", { expires: new Date(0), path: "/" });
      response.cookies.set("builder_status", "", { expires: new Date(0), path: "/" });
      return response;
    }

    const { user } = authResult;
    await connectToDatabase();

    const body = await req.json();
    const {
      builderName,
      companyName,
      contactPersonName,
      phone,
      email,
      city,
      website,
      reraNumber,
    } = body;

    // Validate required fields
    if (!builderName || !companyName || !contactPersonName || !phone || !email || !city) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert or update BuilderApplication
    const application = await BuilderApplication.findOneAndUpdate(
      { userId: user._id },
      {
        builderName: builderName.trim(),
        companyName: companyName.trim(),
        contactPersonName: contactPersonName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        city: city.trim(),
        website: website ? website.trim() : "",
        reraNumber: reraNumber ? reraNumber.trim() : "",
        status: "pending",
      },
      { new: true, upsert: true }
    );

    const response = NextResponse.json(
      { success: true, data: application },
      { status: 200 }
    );

    // Update the builder_status cookie dynamically on submission
    response.cookies.set("builder_status", "pending", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in POST /api/builder-application:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authResult = await verifyAuthRequest({ checkRevoked: true });
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
      response.cookies.set("token", "", { expires: new Date(0), path: "/" });
      response.cookies.set("user_role", "", { expires: new Date(0), path: "/" });
      response.cookies.set("builder_status", "", { expires: new Date(0), path: "/" });
      return response;
    }

    const { user } = authResult;
    await connectToDatabase();

    const application = await BuilderApplication.findOne({ userId: user._id }).lean();

    return NextResponse.json(
      { success: true, data: application },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/builder-application:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
