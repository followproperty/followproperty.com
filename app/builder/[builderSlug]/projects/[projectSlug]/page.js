import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { 
  MapPin, 
  Building, 
  Building2, 
  Calendar, 
  Maximize2, 
  Layers,
  LayoutGrid,
  TrendingUp,
  Tag,
  CheckCircle2
} from "lucide-react";

import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import Watchlist from "@/models/Watchlist";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LeadButton from "@/app/projects/[id]/LeadButton";
import CompareButton from "@/app/projects/[id]/CompareButton";
import ShareButton from "@/app/projects/[id]/ShareButton";
import CompareBar from "@/components/compare/CompareBar";
import DownloadReportButton from "@/app/projects/[id]/DownloadReportButton";
import ProjectTabs from "@/app/projects/[id]/ProjectTabs";
import { formatCurrency, formatPriceRange, formatAreaRange } from "@/utils/pdf/formatter";
import { normalizeBuilder } from "@/utils/admin/normalization";
import BackButton from "@/components/ui/BackButton";
import LeadForm from "@/components/lead/LeadForm";
import ProjectGallery from "@/app/projects/[id]/ProjectGallery";

// Dynamic metadata generation for SEO compliance
export async function generateMetadata({ params }) {
  const { builderSlug, projectSlug } = await params;
  await connectToDatabase();

  let project = await MarketProject.findOne({ builderSlug, projectSlug }).select("projectName builderName locality city").lean();
  if (!project) {
    project = await UpcomingProject.findOne({ builderSlug, projectSlug }).select("projectName builderName locality city").lean();
  }

  if (!project) {
    return {
      title: "Project Not Found | FollowProperty",
    };
  }

  const title = `${project.projectName} by ${project.builderName} in ${project.locality ? `${project.locality}, ` : ""}${project.city} | FollowProperty`;
  const description = `Explore specifications, configurations, prices, and amenities of ${project.projectName} built by ${project.builderName} in ${project.locality ? `${project.locality}, ` : ""}${project.city}.`;
  const canonicalUrl = `https://followproperty.com/builder/${builderSlug}/projects/${projectSlug}`;

  return {
    title,
    description,
    alternatives: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProjectDetailsPage({ params, searchParams }) {
  // Await route params and searchParams for the project details page
  const { builderSlug, projectSlug } = await params;
  const { watchlistId } = await searchParams;

  if (projectSlug === "vrindavan-plotting-project") {
    redirect("/plotsinvrindavan");
  }

  await connectToDatabase();

  // Retrieve project document by slugs
  let project = null;
  try {
    project = await MarketProject.findOne({ builderSlug, projectSlug }).lean();
    if (!project) {
      project = await UpcomingProject.findOne({ builderSlug, projectSlug }).lean();
    }
  } catch (err) {
    console.error("Error fetching project by slugs:", err);
  }

  if (!project) {
    return notFound();
  }

  // Retrieve watchlist document if parameter exists to show contextual matching block
  let watchlist = null;
  if (watchlistId) {
    try {
      watchlist = await Watchlist.findById(watchlistId).lean();
    } catch (err) {
      console.error("Invalid watchlist ID:", watchlistId);
    }
  }

  const isReady = project.status === "Ready to Move" || project.status === "Ready" || project.status === "Completed";

  const resolvedBuilderSlug = project.builderName
    ? normalizeBuilder(project.builderName).toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "";

  // Compile Dynamic Project Highlights list
  const highlights = [];
  if (project.bhk && project.bhk.length > 0) {
    highlights.push(`${project.bhk.join(", ")} BHK Configurations`);
  }
  if (project.status) {
    highlights.push(project.status);
  }
  if (project.locality && project.city) {
    highlights.push(`Located in ${project.locality}, ${project.city}`);
  }
  if (project.minPrice) {
    highlights.push(`Base Entry Price: ${formatCurrency(project.minPrice, "₹")}`);
  }
  if (project.perSqftRate) {
    highlights.push(`Competitive rate of ₹${Number(project.perSqftRate).toLocaleString()}/sq.ft`);
  }
  if (project.possessionYear !== undefined && project.possessionYear !== null) {
    highlights.push(project.possessionYear === 0 ? "Ready to Move in" : `Possession target year: ${project.possessionYear}`);
  }

  // Dynamic safe amenities list mapping based on property type
  const type = (project.propertyType || "Residential").toLowerCase();
  let amenitiesList = [];
  
  if (type.includes("plot") || type.includes("land")) {
    amenitiesList = [
      { name: "24/7 Security Guard", icon: "🛡️" },
      { name: "Water Supply Link", icon: "🚰" },
      { name: "Electricity Supply", icon: "⚡" },
      { name: "Boundary Wall", icon: "🚧" },
      { name: "Wide Access Roads", icon: "🛣️" },
      { name: "Rainwater Drainage", icon: "🌧️" }
    ];
  } else if (type.includes("farm") || type.includes("ranch")) {
    amenitiesList = [
      { name: "Gated Boundary", icon: "🚧" },
      { name: "Water Connection", icon: "🚰" },
      { name: "Electricity Grid", icon: "⚡" },
      { name: "Lush Green Surrounds", icon: "🌳" },
      { name: "Security Guard", icon: "🛡️" },
      { name: "Approach Road Access", icon: "🛣️" }
    ];
  } else {
    // Default Residential / Commercial Buildings
    amenitiesList = [
      { name: "24x7 Gated Security", icon: "🛡️" },
      { name: "24/7 Water Supply", icon: "🚰" },
      { name: "Power Backup Link", icon: "⚡" },
      { name: "CCTV Surveillance", icon: "📹" },
      { name: "Fire Safety Systems", icon: "🔥" },
      { name: "Designated Parking", icon: "🚗" },
      { name: "Elevator Access", icon: "🛗" },
      { name: "Waste Disposal System", icon: "🗑️" }
    ];
  }

  const hasAmenities = (project.amenities && project.amenities.length > 0) || (amenitiesList && amenitiesList.length > 0);

  // Navigation tab targets mapping
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "configurations", label: "Configurations" },
    ...(hasAmenities ? [{ id: "amenities", label: "Amenities" }] : []),
    { id: "location", label: "Location" },
    { id: "floorplan", label: "Floor Plan & Master Plan" }
  ];

  // Dynamic coordinates extraction
  let geoCoordinates = undefined;
  if (project.gps) {
    const coords = project.gps.split(",");
    if (coords.length === 2) {
      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        geoCoordinates = {
          "@type": "GeoCoordinates",
          "latitude": lat,
          "longitude": lng
        };
      }
    }
  }

  // Dynamic amenity features mapping
  const schemaAmenities = (project.amenities && project.amenities.length > 0)
    ? project.amenities
    : amenitiesList.map(a => a.name);

  const amenityFeatures = schemaAmenities.map(amenityName => ({
    "@type": "LocationFeatureSpecification",
    "name": amenityName,
    "value": true
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateProject",
    "name": project.projectName,
    "description": project.tagline || `Real estate development project ${project.projectName} by ${project.builderName}`,
    "url": `https://followproperty.com/builder/${builderSlug}/projects/${projectSlug}`,
    "image": project.images && project.images.length > 0 ? project.images : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": project.locality || "",
      "addressRegion": project.city || "",
      "addressCountry": "IN"
    },
    "geo": geoCoordinates,
    "amenityFeature": amenityFeatures.length > 0 ? amenityFeatures : undefined,
    "builder": project.builderName ? {
      "@type": "Organization",
      "name": project.builderName,
      "url": resolvedBuilderSlug ? `https://followproperty.com/builders/${resolvedBuilderSlug}` : undefined
    } : undefined,
    "offers": project.minPrice ? {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": project.minPrice,
      "highPrice": project.maxPrice || project.minPrice
    } : undefined
  };


  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto pb-16 pt-4 px-2 sm:px-4 font-sans antialiased text-brand-navy">
        
        {/* Navigation Control & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <BackButton />
        </div>

        {/* 1. MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns (Main project visual & sections) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Gallery Header */}
            <ProjectGallery projectName={project.projectName} images={project.images}>
              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                <span className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-xs border ${
                  isReady 
                    ? "bg-brand-emerald-bg text-brand-emerald border-brand-emerald/20" 
                    : "bg-brand-amber-bg text-brand-amber border-brand-amber/20"
                }`}>
                  {isReady ? "Ready to Move" : "Under Construction"}
                </span>
              </div>

              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 sm:gap-2">
                <CompareButton projectId={project._id.toString()} projectName={project.projectName} />
                <ShareButton projectName={project.projectName} />
              </div>

              {/* Bottom Overlay Text */}
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-xs border border-white/10 px-2.5 py-1 rounded-full mb-3.5 w-fit shadow-xs">
                  <span className="text-[10px] text-emerald-400 font-extrabold">✓</span>
                  <span className="text-[10px] text-white/95 font-bold uppercase tracking-wider">Verified {project.propertyType || "Residential"} Project</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight m-0 mb-1.5 text-white drop-shadow-sm">
                  {project.projectName}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 flex items-center gap-1.5 font-bold m-0 drop-shadow-xs">
                  <MapPin size={15} className="text-white/70" />
                  {project.locality ? `${project.locality}, ` : ""}{project.city}{project.state ? `, ${project.state}` : ""}
                </p>
              </div>
            </ProjectGallery>

            {/* Key Metrics Grid underneath image */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Project Area */}
              {project.totalArea && (
                <div className="p-4 bg-brand-bg-card border border-brand-border rounded-2xl shadow-xs">
                  <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1 block">Project Area</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-navy truncate block">{project.totalArea}</span>
                </div>
              )}
              {/* Towers */}
              {project.towers && (
                <div className="p-4 bg-brand-bg-card border border-brand-border rounded-2xl shadow-xs">
                  <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1 block">Towers</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-navy truncate block">{project.towers}</span>
                </div>
              )}
              {/* Possession */}
              {(project.possessionDate || project.possessionYear !== undefined) && (
                <div className="p-4 bg-brand-bg-card border border-brand-border rounded-2xl shadow-xs">
                  <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1 block">Possession</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-navy truncate block">
                    {project.possessionDate || (project.possessionYear === 0 ? "Ready to Move" : project.possessionYear)}
                  </span>
                </div>
              )}
              {/* Total Units */}
              {project.units && (
                <div className="p-4 bg-brand-bg-card border border-brand-border rounded-2xl shadow-xs">
                  <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1 block">Total Units</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-navy truncate block">{project.units} Units</span>
                </div>
              )}
            </div>

            {/* Scroll tab bar navigation component */}
            <ProjectTabs tabs={tabs} />

            {/* Contextual Watchlist match banner */}
            {watchlist && (
              <div className="bg-brand-bg-card border border-brand-border shadow-brand p-4 sm:p-5 rounded-2xl flex items-start sm:items-center gap-3.5 mb-6 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-lg bg-brand-blue-bg text-brand-blue flex-shrink-0 flex items-center justify-center font-extrabold border border-brand-blue-border">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-brand-navy m-0 mb-0.5">
                    Matched your buying requirements
                  </h4>
                  <p className="text-xs text-brand-slate m-0 leading-relaxed font-semibold">
                    This project satisfies your active buying profile for a <span className="font-bold text-brand-navy">{watchlist.specificType}</span> in <span className="font-bold text-brand-navy">{watchlist.locality}, {watchlist.city}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* 1. Overview Section */}
            <div id="overview" className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand scroll-mt-24">
              <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-1.5 block">Project Overview</span>
              <h3 className="text-xl font-extrabold text-brand-navy mb-4 m-0">About This Project</h3>
              
              {project.tagline && (
                <blockquote className="border-l-4 border-brand-blue pl-4 py-1 italic text-xs sm:text-sm text-brand-navy-mid font-bold mb-4 bg-brand-blue-bg/40 rounded-r-xl">
                  &quot;{project.tagline}&quot;
                </blockquote>
              )}

              <div className="text-xs sm:text-sm text-brand-slate leading-relaxed space-y-3.5 font-semibold">
                <p>
                  {project.projectName} is a premium {project.propertyType || "residential"} development by the renowned developer {project.builderName}. Centrally located in the vibrant locality of {project.locality}, {project.city}, this project is meticulously designed to offer a refined and modern urban living experience.
                </p>
                <p>
                  Offering configurations in {project.configuration || (project.bhk && project.bhk.length > 0 ? `${project.bhk.join(", ")} BHK` : "various configurations")} options, the residences feature spacious layouts, high-quality finishes, and contemporary designs. Low-density planning yields greater privacy and ample open spaces for recreation and wellness.
                </p>
              </div>
            </div>

            {/* 2. Configurations Section */}
            <div id="configurations" className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand scroll-mt-24">
              <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-1.5 block">Homes</span>
              <h3 className="text-xl font-extrabold text-brand-navy mb-5 m-0">Configurations</h3>
              
              <div className="space-y-3.5">
                {project.configurations && project.configurations.length > 0 ? (
                  project.configurations.map((configStr, idx) => {
                    const configArea = project.superArea || (project.minArea && project.maxArea ? `${project.minArea} - ${project.maxArea} sqft` : "TBD");
                    const basePriceStr = project.minPrice ? formatPriceRange(project.minPrice, project.maxPrice, "₹") : "Price on Request";
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-brand-bg-alt/30 border border-brand-border rounded-2xl hover:border-brand-border-mid transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base font-extrabold text-brand-navy">{configStr}</span>
                          <span className="text-xs text-brand-slate font-medium">{configArea}</span>
                        </div>
                        <span className="text-sm font-extrabold text-brand-navy-deep">{basePriceStr}</span>
                      </div>
                    );
                  })
                ) : project.bhk && project.bhk.length > 0 ? (
                  project.bhk.map((b, idx) => {
                    const configArea = project.superArea || (project.minArea && project.maxArea ? `${project.minArea} - ${project.maxArea} sqft` : "TBD");
                    const basePriceStr = idx === 0 && project.minPrice ? formatCurrency(project.minPrice, "₹") : project.maxPrice ? formatCurrency(project.maxPrice, "₹") : "Price on Request";
                    
                    return (
                      <div key={b} className="flex items-center justify-between p-4 bg-brand-bg-alt/30 border border-brand-border rounded-2xl hover:border-brand-border-mid transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base font-extrabold text-brand-navy">{b} BHK</span>
                          <span className="text-xs text-brand-slate font-medium">{configArea}</span>
                        </div>
                        <span className="text-sm font-extrabold text-brand-navy-deep">{basePriceStr}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between p-4 bg-brand-bg-alt/30 border border-brand-border rounded-2xl">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-extrabold text-brand-navy">{project.propertyType || "Residential"} Units</span>
                      <span className="text-xs text-brand-slate font-medium">{project.superArea || "TBD"}</span>
                    </div>
                    <span className="text-sm font-extrabold text-brand-navy-deep">
                      {formatPriceRange(project.minPrice, project.maxPrice, "₹")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Highlights Section */}
            {project.highlights && project.highlights.length > 0 && (
              <div className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand">
                <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-1.5 block">Highlights</span>
                <h3 className="text-xl font-extrabold text-brand-navy mb-4 m-0">Key Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-brand-bg-alt/30 border border-brand-border rounded-xl">
                      <span className="text-brand-blue font-bold">✓</span>
                      <span className="text-xs font-bold text-brand-navy-mid">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Section */}
            {(project.clubhouseSize || project.openGreenArea || project.carParkingPerUnit || project.liftsPerCore) && (
              <div className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand">
                <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-1.5 block">Specifications</span>
                <h3 className="text-xl font-extrabold text-brand-navy mb-4 m-0">Project Facts & Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {project.clubhouseSize && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Clubhouse Size</span>
                      <span className="text-xs sm:text-sm font-extrabold text-brand-navy">{project.clubhouseSize}</span>
                    </div>
                  )}
                  {project.openGreenArea && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Green Area</span>
                      <span className="text-xs sm:text-sm font-extrabold text-brand-navy">{project.openGreenArea}</span>
                    </div>
                  )}
                  {project.carParkingPerUnit !== undefined && project.carParkingPerUnit !== null && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Car Parking</span>
                      <span className="text-xs sm:text-sm font-extrabold text-brand-navy">{project.carParkingPerUnit} per unit</span>
                    </div>
                  )}
                  {project.liftsPerCore !== undefined && project.liftsPerCore !== null && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Lifts per core</span>
                      <span className="text-xs sm:text-sm font-extrabold text-brand-navy">{project.liftsPerCore} Lifts</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities Section */}
            {hasAmenities && (
              <div id="amenities" className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand scroll-mt-24">
                <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-1.5 block">Lifestyle</span>
                <h3 className="text-xl font-extrabold text-brand-navy mb-5 m-0">Amenities</h3>
                
                {project.amenities && project.amenities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.amenities.map((item, idx) => (
                      <div key={idx} className="p-3 bg-brand-bg-alt/30 border border-brand-border rounded-xl flex items-center gap-2.5">
                        <span className="text-base text-brand-blue">✦</span>
                        <span className="text-xs font-bold text-brand-navy-mid">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {amenitiesList.map((item, idx) => (
                      <div key={idx} className="p-4 bg-brand-bg-alt/20 border border-brand-border/60 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-brand-bg-alt/45 transition-colors">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs font-extrabold text-brand-navy-mid">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Location Section */}
            <div id="location" className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand scroll-mt-24">
              <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-1.5 block">Connectivity</span>
              <h3 className="text-xl font-extrabold text-brand-navy mb-5 m-0">Location Advantage</h3>
              
              {/* Distance cards / Connectivity */}
              {project.connectivity && project.connectivity.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {project.connectivity.map((conn, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg-alt/30 border border-brand-border rounded-2xl flex items-center gap-2.5">
                      <span className="text-sm text-brand-blue flex-shrink-0">🚗</span>
                      <span className="text-xs font-bold text-brand-navy-mid">{conn}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { name: "ATM / Banks", proximity: "Nearby", icon: "🏪" },
                    { name: "Hospital", proximity: "Short Drive", icon: "🏥" },
                    { name: "Metro Station", proximity: "Easy Access", icon: "🚇" },
                    { name: "Railway Station", proximity: "Convenient", icon: "🚉" },
                    { name: "Airport", proximity: "Accessible", icon: "✈️" },
                    { name: "Shopping Mall", proximity: "Nearby", icon: "🛍️" },
                  ].map((loc, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg-card border border-brand-border rounded-2xl shadow-xs flex items-center gap-2.5">
                      <span className="text-lg flex-shrink-0">{loc.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-extrabold text-brand-navy truncate">{loc.name}</span>
                        <span className="text-[9px] text-brand-slate font-bold">{loc.proximity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Map rendering */}
              <div className="relative rounded-2xl overflow-hidden border border-brand-border shadow-xs mb-4">
                <iframe 
                  width="100%" 
                  height="280" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  allowFullScreen 
                  src={
                    project.gps && project.gps.trim() 
                      ? `https://maps.google.com/maps?q=${encodeURIComponent(project.gps.trim())}&t=&z=16&ie=UTF8&iwloc=&output=embed`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(project.projectName + ", " + (project.locality || "") + ", " + project.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                  } 
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href={
                    project.gps && project.gps.trim()
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.gps.trim())}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.projectName + " " + (project.locality || "") + " " + project.city)}`
                  }
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold text-center no-underline shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* 5. Floor Plan & Master Plan Section */}
            <div id="floorplan" className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand scroll-mt-24">
              <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-1.5 block">Layouts</span>
              <h3 className="text-xl font-extrabold text-brand-navy mb-4 m-0">Floor Plan & Master Plan</h3>
              <div className="p-8 border-2 border-dashed border-brand-border-mid rounded-2xl flex flex-col items-center justify-center text-center bg-brand-bg-alt/20">
                <div className="w-12 h-12 rounded-full bg-brand-purple-bg text-brand-purple flex items-center justify-center border border-brand-purple-border mb-3 shadow-xs">
                  📐
                </div>
                <h4 className="text-sm font-extrabold text-brand-navy m-0 mb-1">Floor Plan Available on Request</h4>
                <p className="text-xs text-brand-slate max-w-sm m-0 mb-4 leading-normal font-semibold">
                  Detailed blueprint layouts, layout configurations, and master development plans are compiled by {project.builderName}.
                </p>
                <LeadButton 
                  className="px-6 py-2.5 bg-brand-purple hover:bg-brand-purple/95 text-white rounded-xl text-xs font-bold transition-all shadow-xs border-none cursor-pointer"
                  text="Request Master Plan Layout"
                  successText="✓ Blueprint layout request queued. We will email you the catalog PDF."
                  projectId={project._id.toString()}
                  projectName={project.projectName}
                  source="master_plan_request"
                  modalTitle="Request Master Plan"
                  modalSubtitle="Share your contact details to request layout blueprint"
                />
              </div>
            </div>

          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            
            {/* Price Card & site visit CTA */}
            <div className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand">
              {project.minPrice > 0 && (
                <>
                  <p className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1 m-0">
                    Starting Price
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-navy-deep tracking-tight m-0 mb-1 leading-tight">
                    {formatPriceRange(project.minPrice, project.maxPrice, "₹")}
                  </h2>
                  <p className="text-[11px] text-brand-slate-light m-0 mb-5 leading-normal font-bold">
                    All prices are indicative and subject to builder updates.
                  </p>
                </>
              )}
              
              <LeadButton 
                className="w-full py-3.5 rounded-xl border-none font-extrabold text-xs cursor-pointer text-white bg-brand-blue hover:bg-brand-blue/95 transition-all shadow-[0_4px_20px_rgba(50,95,236,0.2)] uppercase tracking-wider" 
                text="Book Site Visit →" 
                successText="✓ Site visit request registered. An advisor will contact you within 48 hours." 
                projectId={project._id.toString()}
                projectName={project.projectName}
                source="book_site_visit"
                modalTitle="Book a Site Visit"
                modalSubtitle="Share your contact details to schedule a site visit"
              />
            </div>

            {/* Brochure Card */}
            <DownloadReportButton 
              projectId={project._id.toString()} 
              projectName={project.projectName}
              projectPdf={project.projectPdf}
              project={JSON.parse(JSON.stringify(project))}
              variant="brochure-card"
            />

            {/* Lead capture form */}
            <div className="bg-brand-bg-card p-5 rounded-3xl border border-brand-border shadow-brand text-left">
              <span className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mb-2 block">Inquire</span>
              <h4 className="text-sm sm:text-base font-extrabold text-brand-navy m-0 mb-1.5">
                Interested in this project?
              </h4>
              <p className="text-[11px] text-brand-slate leading-relaxed m-0 mb-4 font-semibold">
                Share your contact details below. Our property advisor will reach out to you within 48 hours.
              </p>
              <LeadForm 
                source="project_detail" 
                projectId={project._id.toString()} 
                projectName={project.projectName} 
              />
            </div>

            {/* Developer Card */}
            <div className="bg-brand-bg-card p-5 rounded-3xl border border-brand-border shadow-brand">
              <span className="text-[9px] text-brand-slate uppercase font-bold tracking-wider mb-2.5 block">Developer</span>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-11 h-11 rounded-full bg-brand-blue-bg text-brand-blue border border-brand-blue-border flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                  {project.builderName ? project.builderName.charAt(0) : "D"}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-brand-navy m-0">
                    {project.builderName}
                  </h4>
                  {resolvedBuilderSlug && (
                    <Link
                      href={`/builders/${resolvedBuilderSlug}`}
                      className="text-xs text-brand-blue font-bold hover:underline"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              </div>

              {project.builderStats && (
                <div className="grid grid-cols-2 gap-2 my-4 pt-3.5 border-t border-brand-border">
                  {project.builderStats.yearsInBusiness !== undefined && (
                    <div className="bg-brand-bg-alt/45 p-2.5 rounded-xl text-center border border-brand-border/40">
                      <span className="text-[10px] text-brand-slate block uppercase tracking-wider font-extrabold mb-0.5">Experience</span>
                      <span className="text-xs font-black text-brand-navy">{project.builderStats.yearsInBusiness} Yrs</span>
                    </div>
                  )}
                  {project.builderStats.homesDelivered !== undefined && (
                    <div className="bg-brand-bg-alt/45 p-2.5 rounded-xl text-center border border-brand-border/40">
                      <span className="text-[10px] text-brand-slate block uppercase tracking-wider font-extrabold mb-0.5">Delivered</span>
                      <span className="text-xs font-black text-brand-navy">{Number(project.builderStats.homesDelivered).toLocaleString()}+</span>
                    </div>
                  )}
                  {project.builderStats.projectsDelivered !== undefined && (
                    <div className="bg-brand-bg-alt/45 p-2.5 rounded-xl text-center border border-brand-border/40">
                      <span className="text-[10px] text-brand-slate block uppercase tracking-wider font-extrabold mb-0.5">Projects</span>
                      <span className="text-xs font-black text-brand-navy">{project.builderStats.projectsDelivered}+</span>
                    </div>
                  )}
                  {project.builderStats.constructionPartner && (
                    <div className="bg-brand-bg-alt/45 p-2.5 rounded-xl text-center border border-brand-border/40 col-span-2">
                      <span className="text-[10px] text-brand-slate block uppercase tracking-wider font-extrabold mb-0.5">Build Partner</span>
                      <span className="text-xs font-black text-brand-navy truncate block">{project.builderStats.constructionPartner}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-brand-slate leading-relaxed m-0 font-semibold">
                Connect with our advisor for verified developer credentials, RERA details, and latest inventory updates.
              </p>
            </div>

            {/* Why Invest Here Card */}
            <div className="bg-brand-bg-card p-5 rounded-3xl border border-brand-border shadow-brand">
              <h3 className="text-xs font-bold text-brand-slate uppercase tracking-wider mb-3.5 border-b border-brand-border pb-2.5 m-0">
                Why Invest Here?
              </h3>
              <ul className="space-y-3 p-0 m-0 list-none">
                <li className="flex items-start gap-2.5 text-xs text-brand-slate font-semibold">
                  <span className="text-brand-blue font-bold flex-shrink-0">✓</span>
                  <span>Prime location in {project.locality || project.city}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-brand-slate font-semibold">
                  <span className="text-brand-blue font-bold flex-shrink-0">✓</span>
                  <span>Excellent connectivity & social infrastructure</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-brand-slate font-semibold">
                  <span className="text-brand-blue font-bold flex-shrink-0">✓</span>
                  <span>Trusted brand - {project.builderName}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-brand-slate font-semibold">
                  <span className="text-brand-blue font-bold flex-shrink-0">✓</span>
                  <span>High appreciation potential in {project.city}</span>
                </li>
              </ul>
              
              {/* Walkthrough Video Player / Placeholder */}
              {project.videos && project.videos.length > 0 && project.videos[0] ? (
                <div className="relative rounded-2xl overflow-hidden mt-4 border border-brand-border bg-black">
                  <video src={project.videos[0]} controls className="w-full h-[180px] object-cover" />
                </div>
              ) : (
                <div className="relative h-20 rounded-xl overflow-hidden mt-4 border border-brand-border bg-brand-navy-deep">
                  <div className="absolute inset-0 bg-linear-to-tr from-brand-navy via-brand-navy-mid to-brand-navy-deep opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Walkthrough Video Coming Soon</span>
                  </div>
                </div>
              )}
            </div>


          </div>

        </div>

        {/* Floating Bottom Comparison Drawer */}
        <CompareBar />

      </div>
    </DashboardLayout>
  );
}
