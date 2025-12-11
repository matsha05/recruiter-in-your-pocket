import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
    try {
        // Forward cookies from the request
        const cookie = request.headers.get("cookie") || "";

        const response = await fetch(`${API_BASE}/api/reports`, {
            headers: {
                "Cookie": cookie,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("API /reports error:", error);
        return NextResponse.json(
            { ok: false, reports: [] },
            { status: 500 }
        );
    }
}
