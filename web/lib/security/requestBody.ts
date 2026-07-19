import "server-only";

function payloadTooLargeError() {
  const err: any = new Error("Request body too large");
  err.code = "PAYLOAD_TOO_LARGE";
  err.httpStatus = 413;
  return err;
}

export async function readTextWithLimit(request: Request, maxBytes: number): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw payloadTooLargeError();
  }

  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    throw payloadTooLargeError();
  }

  return text;
}

export async function readJsonWithLimit<T>(request: Request, maxBytes: number): Promise<T> {
  const text = await readTextWithLimit(request, maxBytes);
  try {
    return JSON.parse(text) as T;
  } catch {
    const err: any = new Error("Invalid JSON");
    err.code = "INVALID_JSON";
    err.httpStatus = 400;
    throw err;
  }
}
