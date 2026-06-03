"use client";

import React, { useState } from "react";

export default function LeadButton() {
  const [success, setSuccess] = useState(false);

  const handleClick = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={success}
        className={`px-8 py-3.5 rounded-xl border-none font-bold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-lg ${
          success 
            ? "bg-brand-emerald text-white cursor-not-allowed shadow-[0_4px_20px_rgba(16,185,129,0.3)]" 
            : "bg-brand-teal text-white hover:bg-brand-teal/95 shadow-[0_4px_20px_rgba(13,148,136,0.3)]"
        }`}
      >
        {success ? "Assistance Requested!" : "Get Project Assistance"}
      </button>
      
      {success && (
        <span className="text-[11px] text-brand-emerald font-extrabold mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          ✓ Verified request queued. An advisor will reach out to you shortly.
        </span>
      )}
    </div>
  );
}
