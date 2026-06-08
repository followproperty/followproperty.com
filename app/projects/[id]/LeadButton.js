"use client";

import React, { useState } from "react";

export default function LeadButton({ 
  className, 
  text = "Get Project Assistance", 
  successText = "✓ Verified request queued. An advisor will reach out to you shortly." 
}) {
  const [success, setSuccess] = useState(false);

  const handleClick = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <button
        onClick={handleClick}
        disabled={success}
        className={className || `px-8 py-3.5 rounded-xl border-none font-bold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-lg ${
          success 
            ? "bg-brand-emerald text-white cursor-not-allowed shadow-[0_4px_20px_rgba(16,185,129,0.3)]" 
            : "bg-brand-blue text-white hover:bg-brand-blue/95 shadow-[0_4px_20px_rgba(50,95,236,0.3)]"
        }`}
      >
        {success ? "Request Received!" : text}
      </button>
      
      {success && (
        <span className="text-[10px] sm:text-[11px] text-brand-emerald font-extrabold mt-1 text-center animate-in fade-in slide-in-from-top-1 duration-200">
          {successText}
        </span>
      )}
    </div>
  );
}
