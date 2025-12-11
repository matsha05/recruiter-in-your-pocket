import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const cookie = request.headers.get("cookie") || "";

        const response = await fetch(`${API_BASE}/api/export-pdf`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookie,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { ok: false, message: errorData.message || "Failed to generate PDF" },
                { status: response.status }
            );
        }

        // Return PDF as blob
        const pdfBuffer = await response.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="resume-report.pdf"',
            },
        });
    } catch (error) {
        console.error("API /export-pdf error:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
