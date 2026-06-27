import React from "react";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import Builder from "@/models/Builder";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BuilderProfileClient from "./BuilderProfileClient";
import { normalizeBuilder } from "@/utils/admin/normalization";

// Dynamic metadata generation for SEO compliance
export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectToDatabase();

  let builder = await Builder.findOne({ slug, status: "active" }).lean();
  let canonicalBuilderName = builder ? builder.name : "";

  if (!canonicalBuilderName) {
    const sample = await MarketProject.findOne({ builderSlug: slug }).select("builderName").lean()
      || await UpcomingProject.findOne({ builderSlug: slug }).select("builderName").lean();
    if (sample) {
      canonicalBuilderName = sample.builderName;
    } else {
      canonicalBuilderName = "Developer";
    }
  }

  return {
    title: `${canonicalBuilderName} - Projects & Real Estate Portfolio | FollowProperty`,
    description: `Explore delivered and ongoing properties by ${canonicalBuilderName}. Get project configurations, price ranges, possession years, and location details direct from developers.`,
  };
}

export default async function BuilderProfilePage({ params }) {
  const { slug } = await params;
  await connectToDatabase();

  // 1. Resolve builder using the slug
  let builder = await Builder.findOne({ slug, status: "active" }).lean();
  let canonicalBuilderName = "";

  if (!builder) {
    const sample = await MarketProject.findOne({ builderSlug: slug }).lean()
      || await UpcomingProject.findOne({ builderSlug: slug }).lean();

    if (!sample) {
      return notFound();
    }

    canonicalBuilderName = sample.builderName;

    // Dynamically and idempotently create the missing Builder record
    try {
      const createdBuilder = await Builder.create({
        name: canonicalBuilderName,
        slug: slug,
        status: "active"
      });
      builder = createdBuilder.toObject();
    } catch (e) {
      console.error("Failed to dynamically register missing builder:", e);
      builder = {
        _id: sample.builderId || null,
        name: canonicalBuilderName,
        slug: slug,
        status: "active"
      };
    }
  } else {
    canonicalBuilderName = builder.name;
  }

  // 2. Query project documents from both MarketProject and UpcomingProject matching this builder
  const [marketProjects, upcomingProjects] = await Promise.all([
    MarketProject.find({
      $or: [
        { builderId: builder._id },
        { builderSlug: slug }
      ]
    }).lean(),
    UpcomingProject.find({
      builderSlug: slug
    }).lean()
  ]);

  const dbProjects = [...marketProjects, ...upcomingProjects];

  if (dbProjects.length === 0) {
    return notFound();
  }

  // Sort combined projects: possessionYear descending, projectName ascending
  dbProjects.sort((a, b) => {
    const yearA = a.possessionYear || 0;
    const yearB = b.possessionYear || 0;
    if (yearB !== yearA) {
      return yearB - yearA;
    }
    return (a.projectName || "").localeCompare(b.projectName || "");
  });

  // 3. Compute builder profile metrics
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
      superArea: p.superArea 
        ? (typeof p.superArea === "string" ? parseFloat(p.superArea.replace(/,/g, "")) : p.superArea)
        : (p.avgAreaSqft ? (typeof p.avgAreaSqft === "string" ? parseFloat(p.avgAreaSqft.replace(/,/g, "")) : p.avgAreaSqft) : 0),
      minPrice: p.minPrice || 0,
      maxPrice: p.maxPrice || 0,
      marketPrice: p.marketPrice, // Safe fallback to raw text range string from DB
      images: p.images || [],
      image: p.images && p.images.length > 0 ? p.images[0] : "",
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
