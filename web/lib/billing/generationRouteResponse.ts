import { NextResponse } from "next/server";

export function generationStreamHeaders(requestId: string) {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "x-request-id": requestId,
  };
}

export function singleGenerationStreamEvent(
  requestId: string,
  event: Record<string, unknown>
) {
  return new NextResponse(`${JSON.stringify(event)}\n`, {
    headers: generationStreamHeaders(requestId),
  });
}
