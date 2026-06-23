"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Building2, X } from "lucide-react";

export default function ProjectGallery({ projectName, images = [], children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasImages = images && images.length > 0;

  // Keypress event listener for lightbox controls
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, images]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = () => {
    setLightboxIndex(currentIndex);
    setIsLightboxOpen(true);
  };

  const handleLightboxPrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleLightboxNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Display Image / Placeholder */}
      <div className="relative rounded-3xl overflow-hidden border border-brand-border bg-brand-bg-card shadow-brand transition-all duration-300">
        <div 
          className={`relative h-[350px] sm:h-[400px] w-full overflow-hidden ${hasImages ? "cursor-zoom-in" : ""}`}
          onClick={() => hasImages && openLightbox()}
        >
          {hasImages ? (
            <>
              <img 
                src={images[currentIndex]} 
                alt={`${projectName} - Visual ${currentIndex + 1}`} 
                className="w-full h-full object-cover transition-all duration-500 ease-in-out hover:scale-102"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

              {/* Slider Arrows (Only if there's more than 1 image) */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 active:scale-95 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-10 hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 active:scale-95 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-10 hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>
                  
                  {/* Image Counter Badge */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10 z-10 select-none">
                    {currentIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-brand-navy-deep via-brand-navy to-brand-navy-mid flex flex-col items-center justify-center text-center p-6">
              {/* Subtle mesh background grid */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none" 
                style={{ 
                  backgroundImage: "radial-gradient(var(--color-brand-border) 1.2px, transparent 1.2px)", 
                  backgroundSize: "24px 24px" 
                }} 
              />
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(50,95,236,0.18),transparent_70%)] pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[radial-gradient(circle_at_bottom_left,rgba(81,143,255,0.08),transparent_70%)] pointer-events-none" />
              
              {/* Building icon in background */}
              <Building2 size={130} className="text-white/5 absolute right-10 bottom-4 pointer-events-none" />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
              
              {/* Centered Placeholder Text */}
              <div className="relative z-10 flex flex-col items-center gap-2 text-white/90 max-w-xs animate-pulse">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-1 shadow-md">
                  <Building2 size={28} className="text-white/80" />
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white m-0">Images Coming Soon</h3>
                <p className="text-[11px] text-white/60 font-semibold leading-normal m-0">
                  We are currently verifying and uploading verified photos for this project.
                </p>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>

      {/* 2. Horizontal Thumbnail Strip (Only visible if there are multiple images) */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-border scrollbar-track-transparent">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 bg-brand-bg-card transition-all cursor-pointer hover:opacity-90 ${
                currentIndex === idx 
                  ? "border-brand-blue scale-95 shadow-md shadow-brand-blue/15" 
                  : "border-brand-border hover:border-brand-border-mid"
              }`}
            >
              <img 
                src={imgUrl} 
                alt={`${projectName} thumb ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
              {currentIndex !== idx && (
                <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* 3. Fullscreen Lightbox Modal Overlay */}
      {isLightboxOpen && hasImages && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
          
          {/* Top Bar with Close Button */}
          <div className="w-full flex justify-end z-50">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/10 transition-all cursor-pointer hover:scale-105"
              aria-label="Close fullscreen gallery"
            >
              <X size={22} strokeWidth={2} />
            </button>
          </div>

          {/* Main Large Visual Viewport */}
          <div className="relative flex-grow w-full flex items-center justify-center min-h-0 py-4">
            
            {/* Prev Slide Button */}
            {images.length > 1 && (
              <button
                onClick={handleLightboxPrev}
                className="absolute left-2 sm:left-6 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all z-10 hover:scale-105 border border-white/10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
            )}

            {/* Main Rendered Image wrapper for absolute watermark anchoring */}
            <div className="relative max-w-[92vw] max-h-[65vh] sm:max-h-[75vh] flex items-center justify-center pointer-events-none">
              <img
                src={images[lightboxIndex]}
                alt={`${projectName} - Fullscreen Visual ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-all duration-300 pointer-events-auto"
                onClick={(e) => e.stopPropagation()} // Prevent close on image click
              />
              
              {/* Fullscreen Watermark overlayed directly on the bottom-left of the image */}
              <div className="absolute bottom-4 left-4 z-20 pointer-events-none select-none bg-black/45 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center shadow-md">
                <img 
                  src="/logo.svg" 
                  alt="Watermark" 
                  className="h-5 sm:h-7 w-auto brightness-0 invert opacity-90" 
                />
              </div>
            </div>

            {/* Next Slide Button */}
            {images.length > 1 && (
              <button
                onClick={handleLightboxNext}
                className="absolute right-2 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all z-10 hover:scale-105 border border-white/10"
                aria-label="Next image"
              >
                <ChevronRight size={24} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Bottom Row Controls */}
          <div className="w-full flex flex-col items-center gap-3.5 pb-2 z-10">
            {/* Centered Counter */}
            <div className="text-white/80 text-xs sm:text-sm font-semibold select-none">
              {lightboxIndex + 1} of {images.length}
            </div>

            {/* Horizontal Lightbox Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 max-w-full overflow-x-auto pb-1.5 px-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative flex-shrink-0 w-14 h-10 sm:w-18 sm:h-12 rounded-lg overflow-hidden border-2 bg-zinc-900 transition-all cursor-pointer hover:opacity-90 ${
                      lightboxIndex === idx
                        ? "border-brand-blue scale-95 shadow-md shadow-brand-blue/30"
                        : "border-white/15 hover:border-white/35"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${projectName} thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {lightboxIndex !== idx && (
                      <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
