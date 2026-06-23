import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import VoiceLead from "@/models/VoiceLead";
import GeneralVoiceLead from "@/models/GeneralVoiceLead";
import {
  uploadAudioToCloudinary,
  transcribeAudio,
  extractRequirementsFromText
} from "@/services/voiceleads-service";

export async function POST(req) {
  try {
    // 1. Establish MongoDB connection
    await connectToDatabase();

    // 2. Parse multi-part form data
    const formData = await req.formData();
    const phoneNumber = formData.get("phoneNumber")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const durationSeconds = Number(formData.get("durationSeconds") || 0);
    const audioFile = formData.get("audio");
    const leadType = formData.get("leadType")?.toString().trim() || "buy";

    // 3. Validation Checks
    // Validate phone number (exactly 10 digits)
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number. Must be exactly 10 digits." },
        { status: 400 }
      );
    }

    // Validate email address
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing email address." },
        { status: 400 }
      );
    }

    // Validate recording length minimum (5s)
    if (durationSeconds < 5) {
      return NextResponse.json(
        { success: false, error: "Recording must be at least 5 seconds long." },
        { status: 400 }
      );
    }

    // Validate audio file presence
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Audio recording file is required." },
        { status: 400 }
      );
    }

    // Convert file to buffer for API uploading
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Cloudinary Upload
    let audioUrl = "";
    let status = "completed";
    let reviewNeeded = false;

    try {
      audioUrl = await uploadAudioToCloudinary(buffer, audioFile.name || "voice_lead.webm");
    } catch (uploadError) {
      console.error("[Voice Leads API] Cloudinary upload failed:", uploadError);
      status = "needs_review";
      reviewNeeded = true;

      // Write diagnostics to local log file for developer debugging
      try {
        const fs = require("fs");
        const path = require("path");
        const logMsg = `[${new Date().toISOString()}] Cloudinary Upload Failed\n` +
          `Error: ${uploadError.message || uploadError}\n` +
          `Stack: ${uploadError.stack || "N/A"}\n` +
          `JSON: ${JSON.stringify(uploadError)}\n\n`;
        fs.appendFileSync(path.join(process.cwd(), "cloudinary_error.log"), logMsg);
      } catch (logErr) {
        console.error("Failed to write to cloudinary_error.log:", logErr);
      }
    }

    // 5. Groq Whisper Transcription
    let rawRequirement = "";
    let transcriptionSuccess = true;

    try {
      rawRequirement = await transcribeAudio(buffer, audioFile.name || "voice_lead.webm");
      if (!rawRequirement || rawRequirement.trim() === "") {
        throw new Error("Whisper transcription returned empty text.");
      }
    } catch (transcribeError) {
      console.error("[Voice Leads API] Whisper transcription failed:", transcribeError);
      transcriptionSuccess = false;
      status = "transcription_failed";
      reviewNeeded = true;
      rawRequirement = ""; // Save empty raw requirements since transcription failed
    }

    // 6. Groq LLM Structured Field Extraction
    let city = "";
    let locality = "";
    let propertyType = "";
    let bhk = "";
    let budget = "";
    let purpose = "";
    let language = "";

    if (transcriptionSuccess) {
      try {
        const extraction = await extractRequirementsFromText(rawRequirement);
        city = extraction.city || "";
        locality = extraction.locality || "";
        propertyType = extraction.propertyType || "";
        bhk = extraction.bhk || "";
        budget = extraction.budget || "";
        purpose = extraction.purpose || "";
        language = extraction.language || "";
      } catch (extractionError) {
        console.error("[Voice Leads API] AI extraction failed:", extractionError);
        status = "needs_review";
        reviewNeeded = true;
      }
    }

    // 7. Save to Database Collection (conditional on leadType)
    const dbPayload = {
      phoneNumber,
      email,
      audioUrl,
      rawRequirement,
      city,
      locality,
      propertyType,
      bhk,
      budget,
      purpose,
      language,
      durationSeconds,
      source: "qr_voice",
      status,
      reviewNeeded,
      leadType
    };

    let voiceLead;
    if (leadType === "general") {
      voiceLead = await GeneralVoiceLead.create(dbPayload);
    } else {
      voiceLead = await VoiceLead.create(dbPayload);
    }

    return NextResponse.json(
      {
        success: true,
        data: voiceLead
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Unhandled error in POST /api/voiceleads:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
