import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { inngestFunctions } from "@/lib/inngest/functions";

/**
 * Inngest webhook handler.
 * 
 * This route is called by Inngest to invoke registered functions.
 * 
 * Setup:
 * 1. Run `npx inngest-cli@latest dev` locally to test
 * 2. Deploy and add INNGEST_SIGNING_KEY to production env
 */
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: inngestFunctions,
});
