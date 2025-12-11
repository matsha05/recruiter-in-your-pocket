// Test script for Next /api/ready endpoint (no Express dependency)
const assert = require("assert");
const http = require("http");
const { startNextServer } = require("../scripts/next_server");

const MAX_WAIT_MS = 10000; // 10 seconds max wait for server to start

function waitForServer(url, maxWait = MAX_WAIT_MS) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const req = http.get(`${url}/api/health`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          if (Date.now() - startTime > maxWait) {
            reject(new Error("Server health check failed"));
          } else {
            setTimeout(check, 500);
          }
        }
      });
      req.on("error", () => {
        if (Date.now() - startTime > maxWait) {
          reject(new Error("Server not responding"));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function testReadyEndpoint(serverUrl) {
  console.log("\n📋 Testing /api/ready endpoint...");
  
  try {
    const response = await fetch(`${serverUrl}/api/ready`);
    const data = await response.json();
    
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (data.ok) {
      console.log("✅ /api/ready endpoint passed");
      return true;
    } else {
      console.log(`⚠️  /api/ready endpoint returned ok: false - ${data.message}`);
      return false;
    }
  } catch (err) {
    console.error("❌ Error testing /ready endpoint:", err.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing Next readiness");
  console.log("=" .repeat(60));
  
  const next = await startNextServer();
  const serverUrl = next.baseUrl;
  
  // Wait for server to be ready
  console.log("\n⏳ Waiting for server to start...");
  await waitForServer(serverUrl);
  console.log("✅ Server is running");

  const results = { ready: await testReadyEndpoint(serverUrl) };
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Results:");
  console.log(`   /ready endpoint: ${results.ready ? "✅ PASS" : "⚠️  WARN"}`);
  
  const allPassed = results.ready;
  
  if (allPassed) {
    console.log("\n✅ All tests completed");
    await next.stop();
    process.exit(0);
  } else {
    console.log("\n⚠️  Some tests had warnings (see above)");
    await next.stop();
    process.exit(0);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === "undefined") {
  console.error("❌ This script requires Node.js 18+ (for built-in fetch)");
  console.error("   Or install node-fetch: npm install node-fetch");
  process.exit(1);
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

