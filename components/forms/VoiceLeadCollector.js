"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  Square,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Sparkles,
  Volume2,
  Mail
} from "lucide-react";

export default function VoiceLeadCollector({ leadType }) {
  const router = useRouter();
  const [step, setStep] = useState("phone"); // phone, record, submitting, success
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlPreview, setAudioUrlPreview] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState("");
  
  // API and UI processing state
  const [submitStage, setSubmitStage] = useState("Uploading recording...");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const previewRef = useRef(null);

  // Stop recording tracks and clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Auto scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Auto scroll to submit options when recording stops and preview is ready
  useEffect(() => {
    if (audioUrlPreview && !isRecording && previewRef.current) {
      const timer = setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [audioUrlPreview, isRecording]);

  const handleStepOneSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (hasError) return;
    setStep("record");
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Allow digits only
    if (val.length <= 10) {
      setPhoneNumber(val);
      if (val.length === 10) {
        setPhoneError("");
      }
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      setAudioBlob(null);
      setAudioUrlPreview("");
      setDurationSeconds(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Determine cross-platform supported mime type (iOS supports mp4, chrome/android supports webm)
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(finalBlob);
        setAudioUrlPreview(URL.createObjectURL(finalBlob));
        
        // Stop microphone use
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);

      // Start duration counting
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setDurationSeconds(seconds);
        if (seconds >= 60) {
          // Auto stop recording at 60s
          stopRecording();
        }
      }, 1000);

    } catch (err) {
      console.error("Microphone access blocked:", err);
      setError("Microphone permission is required to submit a voice lead. Please allow access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const resetRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setAudioBlob(null);
    setAudioUrlPreview("");
    setDurationSeconds(0);
    setError("");
    setIsRecording(false);

    // Scroll back to top to show instructions and record button
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const handleLeadSubmit = async () => {
    if (!audioBlob) return;
    if (durationSeconds < 5) {
      setError("Recording must be at least 5 seconds.");
      return;
    }

    setStep("submitting");
    setError("");

    // Simulate animated server milestones
    const stages = [
      "Uploading voice memo securely...",
      "AI transcribing your message...",
      "Extracting real estate requirements..."
    ];
    let stageIdx = 0;
    setSubmitStage(stages[0]);
    const stageInterval = setInterval(() => {
      if (stageIdx < stages.length - 1) {
        stageIdx++;
        setSubmitStage(stages[stageIdx]);
      }
    }, 2800);

    try {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("email", email);
      formData.append("durationSeconds", durationSeconds);
      formData.append("leadType", leadType);

      const fileExt = mediaRecorderRef.current?.mimeType?.includes("mp4") ? "m4a" : "webm";
      formData.append("audio", audioBlob, `voice_lead.${fileExt}`);

      const response = await fetch("/api/voiceleads", {
        method: "POST",
        body: formData,
      });

      clearInterval(stageInterval);

      const json = await response.json();
      if (response.ok && json.success) {
        setStep("success");
      } else {
        throw new Error(json.error || "Failed to process lead.");
      }
    } catch (err) {
      clearInterval(stageInterval);
      console.error("Submission failed:", err);
      setError(err.message || "An error occurred. Please try again.");
      setStep("record");
    }
  };

  // Helper to format MM:SS duration
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Text contents tailored for leadType
  const pageTitle = leadType === "sell" 
    ? "Voice Property Listing" 
    : leadType === "general" 
    ? "Tell Us Your Requirements" 
    : "Voice Requirement Assistant";

  const pageSubtitle = leadType === "sell"
    ? "Simply speak the details of the property you want to sell, and let our AI match it with potential buyers."
    : leadType === "general"
    ? "Describe what you are looking for, whether buying, renting, selling, or leasing, and let our AI handle the matching."
    : "Simply speak what property details you need and let our AI matching engine fetch listings.";
  
  const setupInstructions = leadType === "sell"
    ? "Enter details. Next, record a voice clip describing property details (location, type, BHK, price, features)."
    : leadType === "general"
    ? "Enter details. Next, record a voice clip describing any real estate requirements (buying, renting, or leasing in India)."
    : "Enter details. Next, record a voice clip describing locations, BHKs, and budget targets.";

  const guidePills = leadType === "sell"
    ? ["Property Details", "Location", "Expected Price", "Configuration", "Selling Intent"]
    : leadType === "general"
    ? ["City/Locality", "Intent (Buy/Rent)", "Budget", "Property Type", "Specials"]
    : ["City", "Locality", "Budget", "Property Type", "Requirement"];

  const exampleEnglish = leadType === "sell"
    ? "I want to sell my 3 BHK apartment in Gurgaon Sector 54. Expected price is 2 Crores. The property is on the 8th floor and I'm looking for buyers."
    : leadType === "general"
    ? "I'm looking to rent a fully furnished 2 BHK house in Bangalore Indiranagar. My budget is 50,000 per month, and I need parking space."
    : "Looking for a 3 BHK apartment in Gurgaon Sector 54, budget around 2 Crores. I need it for self-use and prefer a middle or high floor.";

  const exampleHindi = leadType === "sell"
    ? "मुझे अपना गुड़गांव सेक्टर 54 में 3 BHK फ्लैट बेचना है, एक्सपेक्टेड प्राइस लगभग 2 करोड़। 8th फ्लोर पर है, और मैं खरीदार ढूंढ रहा हूँ।"
    : leadType === "general"
    ? "मुझे बैंगलोर इंदिरानगर में किराए पर 2 BHK फर्निश्ड घर चाहिए। बजट 50,000 प्रति महीना है, और पार्किंग होनी चाहिए।"
    : "मुझे गुड़गांव सेक्टर 54 में 3 BHK फ्लैट चाहिए, बजट लगभग 2 करोड़। खुद के रहने के लिए, मिडल या हाई फ्लोर पर।";

  return (
    <div className="bg-[#FAFAF8] min-h-screen text-[#0F1629] flex flex-col font-sans selection:bg-[#325fec] selection:text-white relative overflow-hidden">
      {/* Header */}
      <header className="w-full bg-[#FAFAF8] border-b border-brand-border py-4 px-6 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img src="/favicon.svg" alt="FollowProperty Logo" className="w-7 h-7 object-contain" />
            <span className="font-bold text-[17px] tracking-[-0.025em] text-[#0F1629]">
              FollowProperty
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-[0.14em] uppercase ml-1 text-brand-slate-light font-semibold">
              Real Assets
            </span>
          </Link>
        </div>
      </header>

      {/* Main workspace */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-12 z-10">
        {/* Toggle switch for Buy/Sell/General pages */}
        <div className="w-full max-w-md bg-[#F4F3EF] p-1 rounded-xl border border-brand-border-mid mb-4 flex shadow-sm gap-0.5">
          <button
            type="button"
            onClick={() => router.push("/i-want-to-buy")}
            className={`flex-1 py-2 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              leadType === "buy"
                ? "bg-white text-[#0F1629] shadow-sm border border-brand-border"
                : "text-brand-slate hover:text-[#0F1629]"
            }`}
          >
            I Want To Buy
          </button>
          <button
            type="button"
            onClick={() => router.push("/i-want-to-sell")}
            className={`flex-1 py-2 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              leadType === "sell"
                ? "bg-white text-[#0F1629] shadow-sm border border-brand-border"
                : "text-brand-slate hover:text-[#0F1629]"
            }`}
          >
            I Want To Sell
          </button>
          <button
            type="button"
            onClick={() => router.push("/tell-us-your-requirements")}
            className={`flex-1 py-2 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              leadType === "general"
                ? "bg-white text-[#0F1629] shadow-sm border border-brand-border"
                : "text-brand-slate hover:text-[#0F1629]"
            }`}
          >
            Tell Us Requirements
          </button>
        </div>

        <div className="w-full max-w-md bg-white border border-brand-border rounded-2xl shadow-brand-md overflow-hidden p-6 md:p-8 space-y-6">
          
          {step === "phone" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue-bg border border-brand-blue-border rounded-full text-xs font-semibold text-[#325fec]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {leadType === "sell" ? "Seller Mode" : leadType === "general" ? "Requirements Mode" : "Buyer Mode"}
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1629]">{pageTitle}</h1>
                <p className="text-brand-slate text-sm">
                  {pageSubtitle}
                </p>
              </div>

              <form onSubmit={handleStepOneSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-slate">
                    WhatsApp or Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-slate">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="99999 99999"
                      className="form-input pl-10 text-brand-navy-deep font-semibold text-base py-3"
                      required
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[#DC2626] text-xs font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {phoneError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-slate">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-slate">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="name@example.com"
                      className="form-input pl-10 text-brand-navy-deep font-semibold text-base py-3"
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-[#DC2626] text-xs font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={phoneNumber.length !== 10 || !email}
                  className="btn-primary w-full py-3.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Proceed to Record <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Informative info banner */}
              <div className="bg-[#FAFAF8] border border-brand-border-mid rounded-xl p-4 flex gap-3 text-brand-slate text-xs leading-relaxed">
                <Info className="w-5 h-5 text-[#325fec] shrink-0" />
                <div>
                  <span className="font-bold text-[#0f1629] block mb-0.5">Quick setup</span>
                  <p>{setupInstructions}</p>
                </div>
              </div>
            </div>
          )}

          {step === "record" && (
            <div className="space-y-6">
              {/* Contact Details Header */}
              <div className="flex flex-col gap-1.5 bg-[#FAFAF8] border border-brand-border px-4 py-3 rounded-xl text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-brand-slate font-medium">Phone: <strong className="text-[#0F1629] font-bold">{phoneNumber.slice(0, 5)} {phoneNumber.slice(5)}</strong></span>
                  <button
                    onClick={() => { resetRecording(); setStep("phone"); }}
                    className="text-xs text-[#325fec] font-bold hover:underline"
                  >
                    Edit Details
                  </button>
                </div>
                <div className="text-xs text-brand-slate truncate">
                  Email: <span className="text-[#0F1629] font-bold">{email}</span>
                </div>
              </div>

              {/* Example box matching target requirement */}
              {!audioBlob && (
                <div className="bg-white border border-brand-border border-l-4 border-l-[#325fec] rounded-r-xl p-4 space-y-3 text-xs text-[#0F1629] leading-relaxed shadow-sm">
                  <div>
                    <span className="font-extrabold uppercase tracking-wider text-[#325fec] flex items-center gap-1">
                      💡 Describe these details in your message:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {guidePills.map((pill) => (
                        <span key={pill} className="badge-blue text-[10px] px-2.5 py-0.5 font-bold">
                          {pill}
                        </span>
                      ))}
                    </div>
                    <p className="text-brand-slate font-semibold text-[11px] mt-2.5">
                      English, Hindi, or Hinglish (mix) are supported.
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-2.5">
                    <p className="text-[#0F1629] font-bold text-[11px] mb-2 flex items-center gap-1 bg-[#FAFAF8] px-2 py-1 rounded border border-brand-border">
                      🗣️ Speak like this / आप इस तरह से बोल सकते हैं:
                    </p>
                    
                    <div className="space-y-3 pl-1">
                      <div>
                        <span className="font-bold text-brand-slate text-[9px] uppercase tracking-wider block mb-0.5">English</span>
                        <p className="italic text-slate-700 font-medium">
                          "{exampleEnglish}"
                        </p>
                      </div>
                      <div className="border-t border-dashed border-slate-100 pt-2.5">
                        <span className="font-bold text-brand-slate text-[9px] uppercase tracking-wider block mb-0.5">Hindi / Hinglish</span>
                        <p className="italic text-slate-700 font-medium">
                          "{exampleHindi}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recorder UI Widget */}
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <div className="relative flex items-center justify-center">
                  {/* Pulse ring animation */}
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 bg-[#DC2626] rounded-full animate-ping opacity-20" />
                      <div className="absolute -inset-3 bg-[#DC2626] rounded-full animate-pulse opacity-5" />
                    </>
                  )}
                  
                  {!audioBlob ? (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition border-4 border-white z-10 cursor-pointer ${
                        isRecording 
                          ? "bg-[#DC2626] text-white hover:bg-red-700" 
                          : "bg-[#325fec] text-white hover:bg-[#1e3bb3]"
                      }`}
                    >
                      {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-7 h-7 fill-current" />}
                      <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">
                        {isRecording ? "Stop" : "Record"}
                      </span>
                    </button>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-emerald-200 flex flex-col items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-9 h-9 text-[#059669]" />
                      <span className="text-[10px] font-extrabold uppercase text-[#059669] mt-1 tracking-wider">
                        Recorded
                      </span>
                    </div>
                  )}
                </div>

                {/* Duration Stopwatch */}
                <div className="text-center space-y-1">
                  <div className={`text-3xl font-mono font-bold tracking-widest ${isRecording ? "text-[#DC2626]" : "text-[#0F1629]"}`}>
                    {formatTime(durationSeconds)}
                  </div>
                  <div className="text-xs text-brand-slate font-semibold uppercase tracking-wider">
                    {isRecording ? (
                      <span className="flex items-center gap-1.5 justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" /> Recording (Max 1 min)
                      </span>
                    ) : audioBlob ? (
                      "Preview before submitting"
                    ) : (
                      "Recording limit: 5s - 60s"
                    )}
                  </div>
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-3.5 bg-red-50 border border-brand-red-border rounded-xl flex gap-2.5 items-start text-xs text-[#DC2626] leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Preview Player & Action Trigger buttons */}
              {audioUrlPreview && !isRecording && (
                <div ref={previewRef} className="space-y-4 pt-2">
                  {durationSeconds < 5 && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex gap-2.5 items-start text-xs text-[#DC2626] leading-relaxed shadow-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block">Recording too short</span>
                        <p className="text-slate-600 font-medium">
                          Your recording is only {durationSeconds} seconds. Please record a message longer than 5 seconds.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-slate tracking-wider">Review recording</span>
                    <audio src={audioUrlPreview} controls className="w-full focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={resetRecording}
                      className="btn-secondary py-3 px-4 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <RefreshCw className="w-4 h-4" /> Re-record
                    </button>

                    <button
                      onClick={handleLeadSubmit}
                      disabled={durationSeconds < 5}
                      className="py-3 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Submit Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "submitting" && (
            <div className="text-center space-y-6 py-8">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#325fec] animate-spin" />
                <Mic className="w-8 h-8 text-[#325fec] absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-[#0f1629]">AI Extraction Underway</h2>
                <p className="text-brand-slate text-sm font-semibold max-w-xs mx-auto animate-pulse">
                  {submitStage}
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-5 py-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#059669] shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1629]">Listing Registered</h1>
                <p className="text-brand-slate text-sm leading-relaxed">
                  Our AI is currently matching database listings. We will send updates to <span className="text-[#0F1629] font-bold">{phoneNumber}</span> and <span className="text-[#0F1629] font-bold">{email}</span> shortly.
                </p>
              </div>

              <button
                onClick={() => {
                  resetRecording();
                  setPhoneNumber("");
                  setEmail("");
                  setStep("phone");
                }}
                className="btn-secondary py-3 px-6 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          )}

        </div>

        {step === "success" && (
          <Link
            href="/"
            className="mt-6 text-base font-bold text-[#325fec] hover:underline no-underline flex items-center gap-1.5 transition"
          >
            Explore Other Features &rarr;
          </Link>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-brand-slate-light text-[10px] uppercase tracking-wider font-semibold border-t border-brand-border">
        &copy; {new Date().getFullYear()} FollowProperty.com | All rights reserved.
      </footer>
    </div>
  );
}
