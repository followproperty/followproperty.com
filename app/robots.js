export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/portfolio",
        "/watchlist",
        "/admin",
        "/settings",
        "/onboarding",
        "/rera",
        "/builder-dashboard",
        "/builder-register",
        "/builder-application-status",
        "/property",
      ],
    },
    sitemap: "https://www.followproperty.com/sitemap.xml",
  };
}
