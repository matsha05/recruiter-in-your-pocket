import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const targetBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  "https://recruiterinyourpocket.com";

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, errorCode: "NO_FILE", message: "No file provided." },
        { status: 400 }
      );
    }

    const form = new FormData();
    form.append("file", file);

    const upstream = await fetch(`${targetBase}/api/parse-resume`, {
      method: "POST",
      body: form
    });

    const text = await upstream.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, errorCode: "UPSTREAM_NOT_JSON", message: "Upstream parse failed.", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json(json, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, errorCode: "PROXY_ERROR", message: err?.message || "Failed to parse resume." },
      { status: 502 }
    );
  }
}




