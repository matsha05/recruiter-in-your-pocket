import "server-only";

export async function readJsonWithLimit<T>(request: Request, maxBytes: number): Promise<T> {
  const text = await request.text();
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > maxBytes) {
    const err: any = new Error("Request body too large");
    err.code = "PAYLOAD_TOO_LARGE";
    err.httpStatus = 413;
    throw err;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const err: any = new Error("Invalid JSON");
    err.code = "INVALID_JSON";
    err.httpStatus = 400;
    throw err;
  }
}

