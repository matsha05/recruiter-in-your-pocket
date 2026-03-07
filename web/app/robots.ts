import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://recruiterinyourpocket.com/sitemap.xml",
    host: "https://recruiterinyourpocket.com",
  };
}
