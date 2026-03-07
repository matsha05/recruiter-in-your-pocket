import type { NextRequest } from "next/server";
import { getConfiguredExtensionOrigins } from "../launch/flags";

const SITE_ORIGINS = [
  "http://localhost:3000",
  "https://recruiterinyourpocket.com",
  "https://www.recruiterinyourpocket.com",
];

type CorsMethod = "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS";

function getAllowedOrigins() {
  return [...SITE_ORIGINS, ...getConfiguredExtensionOrigins()];
}

export function isAllowedExtensionOrigin(origin: string) {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin);
}

export function buildExtensionCorsHeaders(
  req: NextRequest,
  methods: CorsMethod[] = ["GET", "POST", "OPTIONS"]
) {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };

  if (origin && isAllowedExtensionOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
