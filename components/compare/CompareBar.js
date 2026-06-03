"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

export default function CompareBar() {
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    const syncList = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("compare_projects") || "[]");
        setCompareList(stored);
      } catch (err) {
        console.error("Failed to parse compare list:", err);
      }
    };

    // Load initial list and subscribe to updates
    syncList();
    window.addEventListener("compare-updated", syncList);
    window.addEventListener("storage", syncList);

    return () => {
      window.removeEventListener("compare-updated", syncList);
      window.removeEventListener("storage", syncList);
    };
  }, []);

  if (compareList.length < 2) {
    return null;
  }

  const handleClear = () => {
    localStorage.removeItem("compare_projects");
    window.dispatchEvent(new Event("compare-updated"));
  };

  const compareIds = compareList.map((p) => p.id).join(",");

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto sm:min-w-[480px] bg-brand-navy/95 backdrop-blur-md text-white border border-white/10 shadow-2xl rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Selection Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-extrabold text-white m-0 flex items-center gap-1.5">
          Compare Projects <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-teal text-white font-extrabold">{compareList.length}/3 Selected</span>
        </h4>
        <p className="text-[10px] sm:text-xs text-brand-slateLight truncate m-0 mt-0.5 font-medium">
          {compareList.map((p) => p.name).join(" • ")}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <Link
          href={`/compare?ids=${compareIds}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-teal text-white rounded-xl text-[11px] font-extrabold shadow-brand hover:opacity-90 active:scale-95 no-underline transition-all"
        >
          Compare Now <ArrowRight size={13} />
        </Link>
        <button
          onClick={handleClear}
          title="Clear selections"
          className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
