import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";

const WEB_ROOT = path.resolve(__dirname, "../..");
const requireExtension = createRequire(path.resolve(WEB_ROOT, "../extension/package.json"));
const { build } = requireExtension("esbuild");
const ORIGIN = "http://127.0.0.1:3100";
let harnessScript = "";

// The root layout mounts the Toaster through ToasterLauncher, which loads it
// after hydration. A toast raised before it arrives, such as one from a page's
// mount effect, must still appear, and later toasts must keep working.
test.beforeAll(async () => {
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React, {useEffect} from "react";
        import {createRoot} from "react-dom/client";
        import {toast} from "sonner";
        import {ToasterLauncher} from "@/components/ToasterLauncher";
        function Page() {
          useEffect(() => { toast.error("Raised before the Toaster loaded"); }, []);
          return <button onClick={() => toast.success("Raised after the Toaster loaded")}>Raise a toast</button>;
        }
        createRoot(document.getElementById("root")).render(<><Page /><ToasterLauncher /></>);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "toaster-launcher-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    define: { "process.env.NODE_ENV": JSON.stringify("test") },
  });
  harnessScript = result.outputFiles[0].text;
});

test("toasts raised before and after the Toaster loads both appear", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === ORIGIN && url.pathname === "/toaster-harness") return route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><title>Toaster launcher browser contract</title></head>
        <body><main id="root"></main><script src="/toaster-harness.js"></script></body></html>`,
    });
    if (url.origin === ORIGIN && url.pathname === "/toaster-harness.js") {
      return route.fulfill({ contentType: "text/javascript", body: harnessScript });
    }
    if (url.origin === ORIGIN && url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unexpected browser request in Toaster harness: ${url.origin}${url.pathname}`);
  });
  await page.goto(`${ORIGIN}/toaster-harness`);

  const early = page.locator("[data-sonner-toast]").filter({ hasText: "Raised before the Toaster loaded" });
  await expect(early).toHaveCount(1);
  await expect(early).toHaveAttribute("data-type", "error");

  await page.getByRole("button", { name: "Raise a toast" }).click();
  const later = page.locator("[data-sonner-toast]").filter({ hasText: "Raised after the Toaster loaded" });
  await expect(later).toHaveCount(1);
  await expect(later).toHaveAttribute("data-type", "success");
  await expect(early).toHaveCount(1);
});
