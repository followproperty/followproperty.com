"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldAlert } from "lucide-react";

export default function CompareView({ initialProjects }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);

  // Currency formatting helper (Crores / Lakhs)
  const formatCurrency = (val) => {
    if (!val) return "";
    const parsed = Number(val);
    if (isNaN(parsed)) return val;

    if (parsed >= 10000000) {
      const formatted = (parsed / 10000000).toFixed(2);
      return `₹${formatted.endsWith(".00") ? parseFloat(formatted) : formatted} Cr`;
    }
    if (parsed >= 100000) {
      const formatted = (parsed / 100000).toFixed(2);
      return `₹${formatted.endsWith(".00") ? parseFloat(formatted) : formatted} L`;
    }
    return `₹${parsed.toLocaleString("en-IN")}`;
  };

  // Price range helper using en-dash
  const formatPriceRange = (min, max) => {
    if (!min) return "Price on Request";
    const minFormatted = formatCurrency(min);
    if (!max || max === min) return minFormatted;
    return `${minFormatted} – ${formatCurrency(max)}`;
  };

  // Area range helper
  const formatAreaRange = (min, max, superArea, avgArea) => {
    const rawArea = superArea || avgArea;
    if (rawArea && typeof rawArea === "string" && (rawArea.includes("-") || rawArea.toLowerCase().includes("to"))) {
      let clean = rawArea.trim();
      if (!clean.toLowerCase().includes("sq.ft") && !clean.toLowerCase().includes("sq. ft")) {
        clean = `${clean} sq.ft`;
      }
      return clean;
    }
    if (min && max && min !== max) {
      return `${min.toLocaleString()} – ${max.toLocaleString()} sq.ft`;
    }
    const val = min || max || rawArea;
    if (!val) return null;
    return isNaN(Number(val)) ? val : `${Number(val).toLocaleString()} sq.ft`;
  };

  // Structured specification rows list
  const fields = [
    { label: "Builder", key: "builderName", value: (p) => p.builderName || "" },
    { label: "City", key: "city", value: (p) => p.city || "" },
    { label: "Locality", key: "locality", value: (p) => p.locality || "" },
    { label: "Property Type", key: "propertyType", value: (p) => p.propertyType || "Residential" },
    {
      label: "Status",
      key: "status",
      value: (p) =>
        p.status === "Ready to Move" || p.status === "Ready"
          ? "Ready to Move"
          : (p.status || "Under Construction"),
    },
    { label: "BHK Configuration", key: "bhk", value: (p) => (p.bhk && p.bhk.length > 0 ? `${p.bhk.join(", ")} BHK` : "") },
    { label: "Price Range", key: "priceRange", value: (p) => formatPriceRange(p.minPrice, p.maxPrice) },
    {
      label: "Area Range",
      key: "areaRange",
      value: (p) => formatAreaRange(p.minArea, p.maxArea, p.superArea, p.avgAreaSqft) || "",
    },
    {
      label: "Possession Timeline",
      key: "possessionDate",
      value: (p) => p.possessionDate || (p.possessionYear ? (p.possessionYear === 0 ? "Ready to Move" : `Dec ${p.possessionYear}`) : ""),
    },
    { label: "Towers", key: "towers", value: (p) => p.towers || "" },
    { label: "Total Units", key: "units", value: (p) => (p.units ? `${p.units} Units` : "") },
    { label: "Total Project Area", key: "totalArea", value: (p) => p.totalArea || "" },
    {
      label: "Per Sq Ft Rate",
      key: "perSqftRate",
      value: (p) => (p.perSqftRate ? `₹${Number(p.perSqftRate).toLocaleString("en-IN")}/sq.ft` : ""),
    },
    { label: "Rental Yield Range", key: "monthlyRentRange", value: (p) => p.monthlyRentRange || "" },
  ];

  // Sync projects state to prop updates
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // Remove rows where EVERY compared project holds empty values
  const filteredFields = fields.filter((f) => {
    return projects.some((p) => {
      const val = f.value(p);
      return val !== null && val !== undefined && val !== "" && val !== "Price on Request";
    });
  });

  // Check if a row has divergent values among projects
  const isRowDiffering = (field) => {
    if (projects.length < 2) return false;
    const firstVal = field.value(projects[0]).toString().toLowerCase().trim();
    return projects.some((p) => field.value(p).toString().toLowerCase().trim() !== firstVal);
  };

  const handleRemove = (projectId) => {
    const updatedProjects = projects.filter((p) => p._id !== projectId);
    setProjects(updatedProjects);

    // Sync removal into localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("compare_projects") || "[]");
      const updatedStored = stored.filter((item) => item.id !== projectId);
      localStorage.setItem("compare_projects", JSON.stringify(updatedStored));
      window.dispatchEvent(new Event("compare-updated"));
    } catch (err) {
      console.error("Failed to update comparison storage:", err);
    }

    // Refresh route URL with remaining parameters
    const nextIds = updatedProjects.map((p) => p._id).join(",");
    router.replace(nextIds ? `/compare?ids=${nextIds}` : "/compare", { scroll: false });
  };

  // If projects are removed below the minimum threshold (2)
  if (projects.length < 2) {
    return (
      <div className="bg-brand-bgCard p-8 sm:p-12 rounded-3xl border border-brand-border shadow-brand text-center max-w-md mx-auto my-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-brand-amberBg text-brand-amber rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy m-0 mb-3 tracking-tight">
          Select at least 2 projects
        </h3>
        <p className="text-sm text-brand-slate font-semibold leading-relaxed m-0 mb-6 max-w-[280px] mx-auto">
          Comparison requires at least 2 projects. Add more projects from the details views to compare side-by-side.
        </p>
        <button
          onClick={() => router.push("/watchlist")}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-extrabold shadow-brand hover:opacity-90 active:scale-95 border-0 cursor-pointer w-full transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-200">
      
      {/* Title & Info Banner */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight leading-tight m-0 mb-1.5">
          Project Comparison
        </h2>
        <p className="text-xs sm:text-sm text-brand-slate font-bold m-0 leading-relaxed">
          Compare key buying features, inventory specs, and average pricing matrices.
        </p>
      </div>

      {/* TOP SUMMARY REMOVAL ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {projects.map((p) => (
          <div
            key={p._id}
            className="bg-brand-bgCard p-4 rounded-2xl border border-brand-border shadow-brand flex items-center justify-between gap-3 relative"
          >
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-brand-navy truncate m-0">
                {p.projectName}
              </h3>
              <p className="text-[10px] text-brand-slate m-0 mt-0.5 font-bold uppercase tracking-wider">
                By {p.builderName || "Unknown Builder"}
              </p>
            </div>
            <button
              onClick={() => handleRemove(p._id)}
              className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100 bg-transparent flex-shrink-0"
              title={`Remove ${p.projectName}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE LAYOUT (hidden on sm devices) */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-brand-border bg-brand-bgCard shadow-brand mb-6">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-brand-bgAlt/50">
              <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-wider text-brand-slateLight border-b border-brand-border min-w-[200px]">
                Specifications
              </th>
              {projects.map((p) => (
                <th
                  key={p._id}
                  className="px-6 py-5 border-b border-brand-border min-w-[240px] vertical-top"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-extrabold text-brand-navy truncate block max-w-[220px]" title={p.projectName}>
                      {p.projectName}
                    </span>
                    <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">
                      By {p.builderName || "Unknown Builder"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFields.map((f) => {
              const differs = isRowDiffering(f);
              return (
                <tr
                  key={f.key}
                  className={`hover:bg-brand-bgAlt/40 transition-colors border-l-2 ${
                    differs
                      ? "bg-brand-amber/5 border-l-brand-amber"
                      : "border-l-transparent"
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-brand-slateLight border-b border-brand-border bg-brand-bgAlt/30 flex items-center gap-1.5 select-none">
                    {differs && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-brand-amber"
                        title="Divergent values"
                      />
                    )}
                    {f.label}
                  </td>
                  {projects.map((p) => (
                    <td
                      key={p._id}
                      className="px-6 py-4 text-sm font-extrabold text-brand-navy border-b border-brand-border"
                    >
                      {f.value(p) || <span className="text-brand-slateLight font-medium">—</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE STACKED BLOCK-GROUPED LAYOUT (hidden on md and larger devices) */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredFields.map((f) => {
          const differs = isRowDiffering(f);
          return (
            <div
              key={f.key}
              className={`p-4 rounded-2xl border transition-all shadow-sm ${
                differs
                  ? "bg-brand-amber/5 border-brand-amber/30"
                  : "bg-brand-bgCard border-brand-border"
              }`}
            >
              {/* Field Label Header */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-brand-border/60">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-slateLight flex items-center gap-1.5">
                  {differs && <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />}
                  {f.label}
                </span>
                {differs && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-brand-amberBg text-brand-amber border border-brand-amber/20 select-none">
                    Differs
                  </span>
                )}
              </div>

              {/* Stacked Values */}
              <div className="mt-3 flex flex-col gap-3">
                {projects.map((p) => (
                  <div key={p._id} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-brand-slate uppercase tracking-wide">
                      {p.projectName}
                    </span>
                    <span className="text-sm font-extrabold text-brand-navy leading-normal">
                      {f.value(p) || <span className="text-brand-slateLight font-medium">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
