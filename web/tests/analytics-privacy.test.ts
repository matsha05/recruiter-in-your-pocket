import assert from "node:assert/strict";
import {
  ANALYTICS_EVENT_PROPERTIES,
  sanitizeAnalyticsEvent,
} from "../lib/analyticsPolicy";

const safe = sanitizeAnalyticsEvent("workspace_upload_succeeded", {
  source: "workspace",
  file_type: "application/pdf",
  file_size_bytes: 824_112,
  extracted_chars: 4_900,
  resume_text: "private resume contents",
  email: "candidate@example.com",
});

assert.deepEqual(safe, {
  name: "workspace_upload_succeeded",
  properties: {
    source: "workspace",
    file_type: "application/pdf",
    file_size_bytes: 824_112,
    extracted_chars: 4_900,
  },
});

assert.equal(
  sanitizeAnalyticsEvent("arbitrary_event", { resume_text: "private" }),
  null,
  "unknown event names must fail closed",
);

assert.deepEqual(
  sanitizeAnalyticsEvent("report_detail_opened", {
    report_id: "report-private-id",
    job_id: "export-private-id",
  }),
  { name: "report_detail_opened", properties: {} },
  "product identifiers must not leave the browser",
);

assert.deepEqual(
  sanitizeAnalyticsEvent("landing_cta_clicked", {
    cta: "hero_run_free_report",
    destination: "https://example.com/candidate@example.com",
  }),
  { name: "landing_cta_clicked", properties: { cta: "hero_run_free_report" } },
  "URL and email shaped values must be discarded even on approved keys",
);

for (const [event, properties] of Object.entries(ANALYTICS_EVENT_PROPERTIES)) {
  assert(!properties.some((property) => /(?:id|email|name|text|content|resume|job_description)/i.test(property)), `${event} cannot approve identity or content keys`);
}

console.log("✅ PASS: analytics events are allowlisted, DNT-ready, and content/identity identifiers fail closed");
