import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Builder from "@/models/Builder";
import MarketProject from "@/models/MarketProject";
import BuilderDashboardClient from "@/components/builder/BuilderDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Builder Workspace Dashboard | FollowProperty",
  description: "Monitor developer profiles, manage active projects, and list launching properties on the FollowProperty directory.",
};

export default async function BuilderDashboardPage() {
  await connectToDatabase();

  // 1. Authenticate user from session token cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login?redirect=/builder-dashboard");
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (err) {
    console.error("Invalid token on builder dashboard:", err);
    redirect("/login?redirect=/builder-dashboard");
  }

  // 2. Fetch User document from database
  const firebaseUid = decodedToken.uid;
  const user = await User.findOne({ firebaseUid }).lean();

  if (!user) {
    redirect("/");
  }

  // 3. Enforce Builder Role check
  if (user.role !== "builder") {
    redirect("/");
  }

  // 4. Validate builderId is linked
  if (!user.builderId) {
    redirect("/");
  }

  // 5. Fetch Builder profile document
  const builderDoc = await Builder.findById(user.builderId).lean();
  if (!builderDoc) {
    redirect("/");
  }

  // 6. Fetch projects matching this builderId relationship
  const projectsDocs = await MarketProject.find({ builderId: builderDoc._id }).lean();

  // 7. Serialize Mongoose documents safely to pass to client component
  const builder = {
    id: builderDoc._id.toString(),
    name: builderDoc.name,
    slug: builderDoc.slug,
    status: builderDoc.status,
  };

  const projects = projectsDocs.map((p) => ({
    id: p._id.toString(),
    builderSlug: p.builderSlug || "",
    projectSlug: p.projectSlug || "",
    projectName: p.projectName,
    city: p.city || "",
    locality: p.locality || "",
    propertyType: p.propertyType || "Residential",
    status: p.status || "Under Construction",
    minPrice: p.minPrice || 0,
    maxPrice: p.maxPrice || 0,
    moderationStatus: p.moderationStatus || "approved",
  }));

  return (
    <BuilderDashboardClient
      initialBuilder={builder}
      initialProjects={projects}
    />
  );
}

