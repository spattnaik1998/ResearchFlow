const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.warn("⚠️ ELEVENLABS_API_KEY is not configured");
}

interface TTSOptions {
  voice?: string;
  model?: string;
}

export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ElevenLabs API key is required");
  }

  const voiceId = options.voice || "nPczCjzI2devNBz1zQrH";
  const model = options.model || "eleven_turbo_v2";

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `ElevenLabs API error: ${error.detail?.message || response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return audioDataUrl;
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    throw error;
  }
}

export const VOICE_OPTIONS = {
  nova: {
    id: "nPczCjzI2devNBz1zQrH",
    name: "Nova",
    description: "Professional, clear, and friendly",
  },
  rachel: {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    description: "Warm and natural",
  },
  samuel: {
    id: "2EiwWnXFnvU5JabPnv8n",
    name: "Samuel",
    description: "Deep and authoritative",
  },
  clara: {
    id: "2nUEJrm4NyFWj7BjQn2K",
    name: "Clara",
    description: "Energetic and engaging",
  },
};
