import { Inngest } from "inngest";

/**
 * Inngest client for background job processing.
 * 
 * Used for:
 * - PDF generation (async, with retries)
 * - OpenAI analysis (future: with caching and retries)
 * - Post-purchase processing
 * 
 * Environment variables:
 * - INNGEST_EVENT_KEY (for sending events)
 * - INNGEST_SIGNING_KEY (for receiving events)
 */
export const inngest = new Inngest({
    id: "recruiter-in-your-pocket",
    // Event key is optional in dev mode
    eventKey: process.env.INNGEST_EVENT_KEY,
});
