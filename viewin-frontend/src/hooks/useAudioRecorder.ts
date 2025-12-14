import { useState, useRef, useCallback } from "react";
import { convertWebMToWAV } from "@/utils/audioConverter";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioBlob: Blob | null; // WebM original
  audioWAV: Blob | null; // WAV convertido (melhor para transcrição)
  startRecording: (deviceId?: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  resetRecording: () => void;
  getVolume: () => number;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioWAV, setAudioWAV] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRef = useRef<number>(0);

  const startRecording = useCallback(async (deviceId?: string) => {
    try {
      const audioConstraints = deviceId
        ? {
            deviceId: { exact: deviceId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          };
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audioConstraints 
      });
      streamRef.current = stream;

      // Setup audio context for volume analysis
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start volume monitoring
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (analyserRef.current && mediaRecorderRef.current?.state === "recording") {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          volumeRef.current = Math.min(average / 255, 1);
          requestAnimationFrame(checkVolume);
        }
      };
      
      // Setup MediaRecorder first
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        
        // Converter para WAV automaticamente
        try {
          const wavBlob = await convertWebMToWAV(blob);
          setAudioWAV(wavBlob);
        } catch (error) {
          console.error("Error converting to WAV:", error);
          // Se falhar, ainda mantém o WebM
          setAudioWAV(null);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start volume monitoring after recorder starts
      checkVolume();
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioWAV(null);
    audioChunksRef.current = [];
    volumeRef.current = 0;
  }, []);

  const getVolume = useCallback(() => {
    return volumeRef.current;
  }, []);

  return {
    isRecording,
    audioBlob,
    audioWAV,
    startRecording,
    stopRecording,
    resetRecording,
    getVolume,
  };
}

