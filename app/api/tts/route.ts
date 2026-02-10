import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";
import { TTSResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text, voice } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: "Text must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const maxLength = 5000;
    if (text.length > maxLength) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: `Text must be less than ${maxLength} characters`,
        },
        { status: 400 }
      );
    }

    const audioDataUrl = await textToSpeech(text.trim(), {
      voice: voice || "nova",
    });

    const response: TTSResponse = {
      audioUrl: audioDataUrl,
      duration: Math.ceil(text.split(/\s+/).length / 2.5),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("TTS API error:", error);

    const message = error instanceof Error ? error.message : "Audio generation failed";

    return NextResponse.json(
      {
        error: "Audio generation failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
