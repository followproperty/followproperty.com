"use client";

import React, { useState } from "react";
import PropertyGrid from "@/components/dashboard/PropertyGrid";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export default function ExpandableProjectSection({
  title,
  initialProjects = [],
  totalCount = 0,
  type = "market",
  currentFilters = {},
}) {
  const filtersKey = `${currentFilters.city || ""}-${currentFilters.builder || ""}-${currentFilters.propertyType || ""}-${currentFilters.status || ""}`;

  const [projects, setProjects] = useState(initialProjects);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [prevInitialProjects, setPrevInitialProjects] = useState(initialProjects);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);

  if (initialProjects !== prevInitialProjects || filtersKey !== prevFiltersKey) {
    setProjects(initialProjects);
    setIsExpanded(false);
    setError(null);
    setPrevInitialProjects(initialProjects);
    setPrevFiltersKey(filtersKey);
  }

  const handleToggle = async () => {
    if (projects.length >= totalCount) {
      // Collapse back to initial 3 projects
      setProjects(initialProjects);
      setIsExpanded(false);
      return;
    }

    // Fetch next batch of 9 projects from API
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("type", type);
      if (currentFilters.city) queryParams.set("city", currentFilters.city);
      if (currentFilters.builder) queryParams.set("builder", currentFilters.builder);
      if (currentFilters.propertyType) queryParams.set("propertyType", currentFilters.propertyType);
      if (currentFilters.status) queryParams.set("status", currentFilters.status);

      // Request pagination parameters
      queryParams.set("skip", projects.length.toString());
      queryParams.set("limit", "9");

      const res = await fetch(`/api/projects/list?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      const result = await res.json();
      if (result.success && result.data) {
        const nextBatch = result.data;
        const updatedProjects = [...projects, ...nextBatch];
        setProjects(updatedProjects);
        if (updatedProjects.length >= totalCount) {
          setIsExpanded(true);
        }
      } else {
        throw new Error(result.error || "Failed to load projects");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load more projects. Please try again.");
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
                Show More ({totalCount - projects.length} more) <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
