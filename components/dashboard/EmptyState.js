"use client";

import React from "react";
import { SearchX } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 bg-brand-bg-card rounded-2xl border border-dashed border-brand-border-mid text-center mt-5">
      <div className="w-16 h-16 rounded-2xl bg-brand-bg-alt flex items-center justify-center mb-4">
        <SearchX size={32} className="text-brand-slate" />
      </div>
      <h3 className="text-lg font-bold text-brand-navy mb-2 max-w-[500px] leading-snug">
        No matches found.
      </h3>
      <p className="text-xs sm:text-sm text-brand-slate max-w-[460px] leading-relaxed mb-0">
        We will let you know as soon as a suitable match becomes available.
      </p>
    </div>
  );
}
