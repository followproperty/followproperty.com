"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Building, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "../dashboard/PropertyCard";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function PropertyCardSkeleton() {
  return (
    <div className="bg-brand-bg-card rounded-2xl border border-brand-border overflow-hidden shadow-brand flex flex-col animate-pulse min-h-[360px]">
      <div className="h-[140px] w-full bg-linear-to-br from-brand-navy-mid/30 to-brand-navy-mid/10" />
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="h-3.5 bg-brand-slate/10 rounded-md w-2/3" />
        <div className="h-px bg-brand-border my-2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 bg-brand-slate/10 rounded-md w-3/4" />
          <div className="h-3 bg-brand-slate/10 rounded-md w-3/4" />
        </div>
        <div className="mt-auto flex justify-between items-center pt-2">
          <div className="h-5 bg-brand-slate/10 rounded-md w-24" />
          <div className="h-7 bg-brand-slate/10 rounded-md w-16" />
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
  const [visibleCount, setVisibleCount] = useState(4);

  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

  useEffect(() => {
    function updateVisibleCount() {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 960) {
        setVisibleCount(2);
      } else if (width < 1280) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    }
    
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

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

  // Carousel slide rotation
  useEffect(() => {
    if (projects.length <= visibleCount) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = projects.length - visibleCount;
        if (prevIndex >= maxIndex) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 5000);

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
      className="py-16 md:py-24 bg-brand-bg-alt relative overflow-hidden border-t border-brand-border"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(50,95,236,0.03)_0%,transparent_60%)]" />
      </div>

      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        
        {/* Header fold */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left max-w-xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-brand-border bg-brand-bg-card mb-4 shadow-xs">
              <Sparkles size={11} className="text-brand-blue" />
              <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
                Investment Discoveries
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(26px,4vw,38px)] font-black text-brand-navy-deep tracking-tight mb-4">
              Monitored Featured Projects
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-sm md:text-base text-brand-slate leading-relaxed m-0 font-medium">
              Explore structural details, possession history, and registration guides for our active real estate listings.
            </motion.p>
          </div>

          {/* Carousel Arrow Controls */}
          {!loading && projects.length > visibleCount && (
            <motion.div variants={fadeUp} custom={3} className="hidden md:flex gap-2 shrink-0">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-white border border-brand-border text-brand-navy flex items-center justify-center cursor-pointer shadow-3xs transition-all hover:bg-brand-bg-alt hover:border-brand-blue-border/30 hover:text-brand-blue"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-white border border-brand-border text-brand-navy flex items-center justify-center cursor-pointer shadow-3xs transition-all hover:bg-brand-bg-alt hover:border-brand-blue-border/30 hover:text-brand-blue"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Listings Slider Track */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: visibleCount }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : error || projects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-brand max-w-[500px] mx-auto">
            <Building className="mx-auto text-brand-slate-light mb-4" size={40} />
            <h3 className="text-base font-extrabold text-brand-navy mb-1.5">No Projects Available</h3>
            <p className="text-xs text-brand-slate m-0">
              We couldn't load featured projects at this time. Please browse our directory.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Touch-Swipe Track */}
            <div className="flex md:hidden overflow-x-auto gap-4 scrollbar-none snap-x snap-mandatory mx-[-24px] px-6 py-2">
              {projects.map((project) => (
                <div key={project.id} className="snap-center shrink-0 w-[78vw] max-w-[320px]">
                  <PropertyCard property={project} />
                </div>
              ))}
            </div>

            {/* Desktop Spring-Slide Carousel */}
            <div className="hidden md:block overflow-hidden mx-[-12px] px-[12px] py-4">
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
                        scale: isVisible ? 1 : 0.96,
                        opacity: isVisible ? 1 : 0.35,
                        y: isVisible ? 0 : 8,
                      }}
                      whileHover={isVisible ? {
                        y: -6,
                        transition: { duration: 0.22, ease: "easeOut" }
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
          </>
        )}

        {/* Carousel Pagination Dots */}
        {!loading && projects.length > visibleCount && (
          <div className="hidden md:flex justify-center gap-1.5 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-6 bg-brand-blue"
                    : "w-2 bg-brand-slate-light/25 hover:bg-brand-slate-light/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Explore All CTA Button */}
        <motion.div variants={fadeUp} custom={5} className="mt-14 text-center">
          <Link
            href="/projects"
            className="btn-primary py-3.5 px-6 text-[14px]"
          >
            Explore Projects Directory <ArrowRight size={14} className="ml-1" />
          </Link>
        </motion.div>

      </div>
    </motion.section>
  );
}
