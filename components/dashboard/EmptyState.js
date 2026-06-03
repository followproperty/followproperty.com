"use client";

import React from "react";
import { SearchX } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 bg-brand-bgCard rounded-2xl border border-dashed border-brand-borderMid text-center mt-5">
      <div className="w-16 h-16 rounded-2xl bg-brand-bgAlt flex items-center justify-center mb-4">
        <SearchX size={32} className="text-brand-slate" />
      </div>
      <h3 className="text-lg font-bold text-brand-navy mb-2 max-w-[500px] leading-snug">
        No matching projects currently available for your requirements.
      </h3>
      <p className="text-xs sm:text-sm text-brand-slate max-w-[460px] leading-relaxed mb-0">
        We'll continue monitoring newly added projects and notify you when suitable opportunities become available.
      </p>
    </div>
  );
}
