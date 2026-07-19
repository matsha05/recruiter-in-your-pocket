import fs from "node:fs";
import path from "node:path";
import { VENDOR_REVIEW_ITEMS } from "../lib/launch/program";
import { DATA_HANDLING_ROWS } from "../lib/legal/dataHandling";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const requiredVendors = ["Upstash", "Inngest"];
const registeredVendors = new Set(VENDOR_REVIEW_ITEMS.map((item) => item.vendor));
const processors = DATA_HANDLING_ROWS.map((row) => row.processor).join(" ");
const publicPrivacyCopy = fs.readFileSync(
  path.resolve(process.cwd(), "lib/legal/content.ts"),
  "utf8"
);
const launchReview = fs.readFileSync(
  path.resolve(process.cwd(), "../docs/launch-readiness/85-vendor-privacy-review.md"),
  "utf8"
);

for (const vendor of requiredVendors) {
  assert(registeredVendors.has(vendor), `${vendor} is missing from the launch vendor registry`);
  assert(processors.includes(vendor), `${vendor} is missing from the data-handling processor map`);
  assert(publicPrivacyCopy.includes(vendor), `${vendor} is missing from public privacy copy`);
  assert(launchReview.includes(`| ${vendor} |`), `${vendor} is missing from the launch vendor review`);
}

console.log("vendor privacy disclosures stay aligned");
