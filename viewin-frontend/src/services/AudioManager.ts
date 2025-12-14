/**
 * AudioManager - Gerenciador centralizado de áudio
 * Implementa padrão Singleton para garantir uma única instância de áudio
 * Inspirado em práticas de Spotify, YouTube e outras big techs
 */

export enum AudioState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  ERROR = "ERROR",
  ENDED = "ENDED",
}

interface AudioItem {
  id: string;
  url: string;
  metadata?: Record<string, any>;
}

interface AudioManagerCallbacks {
  onStateChange?: (state: AudioState) => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onError?: (error: Error) => void;
  onQueueComplete?: () => void;
}

class AudioManager {
  private static instance: AudioManager;
  private audio: HTMLAudioElement;
  private queue: AudioItem[] = [];
  private currentIndex: number = -1;
  private state: AudioState = AudioState.IDLE;
  private callbacks: AudioManagerCallbacks = {};
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private volumeData: Uint8Array | null = null;
  private animationFrameId: number | null = null;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.crossOrigin = "anonymous"; // Permite acesso a áudios de S3
    this.setupEventListeners();
  }

  /**
   * Obtém a instância única do AudioManager (Singleton)
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Configura event listeners do elemento de áudio
   */
  private setupEventListeners(): void {
    this.audio.addEventListener("loadstart", () => {
      this.updateState(AudioState.LOADING);
    });

    this.audio.addEventListener("canplay", () => {
      // Áudio pronto para tocar
    });

    this.audio.addEventListener("playing", () => {
      this.updateState(AudioState.PLAYING);
      this.startVolumeMonitoring();
    });

    this.audio.addEventListener("pause", () => {
      if (this.state !== AudioState.ENDED) {
        this.updateState(AudioState.PAUSED);
      }
      this.stopVolumeMonitoring();
    });

    this.audio.addEventListener("ended", () => {
      this.updateState(AudioState.ENDED);
      this.stopVolumeMonitoring();
      this.playNext();
    });

    this.audio.addEventListener("error", () => {
      const error = new Error(
        `Erro ao carregar áudio: ${this.audio.error?.message || "Desconhecido"}`
      );
      this.handleError(error);
    });

    this.audio.addEventListener("timeupdate", () => {
      if (this.callbacks.onProgress) {
        this.callbacks.onProgress(this.audio.currentTime, this.audio.duration);
      }
    });
  }

  /**
   * Inicia monitoramento de volume para visualização
   */
  private startVolumeMonitoring(): void {
    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        
        // Cria source apenas uma vez
        if (!this.source) {
          this.source = this.audioContext.createMediaElementSource(this.audio);
          this.source.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
        }
        
        this.volumeData = new Uint8Array(this.analyser.frequencyBinCount);
      } catch (error) {
        console.warn("Não foi possível iniciar monitoramento de volume:", error);
      }
    }

    // Resume AudioContext se necessário
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }

    this.updateVolumeData();
  }

  /**
   * Para monitoramento de volume
   */
  private stopVolumeMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Atualiza dados de volume continuamente
   */
  private updateVolumeData(): void {
    if (this.analyser && this.volumeData && this.state === AudioState.PLAYING) {
      this.analyser.getByteFrequencyData(this.volumeData);
      this.animationFrameId = requestAnimationFrame(() => this.updateVolumeData());
    }
  }

  /**
   * Atualiza estado e notifica callbacks
   */
  private updateState(newState: AudioState): void {
    this.state = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  /**
   * Trata erros
   */
  private handleError(error: Error): void {
    this.updateState(AudioState.ERROR);
    this.stopVolumeMonitoring();
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  /**
   * Registra callbacks
   */
  public setCallbacks(callbacks: AudioManagerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Carrega uma fila de áudios para reprodução sequencial
   */
  public loadQueue(items: AudioItem[]): void {
    this.queue = items;
    this.currentIndex = -1;
    this.stop();
  }

  /**
   * Adiciona um item à fila
   */
  public addToQueue(item: AudioItem): void {
    this.queue.push(item);
  }

  /**
   * Limpa a fila
   */
  public clearQueue(): void {
    this.queue = [];
    this.currentIndex = -1;
    this.stop();
  }

  /**
   * Toca um áudio específico ou inicia a fila
   */
  public async play(url?: string): Promise<void> {
    try {
      // Se uma URL foi fornecida, toca diretamente
      if (url) {
        await this.playUrl(url);
        return;
      }

      // Caso contrário, inicia a fila
      if (this.queue.length === 0) {
        throw new Error("Fila de áudio vazia");
      }

      // Se já está tocando, resume
      if (this.state === AudioState.PAUSED) {
        await this.audio.play();
        return;
      }

      // Inicia do primeiro item
      this.currentIndex = 0;
      await this.playCurrentItem();
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Toca uma URL específica
   */
  private async playUrl(url: string): Promise<void> {
    // Para o áudio atual se estiver tocando
    // Aguarda um pouco para garantir que o pause() foi processado
    if (this.state === AudioState.PLAYING || this.state === AudioState.PAUSED) {
      this.audio.pause();
      this.audio.currentTime = 0;
      // Pequeno delay para evitar erro de "play() interrupted by pause()"
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.updateState(AudioState.LOADING);
    this.audio.src = url;
    
    // Aguarda o áudio estar pronto antes de tocar
    return new Promise((resolve, reject) => {
      const handleCanPlay = () => {
        this.audio.removeEventListener('canplay', handleCanPlay);
        this.audio.removeEventListener('error', handleError);
        
        this.audio.play()
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(new Error(`Erro ao tocar áudio: ${(error as Error).message}`));
          });
      };

      const handleError = () => {
        this.audio.removeEventListener('canplay', handleCanPlay);
        this.audio.removeEventListener('error', handleError);
        reject(new Error(`Erro ao carregar áudio: ${this.audio.error?.message || "Desconhecido"}`));
      };

      this.audio.addEventListener('canplay', handleCanPlay, { once: true });
      this.audio.addEventListener('error', handleError, { once: true });
      
      // Timeout de segurança
      setTimeout(() => {
        if (this.audio.readyState < 2) { // HAVE_CURRENT_DATA
          this.audio.removeEventListener('canplay', handleCanPlay);
          this.audio.removeEventListener('error', handleError);
          reject(new Error('Timeout ao carregar áudio'));
        }
      }, 10000);
    });
  }

  /**
   * Toca o item atual da fila
   */
  private async playCurrentItem(): Promise<void> {
    if (this.currentIndex < 0 || this.currentIndex >= this.queue.length) {
      return;
    }

    const item = this.queue[this.currentIndex];
    await this.playUrl(item.url);
  }

  /**
   * Toca o próximo item da fila
   */
  private async playNext(): Promise<void> {
    this.currentIndex++;
    
    if (this.currentIndex >= this.queue.length) {
      // Fila completa
      this.updateState(AudioState.IDLE);
      if (this.callbacks.onQueueComplete) {
        this.callbacks.onQueueComplete();
      }
      return;
    }

    await this.playCurrentItem();
  }

  /**
   * Pausa a reprodução
   */
  public pause(): void {
    if (this.state === AudioState.PLAYING) {
      this.audio.pause();
    }
  }

  /**
   * Para a reprodução completamente
   */
  public stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.stopVolumeMonitoring();
    this.updateState(AudioState.IDLE);
  }

  /**
   * Pula para o próximo item da fila
   */
  public async skipNext(): Promise<void> {
    if (this.currentIndex < this.queue.length - 1) {
      await this.playNext();
    }
  }

  /**
   * Volta para o item anterior da fila
   */
  public async skipPrevious(): Promise<void> {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.playCurrentItem();
    }
  }

  /**
   * Obtém o estado atual
   */
  public getState(): AudioState {
    return this.state;
  }

  /**
   * Obtém volume normalizado (0-1) para visualização
   */
  public getVolume(): number {
    if (!this.volumeData || this.state !== AudioState.PLAYING) {
      return 0;
    }

    const average =
      this.volumeData.reduce((a, b) => a + b, 0) / this.volumeData.length;
    return Math.min(average / 255, 1);
  }

  /**
   * Obtém informações do item atual
   */
  public getCurrentItem(): AudioItem | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.queue.length) {
      return null;
    }
    return this.queue[this.currentIndex];
  }

  /**
   * Obtém progresso atual (0-1)
   */
  public getProgress(): number {
    if (!this.audio.duration) return 0;
    return this.audio.currentTime / this.audio.duration;
  }

  /**
   * Obtém tempo atual e duração
   */
  public getTime(): { currentTime: number; duration: number } {
    return {
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
    };
  }

  /**
   * Define posição da reprodução
   */
  public seek(time: number): void {
    if (time >= 0 && time <= this.audio.duration) {
      this.audio.currentTime = time;
    }
  }

  /**
   * Cleanup - libera recursos
   */
  public destroy(): void {
    this.stop();
    this.clearQueue();
    this.stopVolumeMonitoring();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.source = null;
    this.analyser = null;
    this.volumeData = null;
  }
}

// Exporta instância única
export const audioManager = AudioManager.getInstance();

