import { NextResponse } from "next/server";
import { callOpenAIChat, extractJsonFromText } from "@/lib/backend/openai";
import { JSON_INSTRUCTION, baseTone, loadPromptForMode } from "@/lib/backend/prompts";
import { validateResumeIdeasPayload, validateResumeIdeasRequest } from "@/lib/backend/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }
    const validation = validateResumeIdeasRequest(body);
    if (!validation.ok || !validation.value) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message: validation.message,
          details: { fieldErrors: validation.fieldErrors || {} }
        },
        { status: 400 }
      );
    }

    const { text } = validation.value;
    const systemPrompt = `${baseTone}\n\n${await loadPromptForMode("resume_ideas")}`;
    const userPrompt = `Here is the user's resume text. Read it closely, infer their primary role/discipline and level, and follow the system instructions to surface overlooked achievements that fit their background.

USER INPUT:
${text}`;

    const data = await callOpenAIChat(
      [
        { role: "system", content: JSON_INSTRUCTION },
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      "resume_ideas"
    );

    const rawContent = data?.choices?.[0]?.message?.content;
    const parsedJson = extractJsonFromText(rawContent);
    const payload = validateResumeIdeasPayload(parsedJson);

    return NextResponse.json({ ok: true, data: payload });
  } catch (err: any) {
    const status = err?.httpStatus || 500;
    const code = err?.code || "INTERNAL_SERVER_ERROR";
    const message =
      code === "OPENAI_TIMEOUT"
        ? "This is taking longer than usual. Try again in a moment."
        : code === "OPENAI_NETWORK_ERROR"
          ? "Connection hiccup. Try again in a moment."
          : code === "OPENAI_RESPONSE_PARSE_ERROR" ||
            code === "OPENAI_RESPONSE_SHAPE_INVALID" ||
            code === "OPENAI_RESPONSE_NOT_JSON"
            ? "I couldn't read the response cleanly. Try again."
            : err?.message || "I had trouble pulling those questions. Try again in a moment.";

    return NextResponse.json({ ok: false, errorCode: code, message }, { status });
  }
}

