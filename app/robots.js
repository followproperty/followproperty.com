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
      ],
    },
    sitemap: "https://followproperty.com/sitemap.xml",
  };
}
