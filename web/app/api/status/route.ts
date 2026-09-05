import { NextResponse } from "next/server";
import { getPublicStatusSnapshot } from "@/lib/launch/readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getPublicStatusSnapshot();
    return NextResponse.json(snapshot, { status: 200 });
  } catch (err) {
    console.error("[Status] Could not build the public status snapshot", err);
    return NextResponse.json(
      {
        ok: false,
        generatedAt: new Date().toISOString(),
        summary: {
          status: "limited",
          title: "We could not check the configuration",
          message: "Try again, or contact support if you are having trouble using the site.",
        },
        services: [],
        incidents: [],
      },
      { status: 200 }
    );
  }
}
