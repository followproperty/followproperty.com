import React from "react";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import Builder from "@/models/Builder";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BuildersDirectoryClient from "./BuildersDirectoryClient";
import { normalizeBuilder } from "@/utils/admin/normalization";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Real Estate Developers & Builders | FollowProperty",
  description: "Browse premium developers and builders in your location. View construction tracking metrics, total properties, delivered projects, and ongoing inventory.",
  alternatives: {
    canonical: "/builders",
  },
};

export default async function BuildersDirectoryPage() {
  await connectToDatabase();

  // 1. Fetch active builders from Builder collection
  const activeBuilders = await Builder.find({ status: "active" }).lean();

  // 2. Aggregate project metrics grouped by builderId
  const rawAggregation = await MarketProject.aggregate([
    {
      $group: {
        _id: "$builderId",
        totalProjects: { $sum: 1 },
        deliveredCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "Ready"] },
                  { $eq: ["$status", "Ready to Move"] },
                  { $eq: ["$status", "Completed"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        ongoingCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "Under Construction"] },
                  { $eq: ["$status", "Ongoing"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        cities: { $addToSet: "$city" },
      },
    },
    { $match: { _id: { $ne: null } } },
  ]);

  // Create a map of aggregated metrics indexed by builderId (as string)
  const metricsMap = {};
  const allCitiesSet = new Set();

  rawAggregation.forEach((item) => {
    metricsMap[item._id.toString()] = item;
    if (Array.isArray(item.cities)) {
      item.cities.forEach((city) => {
        if (city && city.trim()) {
          allCitiesSet.add(city.trim());
        }
      });
    }
  });

  // 3. Map active builders to their corresponding aggregated metrics
  const buildersList = activeBuilders
    .map((builder) => {
      const metrics = metricsMap[builder._id.toString()] || {
        totalProjects: 0,
        deliveredCount: 0,
        ongoingCount: 0,
        cities: [],
      };

      return {
        builderName: builder.name,
        slug: builder.slug,
        totalProjects: metrics.totalProjects,
        deliveredProjects: metrics.deliveredCount,
        ongoingProjects: metrics.ongoingCount,
        cities: Array.isArray(metrics.cities)
          ? Array.from(new Set(metrics.cities.filter(Boolean).map(c => c.trim()))).sort()
          : [],
      };
    })
    .sort((a, b) => b.totalProjects - a.totalProjects);

  const uniqueCities = Array.from(allCitiesSet).sort();

  return (
    <DashboardLayout>
      <BuildersDirectoryClient initialBuilders={buildersList} uniqueCities={uniqueCities} />
    </DashboardLayout>
  );
}
