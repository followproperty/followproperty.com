import React from "react";
import Link from "next/link";
import { MapPin, TrendingUp, TrendingDown } from "lucide-react";
import { calculateValuation } from "@/utils/calculations/valuation";

export default function PortfolioCard({ property }) {
  const formatCurrency = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString()}`;
  };

  const {
    price,
    currentMarketValue,
    gain,
    gainPct,
    image
  } = calculateValuation({
    totalPricePaid: property.totalPricePaid,
    superArea: property.superArea,
    projectType: property.projectType
  });

  return (
    <div className="text-inherit flex w-full">
      <div className="card-frame w-full flex flex-col group">
        {/* Project Name Header (Premium dark background) */}
        <div className="card-header-gradient">
          {/* Subtle decorative radial light highlight */}
          <div className="card-header-glow" />

          <span className="text-[17px] font-extrabold text-white tracking-tight leading-snug max-w-[200px] relative z-10 transition-colors group-hover:text-brand-blue-light">
            {property.projectName || "Unnamed Property"}
          </span>
          <div className="badge-translucent absolute top-3 left-3 z-10">
            {property.currentUse || "Portfolio"}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <h3 className="text-[17px] font-extrabold text-brand-navy-deep mb-1 tracking-tight transition-colors group-hover:text-brand-blue">
              {property.projectName || "Unnamed Property"}
            </h3>
            <p className="text-xs text-brand-slate flex items-center gap-1.5">
              <MapPin size={13} className="text-brand-slate-light" />
              {property.locality}, {property.city}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-brand-border">
            <div>
              <p className="text-[10px] text-brand-slate-light font-bold uppercase tracking-wider mb-0.5">Purchase</p>
              <p className="text-[15px] font-black text-brand-navy-deep tracking-tight">{formatCurrency(price)}</p>
            </div>
            <div>
              <p className="text-[10px] text-brand-slate-light font-bold uppercase tracking-wider mb-0.5">Demo Valuation</p>
              <p className="text-[15px] font-black text-brand-navy-deep tracking-tight">{formatCurrency(currentMarketValue)}</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className={`flex items-center gap-1.5 font-bold text-xs ${
              gain >= 0 ? "text-brand-emerald" : "text-brand-red"
            }`}>
              {gain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {gain >= 0 ? "+" : ""}{gainPct}%
            </div>
            <button 
              disabled 
              className="bg-brand-bg-alt text-brand-slate-light border border-brand-border-mid px-3.5 py-1.5 text-[11px] font-bold rounded-[10px] whitespace-nowrap cursor-not-allowed opacity-75"
            >
              Report Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
