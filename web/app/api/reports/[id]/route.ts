import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reportId = params.id;
        const cookie = request.headers.get("cookie") || "";

        const response = await fetch(`${API_BASE}/api/reports/${reportId}`, {
            headers: {
                "Cookie": cookie,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("API /reports/[id] error:", error);
        return NextResponse.json(
            { ok: false, report: null, message: "Failed to fetch report" },
            { status: 500 }
        );
    }
}
