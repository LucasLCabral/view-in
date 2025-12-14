/**
 * Converte um Blob de áudio WebM para WAV usando Web Audio API
 * WAV é melhor para transcrição porque não tem compressão
 */
export async function convertWebMToWAV(webmBlob: Blob): Promise<Blob> {
  // Criar um AudioContext
  const audioContext = new AudioContext();
  
  // Converter Blob para ArrayBuffer
  const arrayBuffer = await webmBlob.arrayBuffer();
  
  // Decodificar o áudio WebM
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Converter AudioBuffer para WAV
  const wavBlob = audioBufferToWAV(audioBuffer);
  
  // Fechar o contexto
  await audioContext.close();
  
  return wavBlob;
}

/**
 * Converte AudioBuffer para formato WAV (Blob)
 */
function audioBufferToWAV(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * numChannels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, length, true);

  // Converter samples para 16-bit PCM
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Converte um Blob de áudio WebM para MP3 (requer biblioteca externa)
 * Alternativa mais leve que WAV, mas requer conversão no backend
 */
export async function convertWebMToMP3(webmBlob: Blob): Promise<Blob> {
  // Nota: Conversão para MP3 no browser requer bibliotecas pesadas como ffmpeg.wasm
  // Recomendação: fazer conversão no backend ou usar WAV
  // Por enquanto, retornamos o WebM original
  console.warn("MP3 conversion not implemented. Use WAV or convert on backend.");
  return webmBlob;
}

/**
 * Cria um URL temporário para o Blob (útil para preview)
 */
export function createAudioURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoga um URL temporário criado com createAudioURL
 */
export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url);
}

