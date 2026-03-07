/**
 * Extension CORS launch gate tests
 *
 * Verifies that extension endpoints only echo explicitly configured origins.
 */

function test(name: string, fn: () => void | boolean) {
  try {
    const result = fn();
    if (result === false) {
      console.log(`❌ FAIL: ${name}`);
      return false;
    }
    console.log(`✅ PASS: ${name}`);
    return true;
  } catch (err: any) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${err.message}`);
    return false;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  process.env.RIYP_EXTENSION_ORIGINS = "chrome-extension://abc123";

  const { buildExtensionCorsHeaders, isAllowedExtensionOrigin } = await import("../lib/extension/cors");

  let passed = 0;
  let failed = 0;

  if (test("Allows configured exact extension origin", () => {
    return isAllowedExtensionOrigin("chrome-extension://abc123") === true;
  })) passed++; else failed++;

  if (test("Rejects unconfigured extension origin", () => {
    return isAllowedExtensionOrigin("chrome-extension://evil999") === false;
  })) passed++; else failed++;

  if (test("Does not echo untrusted origin in CORS headers", () => {
    const req = { headers: new Headers({ origin: "chrome-extension://evil999" }) } as any;
    const headers = buildExtensionCorsHeaders(req, ["GET", "OPTIONS"]);
    assert(!headers["Access-Control-Allow-Origin"], "unexpected allow-origin header present");
    return true;
  })) passed++; else failed++;

  if (test("Echoes configured exact origin in CORS headers", () => {
    const req = { headers: new Headers({ origin: "chrome-extension://abc123" }) } as any;
    const headers = buildExtensionCorsHeaders(req, ["GET", "OPTIONS"]);
    return headers["Access-Control-Allow-Origin"] === "chrome-extension://abc123";
  })) passed++; else failed++;

  console.log("\n========================================");
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log("========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
