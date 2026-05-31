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
    <Link href={`/property/${property.id}`} className="no-underline text-inherit flex w-full">
      <div className="w-full bg-brand-bgCard rounded-2xl border border-brand-border overflow-hidden shadow-brand flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-brand-md cursor-pointer">
        {/* Project Name Header (Replaces raw Image) */}
        <div className="relative h-[130px] w-full bg-gradient-to-br from-brand-navy to-brand-navyMid flex items-center justify-center p-5 text-center">
          <span className="text-[17px] font-bold text-white tracking-tight leading-snug max-w-[200px]">
            {property.projectName || "Unnamed Property"}
          </span>
          <div className="absolute top-3 left-3 bg-white text-brand-navy px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            {property.currentUse || "Portfolio"}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <h3 className="text-[18px] font-bold text-brand-navy mb-1 tracking-tight">
              {property.projectName || "Unnamed Property"}
            </h3>
            <p className="text-xs text-brand-slate flex items-center gap-1">
              <MapPin size={14} />
              {property.locality}, {property.city}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5 py-4 border-y border-brand-border">
            <div>
              <p className="text-[11px] text-brand-slate mb-1">Purchase</p>
              <p className="text-[15px] font-bold text-brand-navy">{formatCurrency(price)}</p>
            </div>
            <div>
              <p className="text-[11px] text-brand-slate mb-1">Demo Valuation</p>
              <p className="text-[15px] font-bold text-brand-navy">{formatCurrency(currentMarketValue)}</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className={`flex items-center gap-1 font-bold text-sm ${
              gain >= 0 ? "text-brand-emerald" : "text-brand-red"
            }`}>
              {gain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {gain >= 0 ? "+" : ""}{gainPct}%
            </div>
            <span className="bg-transparent text-brand-navy border-none text-xs font-bold cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity">
              View Details ↗
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
