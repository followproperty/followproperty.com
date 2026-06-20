import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import VoiceLead from "@/models/VoiceLead";
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
    const durationSeconds = Number(formData.get("durationSeconds") || 0);
    const audioFile = formData.get("audio");

    // 3. Validation Checks
    // Validate phone number (exactly 10 digits)
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number. Must be exactly 10 digits." },
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
    try {
      audioUrl = await uploadAudioToCloudinary(buffer, audioFile.name || "voice_lead.webm");
    } catch (uploadError) {
      console.error("[Voice Leads API] Cloudinary upload failed:", uploadError);
      // We will continue saving the lead even if Cloudinary fails, but mark it for review
    }

    // 5. Groq Whisper Transcription
    let rawRequirement = "";
    let status = "completed";
    let reviewNeeded = false;
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

    // 7. Save to VoiceLead Collection
    const voiceLead = await VoiceLead.create({
      phoneNumber,
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
      reviewNeeded
    });

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
