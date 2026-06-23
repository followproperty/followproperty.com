import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ChatLead from "@/models/ChatLead";

export async function POST(req) {
  try {
    // 1. Establish MongoDB connection
    await connectToDatabase();

    // 2. Parse request body
    const body = await req.json();
    const { phoneNumber, email, intent, message, ticketNumber, chatHistory } = body;

    // 3. Validation Checks
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number. Must be exactly 10 digits." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (!intent || !["buy", "sell", "other"].includes(intent)) {
      return NextResponse.json(
        { success: false, error: "Invalid lead intent type." },
        { status: 400 }
      );
    }

    if (!ticketNumber) {
      return NextResponse.json(
        { success: false, error: "Ticket number is required." },
        { status: 400 }
      );
    }

    // 4. Save to ChatLead collection
    const chatLead = await ChatLead.create({
      phoneNumber,
      email,
      intent,
      message: message || "",
      ticketNumber,
      chatHistory: chatHistory || [],
      status: "new"
    });

    return NextResponse.json(
      {
        success: true,
        data: chatLead
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Unhandled error in POST /api/chat:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
