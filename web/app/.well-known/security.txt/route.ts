export const runtime = "nodejs";

export async function GET() {
  const body = [
    "Contact: mailto:support@recruiterinyourpocket.com",
    "Policy: https://recruiterinyourpocket.com/security",
    "Canonical: https://recruiterinyourpocket.com/.well-known/security.txt",
    "Preferred-Languages: en",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
