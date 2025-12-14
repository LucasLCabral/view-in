import { useState, useCallback, useEffect } from "react";
import { audioManager, AudioState } from "@/services/AudioManager";

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: (audioUrl: string) => Promise<void>;
  pause: () => void;
  stop: () => void;
  getVolume: () => number;
  state: AudioState;
}

/**
 * Hook React para gerenciar reprodução de áudio
 * Usa o AudioManager centralizado para garantir uma única instância de áudio
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [state, setState] = useState<AudioState>(AudioState.IDLE);

  // Configura callbacks do AudioManager
  useEffect(() => {
    audioManager.setCallbacks({
      onStateChange: (newState) => {
        setState(newState);
        setIsPlaying(newState === AudioState.PLAYING);
      },
      onProgress: (current, total) => {
        setCurrentTime(current);
        setDuration(total);
      },
      onError: (error) => {
        console.error("Erro no player de áudio:", error.message);
      },
    });

    return () => {
      // Cleanup: reseta callbacks mas não destrói o manager (pode ser usado por outros componentes)
      audioManager.setCallbacks({});
    };
  }, []);

  const play = useCallback(async (audioUrl: string): Promise<void> => {
    try {
      await audioManager.play(audioUrl);
    } catch (error) {
      console.error("Erro ao tocar áudio:", error);
      throw error;
    }
  }, []);

  const pause = useCallback(() => {
    audioManager.pause();
  }, []);

  const stop = useCallback(() => {
    audioManager.stop();
  }, []);

  const getVolume = useCallback(() => {
    return audioManager.getVolume();
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    stop,
    getVolume,
    state,
  };
}
