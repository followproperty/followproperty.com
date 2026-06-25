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

  const imageUrl = (property.images && property.images.length > 0) 
    ? property.images[0] 
    : property.image;

  return (
    <div className="card-frame flex flex-col h-full cursor-pointer group">
      {/* Property Name Header (Visual Image / Fallback Gradient) */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden flex items-end p-4 border-b border-brand-border">
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={property.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent z-1 pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-brand-navy-deep via-brand-navy to-brand-navy-mid">
            {/* Subtle decorative radial light highlight */}
            <div className="card-header-glow" />
          </div>
        )}

        <span className="text-[16px] sm:text-[17px] font-extrabold text-white tracking-tight leading-snug max-w-[210px] relative z-10 transition-colors group-hover:text-brand-blue-light drop-shadow-sm">
          {property.title}
        </span>
        
        {/* Badges container to prevent overlapping text */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between gap-2 items-start pointer-events-none">
          <div className={`${
            isReady 
              ? "badge-emerald" 
              : "badge-amber"
          } shrink-0 pointer-events-auto`}>
            {property.status}
          </div>
          
          <div className="badge-translucent pointer-events-auto text-right truncate max-w-[65%]" title={property.specificType}>
            {property.specificType}
          </div>
        </div>
      </div>

      {/* Content (Slightly more compact white area) */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <p className="text-xs text-brand-navy font-bold flex items-center gap-1.5 mb-0">
            <MapPin size={13} className="text-brand-slate" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4 py-2.5 border-y border-brand-border">
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

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {(property.marketPrice || property.minPrice > 0) ? (
            <div>
              <p className="text-[10px] text-brand-slate-light font-bold uppercase tracking-wider mb-0.5">Price Range</p>
              <p className="text-[14px] sm:text-[15px] font-black text-brand-navy-deep tracking-tight mb-0">
                {property.marketPrice || formatPriceRange(property.minPrice, property.maxPrice)}
              </p>
            </div>
          ) : (
            <div />
          )}
          <Link
            href={
              (property.builderSlug && property.projectSlug)
                ? `/builder/${property.builderSlug}/projects/${property.projectSlug}${watchlistId ? `?watchlistId=${watchlistId}` : ""}`
                : `/projects/${property.id}${watchlistId ? `?watchlistId=${watchlistId}` : ""}`
            }
            className="btn-secondary px-3.5 py-1.5 text-[11px] whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
