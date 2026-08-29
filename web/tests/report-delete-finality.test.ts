import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

async function run() {
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  let queryNumber = 0;
  runtimeModule._load = function loadWithDeleteMocks(request, parent, isMain) {
    if (request === "@/lib/supabase/serverClient") {
      return {
        createSupabaseServerClient: async () => ({
          auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
          from: () => {
            queryNumber += 1;
            const current = queryNumber;
            const builder: any = {
              select: () => builder,
              delete: () => builder,
              eq: () => builder,
              maybeSingle: async () => current === 1
                ? { data: { id: "report-123456" }, error: null }
                : { data: null, error: { code: "READBACK_UNAVAILABLE" } },
              then: (resolve: (value: unknown) => void) => resolve({ error: null }),
            };
            return builder;
          },
        }),
      };
    }
    if (request.startsWith("@/")) {
      return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    }
    return originalLoad(request, parent, isMain);
  };

  try {
    const { DELETE } = require("../app/api/reports/[id]/route") as {
      DELETE: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
    };
    const response = await DELETE(
      new NextRequest("http://localhost/api/reports/report-123456", { method: "DELETE" }),
      { params: Promise.resolve({ id: "report-123456" }) },
    );
    const body = await response.json();
    assert.equal(response.status, 500);
    assert.equal(body.ok, false);
    assert.equal(body.errorCode, "DELETE_VERIFICATION_FAILED");
    assert.notEqual(body.message, "Report deleted.", "a failed readback must never claim deletion success");
  } finally {
    runtimeModule._load = originalLoad;
  }
}

run().then(() => console.log("report delete finality tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
