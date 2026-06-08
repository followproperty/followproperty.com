import React from "react";

export default function Loading({ fullPage = false, size = "md", text = "" }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Pulsing glow background */}
        <div className={`absolute rounded-full bg-brand-blue/10 animate-ping duration-1000 ${
          size === "sm" ? "w-8 h-8" : size === "md" ? "w-14 h-14" : "w-22 h-22"
        }`} />
        {/* Animated spin tracker */}
        <div className={`rounded-full border-brand-border-mid border-t-brand-blue animate-spin ${sizeClasses[size]}`} />
      </div>
      {text && (
        <p className="mt-4 text-xs font-semibold text-brand-slate uppercase tracking-widest animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[150] bg-brand-bg/85 backdrop-blur-md flex flex-col justify-between items-center p-8 animate-in fade-in duration-200 font-sans">
        {/* Brand header at the top */}
        <div className="flex items-center gap-2 py-4">
          <img src="/favicon.svg" alt="FollowProperty Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-[18px] text-brand-navy tracking-[-0.025em]">
            FollowProperty
          </span>
        </div>
        
        {/* Centered spinner */}
        <div className="flex-1 flex items-center justify-center">
          {spinner}
        </div>
        
        {/* Bottom spacer to align center */}
        <div className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {spinner}
    </div>
  );
}
