import React from "react";
import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CompareView from "./CompareView";

export default async function ComparePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const ids = resolvedSearchParams.ids || "";

  await connectToDatabase();

  const idList = ids
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length === 24); // MongoDB ObjectId length validation

  let projects = [];
  if (idList.length > 0) {
    try {
      const rawProjects = await MarketProject.find({
        _id: { $in: idList },
      }).lean();

      // Ensure stable matching in the exact sequence specified in query parameters
      projects = idList
        .map((id) => {
          const match = rawProjects.find((p) => p._id.toString() === id);
          if (match) {
            // Convert ObjectIds to strings to avoid serialization issues
            return {
              ...match,
              _id: match._id.toString(),
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (err) {
      console.error("Failed to query compared projects:", err);
    }
  }

  // Gracefully slice to a maximum of 3 projects
  if (projects.length > 3) {
    projects = projects.slice(0, 3);
  }

  // Check if minimum projects threshold is satisfied
  const hasMinProjects = projects.length >= 2;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-16 pt-4 font-sans antialiased text-brand-navy px-4 sm:px-6">
        
        {/* Navigation & Breadcrumbs */}
        <div className="mb-6">
          <Link
            href="/watchlist"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-teal hover:opacity-85 no-underline transition-opacity"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Validation Failure / Empty state */}
        {!hasMinProjects ? (
          <div className="bg-brand-bgCard p-8 sm:p-12 rounded-3xl border border-brand-border shadow-brand text-center max-w-md mx-auto my-12 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-brand-tealBg text-brand-teal rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <GitCompare size={32} strokeWidth={2} />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy m-0 mb-3 tracking-tight">
              Compare Projects
            </h3>
            <p className="text-sm text-brand-slate font-semibold leading-relaxed m-0 mb-6 max-w-[280px] mx-auto">
              Select at least 2 projects to compare side-by-side and see highlights.
            </p>
            
            <Link
              href="/watchlist"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-extrabold shadow-brand hover:opacity-90 active:scale-95 no-underline transition-all w-full"
            >
              Browse Match Results
            </Link>
          </div>
        ) : (
          /* Render full Comparison View */
          <CompareView initialProjects={projects} />
        )}

      </div>
    </DashboardLayout>
  );
}
