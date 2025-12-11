import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
    try {
        // Forward cookies from the request
        const cookie = request.headers.get("cookie") || "";

        const response = await fetch(`${API_BASE}/api/free-status`, {
            headers: {
                "Cookie": cookie,
            },
        });

        const data = await response.json();

        // Forward any Set-Cookie headers (in case backend updates the cookie)
        const setCookie = response.headers.get("set-cookie");
        const nextResponse = NextResponse.json(data, { status: response.status });

        if (setCookie) {
            nextResponse.headers.set("set-cookie", setCookie);
        }

        return nextResponse;
    } catch (error) {
        console.error("API /free-status error:", error);
        return NextResponse.json(
            { ok: false, free_uses_left: 0 },
            { status: 500 }
        );
    }
}
