"use client";

import React, { useState, useEffect } from "react";
import PropertyGrid from "@/components/dashboard/PropertyGrid";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export default function ExpandableProjectSection({
  title,
  initialProjects = [],
  totalCount = 0,
  type = "market",
  currentFilters = {},
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [fullProjects, setFullProjects] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If initialProjects or filters change, reset local states
  useEffect(() => {
    setProjects(initialProjects);
    setFullProjects(null);
    setIsExpanded(false);
    setError(null);
  }, [initialProjects, currentFilters]);

  const handleToggle = async () => {
    if (isExpanded) {
      // Collapse back to initial 3 projects
      setProjects(initialProjects);
      setIsExpanded(false);
      return;
    }

    if (fullProjects) {
      // Use cached full projects list
      setProjects(fullProjects);
      setIsExpanded(true);
      return;
    }

    // Fetch full list from API
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("type", type);
      if (currentFilters.city) queryParams.set("city", currentFilters.city);
      if (currentFilters.builder) queryParams.set("builder", currentFilters.builder);
      if (currentFilters.propertyType) queryParams.set("propertyType", currentFilters.propertyType);
      if (currentFilters.status) queryParams.set("status", currentFilters.status);

      const res = await fetch(`/api/projects/list?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch all projects");
      }
      const result = await res.json();
      if (result.success && result.data) {
        setFullProjects(result.data);
        setProjects(result.data);
        setIsExpanded(true);
      } else {
        throw new Error(result.error || "Failed to load projects");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load full project list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Skip rendering the section altogether if it has 0 projects matching filters
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="mb-12 border-b border-brand-border pb-8 last:border-0 last:pb-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-brand-navy tracking-tight flex items-center gap-2 m-0">
          {title}
          <span className="text-xs font-bold text-brand-slate px-2 py-0.5 bg-brand-bg-alt rounded-full">
            {totalCount}
          </span>
        </h2>
        <span className="text-xs text-brand-slate font-semibold">
          Showing {projects.length} of {totalCount}
        </span>
      </div>

      {/* Grid */}
      <PropertyGrid properties={projects} />

      {/* Error Message */}
      {error && (
        <p className="text-center text-xs font-bold text-brand-red mt-4">{error}</p>
      )}

      {/* Show More / Show Less Toggle Button */}
      {totalCount > 3 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleToggle}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-bg-card text-brand-blue-dark border border-brand-blue-border rounded-xl text-xs font-bold transition-all hover:bg-brand-blue hover:text-white hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed no-underline shadow-brand cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Fetching projects...
              </>
            ) : isExpanded ? (
              <>
                Show Less <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show More ({totalCount - 3} more) <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
