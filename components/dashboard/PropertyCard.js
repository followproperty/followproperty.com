import React from "react";
import Link from "next/link";
import { MapPin, Building, Calendar, Maximize2 } from "lucide-react";

export default function PropertyCard({ property, watchlistId }) {
  const formatCurrency = (num) => {
    if (num >= 10000000) {
      const val = (num / 10000000).toFixed(2);
      return `₹${val.endsWith(".00") ? parseFloat(val) : val} Cr`;
    }
    if (num >= 100000) {
      const val = (num / 100000).toFixed(2);
      return `₹${val.endsWith(".00") ? parseFloat(val) : val} L`;
    }
    return `₹${num.toLocaleString()}`;
  };

  const formatPriceRange = (min, max) => {
    if (!min) return "Any Price";
    const formattedMin = formatCurrency(min);
    if (!max || max === min) return formattedMin;
    return `${formattedMin} – ${formatCurrency(max)}`;
  };

  const isReady = property.status === "Ready to Move";

  return (
    <div className="bg-brand-bgCard rounded-2xl border border-brand-border overflow-hidden shadow-brand flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-brand-md cursor-pointer">
      {/* Property Name Header (Replaces raw Image) */}
      <div className="relative h-[130px] w-full bg-gradient-to-br from-brand-navy to-brand-navyMid flex items-center justify-center p-5 text-center">
        <span className="text-[17px] font-bold text-white tracking-tight leading-snug max-w-[200px]">
          {property.title}
        </span>
        <div className={`absolute top-3 left-3 text-white px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.15)] ${
          isReady ? "bg-brand-emerald" : "bg-brand-amber"
        }`}>
          {property.status}
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-[4px] text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
          {property.specificType}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <p className="text-xs text-brand-navy font-extrabold flex items-center gap-1 mb-0">
            <MapPin size={14} className="text-brand-teal" />
            {property.locality}, {property.city}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-brand-border">
          <div className="flex items-center gap-1.5 text-xs text-brand-navyMid">
            <Building size={14} className="text-brand-slate" />
            <span>By {property.builder}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-navyMid">
            <Calendar size={14} className="text-brand-slate" />
            <span>Possession: {property.possessionYear}</span>
          </div>
          {property.superArea > 0 && (
            <div className="col-span-2 flex items-center gap-1.5 text-xs text-brand-navyMid">
              <Maximize2 size={14} className="text-brand-slate" />
              <span>{property.superArea} sq.ft</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-[11px] text-brand-slate font-semibold uppercase mb-0.5">Price Range</p>
            <p className="text-[15px] sm:text-[16px] font-extrabold text-brand-tealDark tracking-tight mb-0">
              {formatPriceRange(property.minPrice, property.maxPrice)}
            </p>
          </div>
          <Link
            href={`/projects/${property.id}${watchlistId ? `?watchlistId=${watchlistId}` : ""}`}
            className="px-4 py-2.5 rounded-lg bg-brand-tealBg text-brand-tealDark border border-brand-tealBorder text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-brand-teal hover:text-white text-center no-underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
