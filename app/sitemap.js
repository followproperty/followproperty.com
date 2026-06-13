import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import Builder from "@/models/Builder";

export default async function sitemap() {
  const baseUrl = "https://followproperty.com";

  // Static site paths
  const staticRoutes = [
    "",
    "/projects",
    "/builders",
    "/login",
    "/signup",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  let builderRoutes = [];
  let marketProjectRoutes = [];
  let upcomingProjectRoutes = [];

  try {
    await connectToDatabase();

    // 1. Fetch active builders
    const builders = await Builder.find({ status: "active" }).select("slug updatedAt").lean();
    builderRoutes = builders.map((b) => ({
      url: `${baseUrl}/builders/${b.slug}`,
      lastModified: b.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // 2. Fetch market projects with valid slugs
    const marketProjects = await MarketProject.find({
      builderSlug: { $exists: true, $ne: "" },
      projectSlug: { $exists: true, $ne: "" },
    }).select("builderSlug projectSlug updatedAt").lean();
    marketProjectRoutes = marketProjects.map((p) => ({
      url: `${baseUrl}/builder/${p.builderSlug}/projects/${p.projectSlug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

    // 3. Fetch upcoming projects with valid slugs
    const upcomingProjects = await UpcomingProject.find({
      builderSlug: { $exists: true, $ne: "" },
      projectSlug: { $exists: true, $ne: "" },
    }).select("builderSlug projectSlug updatedAt").lean();
    upcomingProjectRoutes = upcomingProjects.map((p) => ({
      url: `${baseUrl}/builder/${p.builderSlug}/projects/${p.projectSlug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

  } catch (error) {
    console.error("Error generating sitemap routes dynamically:", error);
  }

  return [
    ...staticRoutes,
    ...builderRoutes,
    ...marketProjectRoutes,
    ...upcomingProjectRoutes,
  ];
}
