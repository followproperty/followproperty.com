import React from "react";
import { Building, ListFilter } from "lucide-react";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProjectsFilterClient from "./ProjectsFilterClient";
import ExpandableProjectSection from "./ExpandableProjectSection";
import { normalizeBuilder } from "@/utils/admin/normalization";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Real Estate Projects & Properties | FollowProperty",
  description: "Explore our comprehensive directory of real estate developments, residential apartments, plots, and commercial projects. Filter by city, status, and developer.",
};

function mapProjectToCard(p) {
  const isReady =
    p.status === "Ready" ||
    p.status === "Ready to Move" ||
    p.status === "Completed";

  return {
    id: p._id.toString(),
    _id: p._id.toString(),
    title: p.projectName,
    projectName: p.projectName,
    status: p.status === "Upcoming" ? "Upcoming" : (isReady ? "Ready to Move" : "Under Construction"),
    specificType:
      p.configuration ||
      (p.bhk && p.bhk.length > 0 ? `${p.bhk.join(", ")} BHK` : p.propertyType || "Residential"),
    locality: p.locality || p.location || "Local",
    city: p.city || "",
    builder: normalizeBuilder(p.builderName || ""),
    possessionYear: p.possessionYear === 0 ? "Ready to Move" : p.possessionYear || p.possessionDate || "TBD",
    superArea: p.superArea
      ? parseFloat(String(p.superArea).replace(/,/g, "")) || 0
      : p.avgAreaSqft
      ? parseFloat(String(p.avgAreaSqft).replace(/,/g, "")) || 0
      : 0,
    minPrice: p.minPrice || 0,
    maxPrice: p.maxPrice || 0,
    marketPrice: p.marketPrice,
  };
}

export default async function ProjectsPage({ searchParams }) {
  // Await page searchParams
  const params = await searchParams;
  const cityParam = params.city || "All";
  const builderParam = params.builder || "All";
  const propertyTypeParam = params.propertyType || "All";
  const statusParam = params.status || "All";

  await connectToDatabase();

  // 1. Fetch metadata lists for filter choices from both collections
  const [
    marketCities, upcomingCities,
    marketBuilders, upcomingBuilders,
    marketPropertyTypes, upcomingPropertyTypes,
    marketStatuses, upcomingStatuses
  ] = await Promise.all([
    MarketProject.distinct("city"),
    UpcomingProject.distinct("city"),
    MarketProject.distinct("builderName"),
    UpcomingProject.distinct("builderName"),
    MarketProject.distinct("propertyType"),
    UpcomingProject.distinct("propertyType"),
    MarketProject.distinct("status"),
    UpcomingProject.distinct("status")
  ]);

  // Merge and normalize metadata lists
  const cities = Array.from(new Set([...marketCities, ...upcomingCities].filter(Boolean))).sort();
  const propertyTypes = Array.from(new Set([...marketPropertyTypes, ...upcomingPropertyTypes].filter(Boolean))).sort();
  const statuses = Array.from(new Set([...marketStatuses, ...upcomingStatuses].filter(Boolean))).sort();

  const rawBuilders = Array.from(new Set([...marketBuilders, ...upcomingBuilders]));
  const normalizedBuildersSet = new Set();
  rawBuilders.forEach((b) => {
    if (b && b.trim()) {
      normalizedBuildersSet.add(normalizeBuilder(b.trim()));
    }
  });
  const buildersList = Array.from(normalizedBuildersSet).sort();

  // 2. Build Mongoose query
  const query = {};

  if (cityParam !== "All") {
    query.city = cityParam;
  }

  if (builderParam !== "All") {
    // Find all raw builder names in DB that match the selected normalized builder name
    const matchingRawNames = rawBuilders.filter(
      (name) => name && normalizeBuilder(name) === builderParam
    );
    query.builderName = { $in: matchingRawNames };
  }

  if (propertyTypeParam !== "All") {
    query.propertyType = propertyTypeParam;
  }

  if (statusParam !== "All") {
    query.status = statusParam;
  }

  // 3. Query initial 3 items and counts for both collections
  const [upcomingDb, marketDb, totalUpcoming, totalMarket] = await Promise.all([
    UpcomingProject.find(query).sort({ createdAt: -1 }).limit(3).lean(),
    MarketProject.find(query).sort({ createdAt: -1 }).limit(3).lean(),
    UpcomingProject.countDocuments(query),
    MarketProject.countDocuments(query)
  ]);

  // Map DB records to clean PropertyCard format
  const mappedUpcoming = upcomingDb.map(p => mapProjectToCard(p));
  const mappedMarket = marketDb.map(p => mapProjectToCard(p));

  const totalProperties = totalUpcoming + totalMarket;
  const showingCount = mappedUpcoming.length + mappedMarket.length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-16">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight flex items-center gap-2.5">
            <ListFilter className="text-brand-blue" size={28} /> Projects Directory
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate m-0">
            Explore verified market properties, compare layouts, check construction milestones, and navigate developer profiles.
          </p>
        </div>

        {/* Filter Bar Component */}
        <ProjectsFilterClient
          cities={cities}
          builders={buildersList}
          propertyTypes={propertyTypes}
          statuses={statuses}
          currentFilters={{
            city: cityParam,
            builder: builderParam,
            propertyType: propertyTypeParam,
            status: statusParam,
          }}
        />

        {/* Results Info */}
        <div className="mb-6 text-xs text-brand-slate font-bold">
          Showing {showingCount} of {totalProperties} total properties
        </div>

        {/* Listings Sections */}
        {totalProperties > 0 ? (
          <div>
            {/* Featured Projects Section */}
            <ExpandableProjectSection
              title="Featured Projects"
              initialProjects={mappedUpcoming}
              totalCount={totalUpcoming}
              type="upcoming"
              currentFilters={{
                city: cityParam,
                builder: builderParam,
                propertyType: propertyTypeParam,
                status: statusParam,
              }}
            />

            {/* Other Projects Section */}
            <ExpandableProjectSection
              title="Other Projects"
              initialProjects={mappedMarket}
              totalCount={totalMarket}
              type="market"
              currentFilters={{
                city: cityParam,
                builder: builderParam,
                propertyType: propertyTypeParam,
                status: statusParam,
              }}
            />
          </div>
        ) : (
          <div className="bg-brand-bg-card rounded-3xl border border-brand-border p-12 text-center shadow-brand">
            <Building className="mx-auto text-brand-slate-light mb-4" size={48} />
            <h3 className="text-base font-extrabold text-brand-navy mb-1">No Properties Found</h3>
            <p className="text-xs text-brand-slate max-w-sm mx-auto mb-0">
              There are no matching properties listed under these filter conditions. Try resetting your search parameters.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
