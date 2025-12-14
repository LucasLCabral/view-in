import { useState, useEffect, useCallback, useRef } from "react";
import { audioManager, AudioState } from "@/services/AudioManager";

interface Question {
  id: string;
  audioUrl: string;
  text?: string;
}

interface UseInterviewAudioQueueReturn {
  isReady: boolean;
  currentStep: "idle" | "introduction" | "question" | "waiting_answer" | "completed";
  currentQuestionIndex: number;
  totalQuestions: number;
  startInterview: () => void;
  moveToNextQuestion: () => void;
  reset: () => void;
}

interface UseInterviewAudioQueueOptions {
  introductionUrl: string | null;
  questions: Question[];
  onIntroductionComplete?: () => void;
  onQuestionComplete?: (questionIndex: number) => void;
  onInterviewComplete?: () => void;
}

/**
 * Hook para gerenciar a fila de reprodução de áudios da entrevista
 * Controla a sequência: Introdução -> Pergunta 1 -> Aguarda Resposta -> Pergunta 2 -> ...
 */
export function useInterviewAudioQueue({
  introductionUrl,
  questions,
  onIntroductionComplete,
  onQuestionComplete,
  onInterviewComplete,
}: UseInterviewAudioQueueOptions): UseInterviewAudioQueueReturn {
  const [currentStep, setCurrentStep] = useState<"idle" | "introduction" | "question" | "waiting_answer" | "completed">("idle");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const hasStartedRef = useRef(false);

  // Verifica se está pronto para começar
  const isReady = Boolean(introductionUrl && questions.length > 0);

  // Configura callbacks do audioManager
  useEffect(() => {
    const handleQueueComplete = () => {
      if (currentStep === "introduction") {
        // Introdução completa -> primeira pergunta
        setCurrentStep("question");
        setCurrentQuestionIndex(0);
        if (onIntroductionComplete) {
          onIntroductionComplete();
        }
      } else if (currentStep === "question") {
        // Pergunta completa -> aguarda resposta
        setCurrentStep("waiting_answer");
        if (onQuestionComplete) {
          onQuestionComplete(currentQuestionIndex);
        }
      }
    };

    audioManager.setCallbacks({
      onQueueComplete: handleQueueComplete,
      onError: (error) => {
        console.error("Erro na reprodução da entrevista:", error.message);
      },
    });

    return () => {
      audioManager.setCallbacks({});
    };
  }, [currentStep, currentQuestionIndex, onIntroductionComplete, onQuestionComplete]);

  // Quando o step muda para "introduction", carrega e toca a introdução
  useEffect(() => {
    if (currentStep === "introduction" && introductionUrl && hasStartedRef.current) {
      audioManager.loadQueue([
        {
          id: "introduction",
          url: introductionUrl,
          metadata: { type: "introduction" },
        },
      ]);
      audioManager.play().catch((error) => {
        console.error("Erro ao tocar introdução:", error);
      });
    }
  }, [currentStep, introductionUrl]);

  // Quando o step muda para "question", carrega e toca a pergunta atual
  const lastPlayedQuestionRef = useRef<string>("");
  
  useEffect(() => {
    if (currentStep === "question" && questions[currentQuestionIndex]) {
      const question = questions[currentQuestionIndex];
      
      // Verifica se a pergunta tem áudio disponível
      if (!question.audioUrl || question.audioUrl.length === 0) {
        console.warn(`⚠️ Pergunta ${currentQuestionIndex + 1} ainda não tem áudio disponível. Aguardando...`);
        return;
      }
      
      // Evita tocar a mesma pergunta múltiplas vezes
      const questionKey = `${question.id}-${currentQuestionIndex}`;
      if (lastPlayedQuestionRef.current === questionKey) {
        return;
      }
      
      lastPlayedQuestionRef.current = questionKey;
      
      audioManager.loadQueue([
        {
          id: question.id,
          url: question.audioUrl,
          metadata: { type: "question", index: currentQuestionIndex },
        },
      ]);
      audioManager.play().catch((error) => {
        console.error("Erro ao tocar pergunta:", error);
        // Reset ref em caso de erro para permitir nova tentativa
        lastPlayedQuestionRef.current = "";
      });
    }
  }, [currentStep, currentQuestionIndex, questions]);

  /**
   * Inicia a entrevista tocando a introdução
   */
  const startInterview = useCallback(() => {
    if (!isReady) {
      console.warn("Entrevista não está pronta para iniciar");
      return;
    }

    hasStartedRef.current = true;
    setCurrentStep("introduction");
    setCurrentQuestionIndex(0);
  }, [isReady]);

  /**
   * Move para a próxima pergunta
   * Chamado após o usuário responder
   */
  const moveToNextQuestion = useCallback(() => {
    console.log(`🎬 moveToNextQuestion chamado. Step atual: ${currentStep}, Index: ${currentQuestionIndex}`);
    
    if (currentStep !== "waiting_answer") {
      console.warn(`⚠️ Não é possível avançar: step atual é "${currentStep}", esperado "waiting_answer"`);
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    console.log(`➡️ Próximo índice será: ${nextIndex} de ${questions.length} perguntas`);

    if (nextIndex >= questions.length) {
      // Entrevista completa
      console.log(`🎉 Entrevista completa! Todas as ${questions.length} perguntas respondidas.`);
      setCurrentStep("completed");
      if (onInterviewComplete) {
        onInterviewComplete();
      }
    } else {
      // Próxima pergunta
      console.log(`📌 Avançando para pergunta ${nextIndex + 1}`);
      setCurrentQuestionIndex(nextIndex);
      setCurrentStep("question");
    }
  }, [currentStep, currentQuestionIndex, questions.length, onInterviewComplete]);

  /**
   * Reseta o estado da entrevista
   */
  const reset = useCallback(() => {
    audioManager.stop();
    audioManager.clearQueue();
    setCurrentStep("idle");
    setCurrentQuestionIndex(0);
    hasStartedRef.current = false;
  }, []);

  return {
    isReady,
    currentStep,
    currentQuestionIndex,
    totalQuestions: questions.length,
    startInterview,
    moveToNextQuestion,
    reset,
  };
}

