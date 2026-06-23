"use client";

import React, { useState, useEffect } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ShareButton({ projectName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const shareText = `Check out this project: ${projectName} on FollowProperty`;

  const handleShareClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if native share is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: projectName,
          text: shareText,
          url: shareUrl,
        });
        showToast("Project shared successfully!", "success", "Share");
      } catch (err) {
        // If the user cancelled, we do not want to show an error, but if it failed due to other reasons, log it
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
          // Fall back to custom modal if native sharing failed for some reason
          setIsOpen(true);
        }
      }
    } else {
      // Fall back to custom modal
      setIsOpen(true);
    }
  };

  const copyToClipboard = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("Link copied to clipboard!", "success", "Share");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      showToast("Failed to copy link.", "error", "Share");
    }
  };

  // Social media share links
  const socialShares = [
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.486.002 9.95-4.46 9.953-9.952.002-2.661-1.032-5.163-2.909-7.042C16.538 1.734 14.04 .7 11.993.7c-5.49 0-9.956 4.465-9.96 9.96-.001 1.636.433 3.23 1.258 4.646l-.993 3.633 3.76-.985zm11.23-5.321c-.329-.165-1.948-.963-2.248-1.073-.3-.109-.519-.165-.738.165-.219.329-.848 1.073-1.039 1.293-.19.22-.382.247-.711.082-1.393-.698-2.435-1.22-3.398-2.871-.252-.43-.028-.663.19-.881.197-.197.43-.503.646-.755.218-.252.29-.422.433-.703.144-.282.072-.527-.036-.749-.108-.22-.848-2.046-1.162-2.802-.305-.736-.615-.636-.848-.647-.219-.01-.47-.012-.722-.012-.252 0-.663.094-.101.761.562.736 1.705 2.217 1.705 4.398 0 2.181-1.58 4.218-1.8 4.514-.22.296-3.11 4.747-7.534 6.656-.677.292-1.205.466-1.618.597 1.058 1.011 2.02.946 2.78.833.847-.125 2.607-1.065 2.977-2.094.37-1.03.37-1.914.26-2.094-.11-.18-.409-.29-.738-.456z"/>
        </svg>
      ),
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
    {
      name: "Telegram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.15L7.69 13.56l-4.1-1.28c-.9-.28-.9-.9.18-1.32L19.8 4.3c.75-.28 1.4.17 1.15 1.4l-2.72 12.81c-.19.97-.77 1.21-1.58.75l-4.13-3.04-2 1.93c-.22.21-.4.39-.82.39z"/>
        </svg>
      ),
      color: "bg-sky-500 hover:bg-sky-600 text-white",
      link: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "X / Twitter",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: "bg-neutral-900 hover:bg-neutral-950 text-white",
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: "bg-sky-700 hover:bg-sky-800 text-white",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <>
      <button
        onClick={handleShareClick}
        className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-black/40 backdrop-blur-xs text-white border border-white/20 hover:bg-black/60 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm select-none"
      >
        <Share2 size={11} strokeWidth={2.5} />
        <span>Share</span>
      </button>

      {/* Fallback Sharing Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-800/40 shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0">
                  Share Project
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0 font-medium truncate max-w-[280px]">
                  {projectName}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Social Sharing Grid */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {socialShares.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 group decoration-none"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 active:scale-95 shadow-md ${platform.color}`}
                  >
                    {platform.icon}
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                    {platform.name}
                  </span>
                </a>
              ))}
            </div>

            {/* Direct Copy Section */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">
                Or Copy Link
              </span>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => e.target.select()}
                  className="flex-1 bg-transparent border-none text-xs text-slate-600 dark:text-slate-300 px-2 font-mono font-medium outline-none truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-none cursor-pointer shadow-xs ${
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-brand-blue hover:bg-brand-blue/90 text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={13} strokeWidth={3} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} strokeWidth={2.5} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
