"use client";

import { useEffect, useState } from "react";

export default function ReferPage() {
  const [countdown, setCountdown] = useState(2.5);
  const redirectUrl = "https://www.followproperty.org/refer";

  useEffect(() => {
    // Countdown mechanism
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return Math.max(0, Math.round((prev - 0.1) * 10) / 10);
      });
    }, 100);

    // Redirect after 2.5 seconds
    const timer = setTimeout(() => {
      window.location.replace(redirectUrl);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0907] text-[#f7f5f1] flex flex-col justify-between items-center p-6 sm:p-12 font-sans antialiased selection:bg-[#fd793359] selection:text-[#f7f5f1]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-logo {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-logo {
          animation: float-logo 5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .gradient-text {
          background: linear-gradient(135deg, #fd7933, #e5bf6d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-panel {
          backdrop-filter: blur(24px) saturate(160%);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 30px 70px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
        }
      ` }} />

      {/* Header */}
      <div className="w-full max-w-7xl flex items-center justify-between py-4 animate-fade-in-up [animation-delay:100ms]">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#fd7933] shadow-[0_0_12px_#fd7933]"></span>
          <span className="text-sm font-semibold tracking-wider uppercase text-white/90">FollowProperty</span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="flex-1 flex items-center justify-center w-full max-w-md my-auto animate-fade-in-up [animation-delay:200ms]">
        <div className="glass-panel w-full rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
          {/* Top glowing blur element */}
          <div aria-hidden="true" className="absolute -top-24 size-48 rounded-full bg-[#fd7933]/15 blur-3xl pointer-events-none" />

          {/* Icon/Logo with float animation */}
          <div className="relative mb-8 animate-float-logo">
            {/* Spinning decorative frame */}
            <div className="absolute inset-0 -m-3 rounded-full border border-dashed border-[#fd7933]/25 animate-spin-slow pointer-events-none" />
            <div className="relative size-20 rounded-2xl bg-gradient-to-tr from-[#fd7933] to-[#e5bf6d] flex items-center justify-center shadow-[0_12px_40px_rgba(253,121,51,0.3)]">
              {/* iPhone silhouette or elegant arrow */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="size-9 text-[#0b0907]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3-3m0 0 3-3m-3 3h18M16.5 3 21 3m0 0v18M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
              </svg>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#fd7933] mb-4">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fd7933] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#fd7933]"></span>
            </span>
            Parent Site Redirect
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4">
            Redirecting to <span className="gradient-text">FollowProperty.org</span>
          </h1>

          <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-sm">
            We are forwarding you to our parent site's referral page for our limited-time <strong className="text-white font-medium">BPTP Downtown Campaign</strong>.
          </p>

          {/* Loader bar and Countdown text */}
          <div className="w-full space-y-4 mb-8">
            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#fd7933] to-[#e5bf6d] transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${((2.5 - countdown) / 2.5) * 100}%` }}
              />
            </div>
            <div className="text-xs text-stone-500 font-mono tracking-wider">
              {countdown > 0 ? `Connecting in ${countdown.toFixed(1)}s...` : "Connecting now..."}
            </div>
          </div>

          {/* Button Link */}
          <a
            href={redirectUrl}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full py-4 px-6 bg-gradient-to-r from-[#fd7933] to-[#c53829] text-white font-semibold shadow-[0_8px_24px_rgba(253,121,51,0.25)] hover:shadow-[0_8px_32px_rgba(253,121,51,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition duration-300 font-sans text-sm border-0 cursor-pointer text-center no-underline"
          >
            <span>Proceed Immediately</span>
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Footer / Helper text */}
      <div className="w-full text-center py-6 animate-fade-in-up [animation-delay:300ms]">
        <p className="text-stone-500 text-xs">
          If you are not redirected automatically within a few seconds,{" "}
          <a href={redirectUrl} className="text-[#fd7933] hover:underline font-medium no-underline">
            click here to continue
          </a>.
        </p>
        <p className="text-stone-600 text-[10px] mt-2">
          © 2026 FollowProperty. All rights reserved.
        </p>
      </div>
    </div>
  );
}
