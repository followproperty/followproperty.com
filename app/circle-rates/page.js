"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Dynamically import the Leaflet Map component with SSR disabled
const CircleRatesMap = dynamic(
  () => import("@/components/map/CircleRatesMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-brand-bg-card rounded-2xl border border-brand-border text-brand-slate">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mb-2"></div>
        <span className="text-sm font-semibold">Initializing map engine...</span>
      </div>
    )
  }
);

export default function CircleRatesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto pb-12">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight">
              Government Circle Rates
            </h1>
            <p className="text-sm text-brand-slate">
              Loading map view...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight">
            Government Circle Rates
          </h1>
          <p className="text-sm text-brand-slate m-0">
            Interactive land valuation intelligence. Drill down on the map to explore circle rates across states, districts, and sectors.
          </p>
        </div>

        {/* Map Container */}
        <CircleRatesMap />
      </div>
    </DashboardLayout>
  );
}
