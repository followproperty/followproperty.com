"use client";

import React, { useState, useEffect } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ReferralAdWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { showToast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('requirements-ad-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Slide in after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem('requirements-ad-dismissed', 'true');
    }, 450); // wait for slide-out transition
  };

  const handleRedirect = (e) => {
    e.preventDefault();
    if (isRedirecting) return;
    setIsRedirecting(true);

    showToast(
      "Opening requirements form. Please wait...",
      "info",
      "Requirements Form"
    );

    setTimeout(() => {
      window.location.href = "https://www.followproperty.com/tell-us-your-requirements";
    }, 1200);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-[340px] w-[calc(100vw-32px)] sm:w-[340px] bg-[#0c0a09]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(59,130,246,0.15)] p-4 sm:p-5 transition-all duration-700 ease-out transform ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : '-translate-x-[120%] opacity-0 pointer-events-none'
      }`}
    >
      {/* Inject custom CSS keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-ad {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shine-effect {
          0% { left: -100%; }
          15% { left: 100%; }
          100% { left: 100%; }
        }
        .animate-float-ad {
          animation: float-ad 4.5s ease-in-out infinite;
        }
        .animate-shine {
          animation: shine-effect 5.5s ease-in-out infinite;
        }
      ` }} />

      {/* Inner subtle bottom-left background glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-[#3b82f6]/15 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute bottom-2.5 right-2.5 sm:top-2.5 sm:bottom-auto p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition z-55 cursor-pointer border-0 outline-none"
        aria-label="Dismiss requirements alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Inner float wrapper */}
      <div className="animate-float-ad">
        <div 
          onClick={handleRedirect} 
          className="flex items-start gap-3.5 sm:gap-4 no-underline select-none cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleRedirect(e);
            }
          }}
        >
          {/* Thumbnail Container with Shine reflection */}
          <div className="relative w-14 sm:w-16 aspect-square bg-[#141210] rounded-xl overflow-hidden shrink-0 border border-white/5 flex items-center justify-center shadow-inner group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#3b82f6]/15 z-10 pointer-events-none" />
            
            {/* Glossy reflection layer */}
            <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -left-full z-20 pointer-events-none animate-shine" />
            
            <ClipboardList className="w-6 h-6 text-[#3b82f6] drop-shadow-[0_4px_10px_rgba(59,130,246,0.4)] transform group-hover:scale-110 transition duration-500" />
          </div>

          {/* Copy Area */}
          <div className="flex-1 min-w-0 pr-4">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-[#3b82f6] mb-1 font-sans">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b82f6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3b82f6]"></span>
              </span>
              Direct Match
            </span>
            <h4 className="text-white text-xs sm:text-sm font-bold tracking-tight leading-snug font-sans">
              Wanna Buy or Sell?
            </h4>
            <p className="text-[#9c9792] text-[10px] sm:text-xs leading-normal mt-1 font-sans font-normal text-pretty">
              No logins, no complex forms. Just tell us your requirements and find matching properties.
            </p>
            <div className="inline-flex items-center gap-1 text-[#3b82f6] text-[10px] sm:text-xs font-semibold mt-2.5 group font-sans">
              <span>Tell Us Your Requirements</span>
              <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
// =========================================================================
// PREVIOUS REFERRAL ALERT WIDGET CODE (COMMENTED OUT FOR REFERENCE/ROLLBACK)
// =========================================================================
//
// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { X } from 'lucide-react';
// import { useToast } from '@/context/ToastContext';
// 
// export function ReferralAdWidgetBackup() {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isDismissed, setIsDismissed] = useState(false);
//   const { showToast } = useToast();
//   const [isRedirecting, setIsRedirecting] = useState(false);
// 
//   useEffect(() => {
//     const dismissed = sessionStorage.getItem('referral-ad-dismissed');
//     if (dismissed) {
//       setIsDismissed(true);
//       return;
//     }
//     const timer = setTimeout(() => {
//       setIsVisible(true);
//     }, 2000);
//     return () => clearTimeout(timer);
//   }, []);
// 
//   const handleDismiss = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsVisible(false);
//     setTimeout(() => {
//       setIsDismissed(true);
//       sessionStorage.setItem('referral-ad-dismissed', 'true');
//     }, 450);
//   };
// 
//   const handleRedirect = (e) => {
//     e.preventDefault();
//     if (isRedirecting) return;
//     setIsRedirecting(true);
//     showToast("Connecting to our parent site's referral page...", "info");
//     setTimeout(() => {
//       window.location.href = "https://www.followproperty.org/refer";
//     }, 2000);
//   };
// 
//   if (isDismissed) return null;
// 
//   return (
//     <div className="fixed bottom-4 left-4 z-40 max-w-[340px] ...">
//        ...
//     </div>
//   );
// }
*/
