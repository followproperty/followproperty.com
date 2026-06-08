import { verifyAuthRequest } from "@/lib/auth-guards";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(req) {
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

    const { decodedToken } = authResult;
    const firebaseUid = decodedToken.uid;
    
    const body = await req.json();
    const { firstName, lastName, phoneNumber, city, state, age, gender, occupation, annualFamilyIncome } = body;

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { 
        firstName: firstName !== undefined ? firstName.trim() : "",
        lastName: lastName !== undefined ? lastName.trim() : "",
        phoneNumber: phoneNumber !== undefined ? phoneNumber.trim() : "",
        city: city !== undefined ? city.trim() : "",
        state: state !== undefined ? state.trim() : "",
        age: age !== undefined ? Number(age) : null,
        gender: gender !== undefined ? gender.trim() : "",
        occupation: occupation !== undefined ? occupation.trim() : "",
        annualFamilyIncome: annualFamilyIncome !== undefined ? annualFamilyIncome.trim() : ""
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred during profile update" },
      { status: 500 }
    );
  }
}
