import React from "react";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import Builder from "@/models/Builder";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BuilderProfileClient from "./BuilderProfileClient";
import { normalizeBuilder } from "@/utils/admin/normalization";

// Dynamic metadata generation for SEO compliance
export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectToDatabase();

  const builder = await Builder.findOne({ slug, status: "active" }).lean();
  const canonicalBuilderName = builder ? builder.name : "Developer";

  return {
    title: `${canonicalBuilderName} - Projects & Real Estate Portfolio | FollowProperty`,
    description: `Explore delivered and ongoing properties by ${canonicalBuilderName}. Get project configurations, price ranges, possession years, and location details direct from developers.`,
  };
}

export default async function BuilderProfilePage({ params }) {
  const { slug } = await params;
  await connectToDatabase();

  // 1. Resolve builder using the slug
  const builder = await Builder.findOne({ slug, status: "active" }).lean();

  if (!builder) {
    return notFound();
  }

  // 2. Query all project documents matching this builderId
  const dbProjects = await MarketProject.find({
    builderId: builder._id
  })
    .sort({ possessionYear: -1, projectName: 1 })
    .lean();

  if (dbProjects.length === 0) {
    return notFound();
  }

  // 3. Compute builder profile metrics
  const canonicalBuilderName = builder.name;
  const totalProjects = dbProjects.length;

  const deliveredProjects = dbProjects.filter((p) => {
    return (
      p.status === "Ready" ||
      p.status === "Ready to Move" ||
      p.status === "Completed"
    );
  }).length;

  const ongoingProjects = dbProjects.filter((p) => {
    return p.status === "Under Construction" || p.status === "Ongoing";
  }).length;

  const cities = Array.from(new Set(dbProjects.map((p) => p.city).filter(Boolean))).sort();

  // 4. Map DB documents into standardized client property objects expected by PropertyCard
  const mappedProperties = dbProjects.map((p) => {
    const isReady =
      p.status === "Ready" ||
      p.status === "Ready to Move" ||
      p.status === "Completed";

    return {
      id: p._id.toString(),
      _id: p._id.toString(),
      builderSlug: p.builderSlug || "",
      projectSlug: p.projectSlug || "",
      title: p.projectName,
      projectName: p.projectName,
      status: isReady ? "Ready to Move" : "Under Construction",
      specificType:
        p.configuration ||
        (p.bhk && p.bhk.length > 0 ? `${p.bhk.join(", ")} BHK` : p.propertyType || "Residential"),
      locality: p.locality || p.location || "Local",
      city: p.city || "",
      builder: canonicalBuilderName,
      possessionYear: p.possessionYear === 0 ? "Ready to Move" : p.possessionYear || p.possessionDate || "TBD",
      superArea: p.superArea ? parseFloat(p.superArea.replace(/,/g, "")) : (p.avgAreaSqft ? parseFloat(p.avgAreaSqft.replace(/,/g, "")) : 0),
      minPrice: p.minPrice || 0,
      maxPrice: p.maxPrice || 0,
      marketPrice: p.marketPrice // Safe fallback to raw text range string from DB
    };
  });

  return (
    <DashboardLayout>
      <BuilderProfileClient
        builderName={canonicalBuilderName}
        totalProjects={totalProjects}
        deliveredProjects={deliveredProjects}
        ongoingProjects={ongoingProjects}
        cities={cities}
        projects={mappedProperties}
      />
    </DashboardLayout>
  );
}
