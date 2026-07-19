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
    sitemap: "https://www.recruiterinyourpocket.com/sitemap.xml",
    host: "https://www.recruiterinyourpocket.com",
  };
}
