"use client";

import React, { useState, useEffect, useRef } from "react";

export default function ProjectTabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const handleScroll = (id) => {
    isScrollingRef.current = true;
    setActiveTab(id);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // Top header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }

    // Release scrollspy lock after smooth scroll completes
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  useEffect(() => {
    const handleScrollSpy = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + 130;
      
      for (const tab of tabs) {
        const element = document.getElementById(tab.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(tab.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy);
    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [tabs]);

  return (
    <div className="sticky top-0 bg-brand-bg/90 backdrop-blur-md z-30 border-b border-brand-border-mid mb-6 -mx-2 px-2 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-1.5 overflow-x-auto py-3.5 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleScroll(tab.id)}
            className={`px-4.5 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap border ${
              activeTab === tab.id
                ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                : "bg-white text-brand-slate border-brand-border hover:text-brand-navy hover:bg-brand-bg-alt"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
