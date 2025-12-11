import { NextResponse } from "next/server";

const targetBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  "https://recruiterinyourpocket.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${targetBase}/api/resume-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies for Supabase auth
        Cookie: request.headers.get("cookie") || ""
      },
      body: JSON.stringify(body)
    });

    const text = await upstream.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch (err) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "UPSTREAM_NOT_JSON",
          message: "Upstream response was not JSON.",
          raw: text
        },
        { status: 502 }
      );
    }

    return NextResponse.json(json, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "PROXY_ERROR",
        message: err?.message || "Failed to reach analysis service."
      },
      { status: 502 }
    );
  }
}


