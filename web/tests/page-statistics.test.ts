import assert from "node:assert/strict";
import { allowsPageStatistics, scrubPageUrl } from "../lib/pageStatistics";

// Page statistics count by default and stop on an explicit decline or a browser opt-out.
assert.equal(allowsPageStatistics("unknown"), true);
assert.equal(allowsPageStatistics("accepted"), true);
assert.equal(allowsPageStatistics("declined"), false);
assert.equal(allowsPageStatistics("blocked"), false, "Do Not Track and Global Privacy Control stop page statistics");

// Private ids never leave the browser.
assert.equal(
  scrubPageUrl("https://www.recruiterinyourpocket.com/reports/3f2b9c1e-7d4a-4c1b-9e2f-1a2b3c4d5e6f"),
  "https://www.recruiterinyourpocket.com/reports/[id]",
);
assert.equal(
  scrubPageUrl("https://www.recruiterinyourpocket.com/settings/support-reply/18c2f0a9b4e74d21"),
  "https://www.recruiterinyourpocket.com/settings/support-reply/[id]",
);
assert.equal(
  scrubPageUrl("https://www.recruiterinyourpocket.com/purchase/confirmed?session_id=cs_live_a1B2c3D4e5F6g7H8i9J0&next=%2Freports"),
  "https://www.recruiterinyourpocket.com/purchase/confirmed",
  "checkout sessions and return paths are dropped",
);
assert.equal(
  scrubPageUrl("https://www.recruiterinyourpocket.com/auth?from=paywall&next=%2Fworkspace&email=private%40example.com"),
  "https://www.recruiterinyourpocket.com/auth",
);

// Campaign tags survive, so we can tell where visitors came from.
assert.equal(
  scrubPageUrl("https://www.recruiterinyourpocket.com/?utm_source=linkedin&utm_campaign=launch&fbclid=abc&secret=1"),
  "https://www.recruiterinyourpocket.com/?utm_source=linkedin&utm_campaign=launch",
);

// Ordinary readable routes are unchanged.
assert.equal(
  scrubPageUrl("https://www.recruiterinyourpocket.com/research/spelling-errors-impact"),
  "https://www.recruiterinyourpocket.com/research/spelling-errors-impact",
);
assert.equal(scrubPageUrl("not a url"), "not a url");

console.log("Page statistics privacy contract passed");
