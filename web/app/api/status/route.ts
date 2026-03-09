import { NextResponse } from "next/server";
import { getPublicStatusSnapshot } from "@/lib/launch/readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getPublicStatusSnapshot();
    return NextResponse.json(snapshot, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        generatedAt: new Date().toISOString(),
        summary: {
          status: "limited",
          title: "Status temporarily unavailable",
          message: err?.message || "We could not load the public status summary right now.",
        },
        services: [],
        incidents: [],
      },
      { status: 200 }
    );
  }
}
