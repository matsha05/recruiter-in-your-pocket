import { NextResponse } from "next/server";

export function streamHeaders(requestId: string) {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "x-request-id": requestId,
  };
}

export function singleStreamEventResponse(requestId: string, event: Record<string, unknown>) {
  return new NextResponse(`${JSON.stringify(event)}\n`, { headers: streamHeaders(requestId) });
}
