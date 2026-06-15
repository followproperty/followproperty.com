import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import BuilderApplication from "@/models/BuilderApplication";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/config/admin/admin-emails";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { firebaseUid, email, firstName, lastName, phoneNumber, city, state, isBuilder } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: firebaseUid and email" },
        { status: 400 }
      );
    }

    const isAllowedAdmin = isAdminEmail(email);

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        phoneNumber: phoneNumber || "",
        city: city || "",
        state: state || "",
        role: isAllowedAdmin ? "admin" : "user",
        isOnboarded: false,
        onboardingCompleted: false
      });
      console.log(`[Register Route] Created new user ${email} with role: ${user.role}`);

      if (isBuilder) {
        await BuilderApplication.findOneAndUpdate(
          { userId: user._id },
          { status: "draft" },
          { upsert: true }
        );
        console.log(`[Register Route] Created/verified BuilderApplication (status: draft) for user ${email}`);
      }

      // Send verification email via Resend
      try {
        const host = req.headers.get("host") || "followproperty.com";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const origin = `${protocol}://${host}`;
        const actionCodeSettings = {
          url: `${origin}/login`,
          handleCodeInApp: false,
        };
        const emailLink = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);

        const resendApiKey = process.env.RESEND_API;
        if (resendApiKey) {
          const fromEmail = process.env.RESEND_FROM_EMAIL || "FollowProperty <onboarding@resend.dev>";
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [email],
              subject: "Verify Your Email - FollowProperty",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #0f172a; margin-bottom: 16px;">Welcome to FollowProperty!</h2>
                  <p style="color: #334155; font-size: 16px; line-height: 24px;">
                    Thank you for signing up. Please verify your email address to activate your account.
                  </p>
                  <div style="margin: 24px 0;">
                    <a href="${emailLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                      Verify Email
                    </a>
                  </div>
                  <p style="color: #64748b; font-size: 14px; line-height: 20px;">
                    If the button above doesn't work, copy and paste the following link into your browser:
                  </p>
                  <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
                    ${emailLink}
                  </p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="color: #94a3b8; font-size: 12px;">
                    This link will expire in 1 hour. If you didn't create an account, you can safely ignore this email.
                  </p>
                </div>
              `,
            }),
          });

          if (!resendResponse.ok) {
            const errorData = await resendResponse.json();
            console.error("[Register Route] Resend email send failed:", errorData);
          } else {
            console.log(`[Register Route] Verification email sent successfully to ${email} via Resend.`);
          }
        } else {
          console.warn("[Register Route] RESEND_API key not found. Email not sent.");
        }
      } catch (emailError) {
        console.error("[Register Route] Verification email sending failed:", emailError);
      }
    } else {
      // Bootstrapping/Promotion: If email is in allowed list, promote them to "admin" if they aren't already.
      // Do not demote them if their email is not in the list (MongoDB role is long-term source of truth).
      if (isAllowedAdmin && user.role !== "admin") {
        user.role = "admin";
        await user.save();
        console.log(`[Register Route] Promoted existing user ${email} to admin.`);
      }
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred during user registration" },
      { status: 500 }
    );
  }
}
