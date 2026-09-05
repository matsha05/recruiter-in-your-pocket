/** A deliberately authored message from an API response or a known UI state. */
export class ClientActionError extends Error {
  constructor(message: unknown, fallback: string) {
    super(typeof message === "string" && message.trim() ? message : fallback);
    this.name = "ClientActionError";
  }
}

/** Browser, parser, and SDK exceptions are diagnostics, not customer messages. */
export function getClientActionError(error: unknown, fallback: string): string {
  return error instanceof ClientActionError ? error.message : fallback;
}
