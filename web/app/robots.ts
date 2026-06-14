import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/internal/",
          "/playground/",
          "/launch",
          "/reports",
          "/reports/",
          "/jobs",
          "/jobs/",
          "/settings",
          "/settings/",
          "/dashboard",
          "/auth",
          "/signin",
          "/purchase/",
        ],
      },
    ],
    sitemap: "https://recruiterinyourpocket.com/sitemap.xml",
    host: "https://recruiterinyourpocket.com",
  };
}
