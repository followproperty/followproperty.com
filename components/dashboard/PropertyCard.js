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
    <div className="card-frame flex flex-col cursor-pointer group">
      {/* Property Name Header (Premium dark background) */}
      <div className="card-header-gradient">
        {/* Subtle decorative radial light highlight */}
        <div className="card-header-glow" />

        <span className="text-[16px] sm:text-[17px] font-extrabold text-white tracking-tight leading-snug max-w-[210px] relative z-10 transition-colors group-hover:text-brand-blue-light">
          {property.title}
        </span>
        
        <div className={`absolute top-3 left-3 z-10 ${
          isReady 
            ? "badge-emerald" 
            : "badge-amber"
        }`}>
          {property.status}
        </div>
        
        <div className="badge-translucent absolute top-3 right-3 z-10">
          {property.specificType}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <p className="text-xs text-brand-navy font-bold flex items-center gap-1.5 mb-0">
            <MapPin size={13} className="text-brand-slate" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-brand-border">
          <div className="flex items-center gap-1.5 text-xs text-brand-slate">
            <Building size={13} className="text-brand-slate-light" />
            <span className="truncate">
              By{" "}
              {property.builder ? (
                <Link
                  href={`/builders/${property.builder.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="font-bold text-brand-navy-mid hover:text-brand-blue hover:underline no-underline"
                >
                  {property.builder}
                </Link>
              ) : (
                "Unknown"
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-slate">
            <Calendar size={13} className="text-brand-slate-light" />
            <span className="truncate">Possession: {property.possessionYear}</span>
          </div>
          {property.superArea > 0 && (
            <div className="col-span-2 flex items-center gap-1.5 text-xs text-brand-slate">
              <Maximize2 size={13} className="text-brand-slate-light" />
              <span>{property.superArea.toLocaleString()} sq.ft</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          {(property.marketPrice || property.minPrice > 0) ? (
            <div>
              <p className="text-[10px] text-brand-slate-light font-bold uppercase tracking-wider mb-0.5">Price Range</p>
              <p className="text-[15px] sm:text-[16px] font-black text-brand-navy-deep tracking-tight mb-0">
                {property.marketPrice || formatPriceRange(property.minPrice, property.maxPrice)}
              </p>
            </div>
          ) : (
            <div />
          )}
          <Link
            href={`/projects/${property.id}${watchlistId ? `?watchlistId=${watchlistId}` : ""}`}
            className="btn-secondary px-4 py-2 text-[11px] whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
