import type { Metadata } from "next";

export const PRIVATE_ROUTE_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} satisfies Metadata["robots"];
