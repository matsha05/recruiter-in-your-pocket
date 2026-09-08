import assert from "node:assert/strict";
import { cn } from "../lib/utils";

// Real component combinations must retain both type size and semantic color.
assert.equal(cn("text-report-title", "text-foreground"), "text-report-title text-foreground");
assert.equal(cn("text-muted-foreground", "text-data"), "text-muted-foreground text-data");
assert.equal(cn("text-sm", "text-report-title", "text-brand"), "text-report-title text-brand");
assert.equal(cn("md:text-section-title", "md:text-foreground"), "md:text-section-title md:text-foreground");
assert.equal(cn("text-report-title", "text-base"), "text-base");
assert.equal(cn("text-brand", "text-foreground"), "text-foreground");
assert.equal(cn("max-w-lg", "max-w-auth"), "max-w-auth");
assert.equal(cn("rounded-sheet", "rounded-md"), "rounded-md");

console.log("Semantic typography composition passed.");
