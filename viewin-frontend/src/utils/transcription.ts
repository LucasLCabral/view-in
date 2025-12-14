/**
 * Utilitários para transcrição de áudio
 * Suporta múltiplas APIs: ElevenLabs, OpenAI Whisper, etc.
 */

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
}

export interface TranscriptionOptions {
  language?: string; // Código do idioma (ex: "pt", "en")
  model?: string; // Modelo específico da API
}

/**
 * Transcreve áudio usando ElevenLabs API
 * Requer: VITE_ELEVENLABS_API_KEY no .env
 */
export async function transcribeWithElevenLabs(
  audioBlob: Blob,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_ELEVENLABS_API_KEY não configurada no .env");
  }

  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");
  if (options?.language) {
    formData.append("language", options.language);
  }

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs transcription failed: ${error}`);
  }

  const data = await response.json();
  return {
    text: data.text || "",
    confidence: data.confidence,
    language: data.language,
  };
}

/**
 * Transcreve áudio usando OpenAI Whisper API
 * Requer: VITE_OPENAI_API_KEY no .env
 */
export async function transcribeWithOpenAI(
  audioBlob: Blob,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_OPENAI_API_KEY não configurada no .env");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");
  formData.append("model", options?.model || "whisper-1");
  if (options?.language) {
    formData.append("language", options.language);
  }

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI transcription failed: ${error}`);
  }

  const data = await response.json();
  return {
    text: data.text || "",
    language: data.language,
  };
}

/**
 * Transcreve áudio usando sua própria API backend
 * Útil quando você tem um backend que processa a transcrição
 */
export async function transcribeWithBackend(
  audioBlob: Blob,
  apiUrl: string,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");
  if (options?.language) {
    formData.append("language", options.language);
  }
  if (options?.model) {
    formData.append("model", options.model);
  }

  const response = await fetch(`${apiUrl}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Backend transcription failed: ${error}`);
  }

  const data = await response.json();
  return {
    text: data.text || "",
    confidence: data.confidence,
    language: data.language,
  };
}

/**
 * Função genérica que tenta transcrever usando a API configurada
 * Verifica qual API está disponível e usa ela
 */
export async function transcribeAudio(
  audioBlob: Blob,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  // Tenta usar backend primeiro (se configurado)
  const backendUrl = import.meta.env.VITE_API_GATEWAY_URL;
  if (backendUrl) {
    try {
      return await transcribeWithBackend(audioBlob, backendUrl, options);
    } catch (error) {
      console.warn("Backend transcription failed, trying alternatives:", error);
    }
  }

  // Tenta ElevenLabs
  if (import.meta.env.VITE_ELEVENLABS_API_KEY) {
    try {
      return await transcribeWithElevenLabs(audioBlob, options);
    } catch (error) {
      console.warn("ElevenLabs transcription failed, trying alternatives:", error);
    }
  }

  // Tenta OpenAI
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    try {
      return await transcribeWithOpenAI(audioBlob, options);
    } catch (error) {
      console.warn("OpenAI transcription failed:", error);
    }
  }

  throw new Error("Nenhuma API de transcrição configurada. Configure VITE_API_GATEWAY_URL, VITE_ELEVENLABS_API_KEY ou VITE_OPENAI_API_KEY");
}

