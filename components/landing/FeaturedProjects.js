"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Building, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "../dashboard/PropertyCard";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

function PropertyCardSkeleton() {
  return (
    <div className="card-frame flex flex-col animate-pulse">
      {/* Header Skeleton */}
      <div className="relative h-44 sm:h-48 w-full bg-linear-to-br from-brand-navy/60 to-brand-navy-mid/60 flex items-end p-4 border-b border-brand-border">
        <div className="h-4 bg-white/20 rounded-md w-3/4 animate-pulse" />
      </div>
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1">
        <div className="h-3.5 bg-brand-slate/15 rounded-md w-1/2 mb-3.5 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 mb-5 py-4 border-y border-brand-border">
          <div className="h-3.5 bg-brand-slate/15 rounded-md w-3/4 animate-pulse" />
          <div className="h-3.5 bg-brand-slate/15 rounded-md w-3/4 animate-pulse" />
          <div className="col-span-2 h-3.5 bg-brand-slate/15 rounded-md w-1/2 animate-pulse" />
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="h-2.5 bg-brand-slate/15 rounded-md w-12 mb-1.5 animate-pulse" />
            <div className="h-4 bg-brand-slate/15 rounded-md w-24 animate-pulse" />
          </div>
          <div className="h-8.5 bg-brand-slate/15 rounded-lg w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  // Handle responsive breakpoints for visible card count
  useEffect(() => {
    function updateVisibleCount() {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 960) {
        setVisibleCount(2);
      } else if (width < 1350) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    }
    
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Fetch projects from the API
  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        const res = await fetch("/api/projects/featured");
        if (!res.ok) {
          throw new Error("Failed to fetch featured projects");
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProjects(data.data);
        } else {
          throw new Error("Invalid format returned from API");
        }
      } catch (err) {
        console.error("Error loading featured projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProjects();
  }, []);

  // Auto-play interval: rotate projects every 8 seconds
  useEffect(() => {
    if (projects.length <= visibleCount) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = projects.length - visibleCount;
        if (prevIndex >= maxIndex) {
          return 0; // Wrap around to the beginning
        }
        return prevIndex + 1;
      });
    }, 4000); // Optimized rotation speed (4 seconds)

    return () => clearInterval(timer);
  }, [projects.length, visibleCount, currentIndex]);

  const maxIndex = Math.max(0, projects.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const cardWidthPercent = 100 / visibleCount;

  return (
    <motion.section
      ref={containerRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-[88px] bg-brand-bg relative overflow-hidden border-t border-brand-border"
    >
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(50,95,236,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-[52px] gap-6">
          <motion.div variants={fadeUp} custom={0} className="text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full border border-brand-border bg-brand-bg-card mb-3.5 shadow-brand">
              <Sparkles size={12} className="text-brand-blue animate-pulse" />
              <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
                Still exploring opportunities?
              </span>
            </div>
            <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-brand-navy tracking-tight mb-3">
              Verified Featured Projects
            </h2>
            <p className="text-[15px] sm:text-[16px] text-brand-slate leading-relaxed mb-0 font-medium">
              Browse curated residential and commercial developments currently monitored on our dashboard.
            </p>
          </motion.div>

          {/* Carousel Arrow Controls */}
          {!loading && projects.length > visibleCount && (
            <motion.div variants={fadeUp} custom={0.5} className="flex gap-2.5">
              <button
                onClick={handlePrev}
                className="w-11 h-11 rounded-xl bg-brand-bg-card border border-brand-border text-brand-navy flex items-center justify-center cursor-pointer shadow-brand transition-all hover:bg-brand-bg-alt hover:border-brand-blue-border hover:text-brand-blue"
                aria-label="Previous Project"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="w-11 h-11 rounded-xl bg-brand-bg-card border border-brand-border text-brand-navy flex items-center justify-center cursor-pointer shadow-brand transition-all hover:bg-brand-bg-alt hover:border-brand-blue-border hover:text-brand-blue"
                aria-label="Next Project"
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Listings Slider Track */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: visibleCount }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : error || projects.length === 0 ? (
          <div className="bg-brand-bg-card rounded-3xl border border-brand-border p-12 text-center shadow-brand max-w-[600px] mx-auto">
            <Building className="mx-auto text-brand-slate-light mb-4" size={48} />
            <h3 className="text-base font-extrabold text-brand-navy mb-1">No Projects Available</h3>
            <p className="text-xs text-brand-slate mb-0">
              We couldn't load featured projects at this time. Please browse our complete directory.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden mx-[-12px] px-[12px] py-6">
            <motion.div
              className={`flex ${projects.length < visibleCount ? "justify-center" : ""}`}
              animate={{ x: `-${currentIndex * cardWidthPercent}%` }}
              transition={{
                type: "spring",
                stiffness: 140,
                damping: 20,
                mass: 0.8
              }}
            >
              {projects.map((project, idx) => {
                const isVisible = idx >= currentIndex && idx < currentIndex + visibleCount;
                return (
                  <motion.div
                    key={project.id}
                    style={{
                      width: `${cardWidthPercent}%`,
                      padding: "0 12px",
                      flexShrink: 0,
                    }}
                    className="flex flex-col"
                    animate={{
                      scale: isVisible ? 1 : 0.94,
                      opacity: isVisible ? 1 : 0.3,
                      y: isVisible ? 0 : 12,
                    }}
                    whileHover={isVisible ? {
                      y: -8,
                      scale: 1.02,
                      boxShadow: "0 20px 32px rgba(50, 95, 236, 0.08)",
                    } : {}}
                    transition={{
                      type: "spring",
                      stiffness: 160,
                      damping: 18,
                      mass: 0.8
                    }}
                  >
                    <PropertyCard property={project} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* Carousel Pagination Dots */}
        {!loading && projects.length > visibleCount && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-6 bg-brand-blue"
                    : "w-2 bg-brand-slate-light/30 hover:bg-brand-slate-light/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Centered CTA Button */}
        <motion.div variants={fadeUp} custom={1.2} className="mt-14 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2.5 bg-linear-to-r from-brand-navy-deep to-brand-navy-mid text-white font-bold text-[14px] sm:text-[15px] py-3.5 px-7 rounded-[14px] border border-white/5 cursor-pointer shadow-brand-md transition-all duration-250 hover:-translate-y-0.5 hover:border-brand-blue-border hover:shadow-[0_12px_36px_rgba(50,95,236,0.14)] no-underline"
          >
            View All Projects <ArrowRight size={15} />
          </Link>
        </motion.div>

      </div>
    </motion.section>
  );
}
