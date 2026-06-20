import Groq, { toFile } from "groq-sdk";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Groq
const groqApiKey = process.env.GROQ_API || process.env.GROq_api || process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

/**
 * Uploads an audio buffer to Cloudinary in the 'Followproperty/voiceleads' folder.
 * Returns the secure upload URL.
 * 
 * @param {Buffer} buffer - Audio file buffer
 * @param {string} filename - Filename (e.g. 'voice_lead.webm')
 * @returns {Promise<string>} secure Cloudinary URL
 */
export async function uploadAudioToCloudinary(buffer, filename) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary configuration keys are missing in environment variables.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "Followproperty/voiceleads",
        resource_type: "video", // audio is treated as 'video' in Cloudinary
        public_id: filename.replace(/\.[^/.]+$/, "") + "_" + Date.now(),
        secure: true
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Transcribes audio buffer using Groq Whisper.
 * 
 * @param {Buffer} buffer - Audio file buffer
 * @param {string} filename - Filename (e.g. 'voice_lead.webm')
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(buffer, filename = "voice_lead.webm") {
  if (!groq) {
    throw new Error("Groq API key is not configured.");
  }

  const file = await toFile(buffer, filename, { type: "audio/webm" });

  const response = await groq.audio.transcriptions.create({
    file: file,
    model: "whisper-large-v3",
  });

  return response.text || "";
}

/**
 * Extracts structured fields from the transcript text using a Groq LLM.
 * 
 * @param {string} text - Transcribed requirement text
 * @returns {Promise<object>} Extracted structured fields
 */
export async function extractRequirementsFromText(text) {
  if (!groq) {
    throw new Error("Groq API key is not configured.");
  }

  const systemPrompt = `You are a real estate assistant. Extract structured details from the following transcript of a user's verbal requirements.
You MUST respond with a valid JSON object ONLY. Do not write any introductory or explanatory text. The JSON object must contain the following keys exactly:
- city (string): The city name, or empty string if not mentioned.
- locality (string): The neighborhood or area within the city, or empty string if not mentioned.
- propertyType (string): The type of property (e.g. apartment, villa, plot, commercial, independent house), or empty string if not mentioned.
- bhk (string): The BHK requirement (e.g. '1 BHK', '2 BHK', '3 BHK', '4+ BHK'), or empty string if not mentioned.
- budget (string): The price budget (e.g. '50 Lakhs', '2 Crores', '40,000 per month'), or empty string if not mentioned.
- purpose (string): The transaction purpose ('buying', 'renting', 'selling', 'leasing'), or empty string if not mentioned.
- language (string): The language of the transcript (e.g. 'English', 'Hindi', 'mix'), or empty string if not detected.

If a field is not present or cannot be determined, set its value to an empty string ("").

Example response:
{
  "city": "Mumbai",
  "locality": "Andheri West",
  "propertyType": "apartment",
  "bhk": "2 BHK",
  "budget": "1.5 Crores",
  "purpose": "buying",
  "language": "English"
}`;

  console.log("[VoiceLeads Service] Prompt Sent:\n", `System: ${systemPrompt}\nUser: Transcript: "${text}"`);

  // Try with Llama 3.3 70B model first
  const primaryModel = "llama-3.3-70b-specdec";
  console.log("[VoiceLeads Service] Attempting Primary Model:", primaryModel);
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Transcript: "${text}"` }
      ],
      model: primaryModel,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    console.log("[VoiceLeads Service] Primary Model Raw Response:", content);
    
    const parsed = JSON.parse(content);
    console.log("[VoiceLeads Service] Primary Model Parsed Response:", parsed);
    return parsed;
  } catch (error) {
    console.error("[VoiceLeads Service] Primary Model Error:", error.message);
    if (error instanceof SyntaxError) {
      console.error("[VoiceLeads Service] Primary JSON Parse Error:", error);
    }
    
    // Fallback to Llama 3 8B
    const fallbackModel = "llama3-8b-8192";
    console.log("[VoiceLeads Service] Attempting Fallback Model:", fallbackModel);
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcript: "${text}"` }
        ],
        model: fallbackModel,
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      console.log("[VoiceLeads Service] Fallback Model Raw Response:", content);
      
      const parsed = JSON.parse(content);
      console.log("[VoiceLeads Service] Fallback Model Parsed Response:", parsed);
      return parsed;
    } catch (fallbackError) {
      console.error("[VoiceLeads Service] Fallback Model Error:", fallbackError.message);
      if (fallbackError instanceof SyntaxError) {
        console.error("[VoiceLeads Service] Fallback JSON Parse Error:", fallbackError);
      }
      throw fallbackError; // Rethrow to let the API endpoint handle it
    }
  }
}
