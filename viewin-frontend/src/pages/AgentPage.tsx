import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Orb } from "@/components/ui/orb";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { MicSelector } from "@/components/ui/mic-selector";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { X, Send, Play, Disc, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useInterviewAudioQueue } from "@/hooks/useInterviewAudioQueue";
import { useJobReportStatus, JobReportStatus } from "@/hooks/useJobReportStatus";
import { InterviewUploadManager } from "@/utils/audioUpload";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type InterviewStep = "recording" | "confirming" | "processing";

// Mensagens de loading inicial (antes da entrevista)
const initialLoadingMessages = [
  "Generating questions",
  "Creating audio with AI",
  "Preparing your interview",
  "Almost ready",
  "Prepare to shine! ✨",
];

// Mensagens de processamento (após a entrevista)
const processingMessages = [
  "Transcripting your answers",
  "Analisando seu desempenho",
  "Generating detailed report",
  "Evaluating competencies",
  "Finalizing analysis",
];

interface Question {
  id: string;
  audioUrl: string;
  text?: string;
}

export default function AgentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Usa o jobReportId que veio pela navegação
  const jobReportId = location.state?.jobReportId as number | null;

  // Estados da entrevista
  const [introductionUrl, setIntroductionUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState<InterviewStep | null>(null);
  const [recordedAnswers, setRecordedAnswers] = useState<Map<number, Blob>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(0);
  
  // Ref para rastrear se já processamos os áudios (evita reprocessamento)
  const audioProcessedRef = useRef<string>("");

  // Hooks
  const audioPlayer = useAudioPlayer();
  const audioRecorder = useAudioRecorder();
  const uploadManagerRef = useRef<InterviewUploadManager | null>(null);
  
  // Estados da UI
  const [agentState, setAgentState] = useState<"thinking" | "listening" | "talking" | null>(null);
  const [displayText, setDisplayText] = useState<string>("Ready");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // API URL - Frontend sempre chama o backend local
  const API_URL = "http://localhost:8080";
  
  // Callback URL - URL pública do ngrok para callbacks da AWS
  const CALLBACK_URL = import.meta.env.VITE_NGROK_URL;

  // Hook para fazer polling do status do job report
  const { status, audioUrls, reportUrl } = useJobReportStatus(
    jobReportId,
    API_URL,
    3000
  );

  // Hook para gerenciar fila de reprodução da entrevista
  const audioQueue = useInterviewAudioQueue({
    introductionUrl,
    questions,
    onIntroductionComplete: () => {
      setAgentState(null);
      setDisplayText("Ready to answer");
    },
    onQuestionComplete: () => {
      setAgentState(null);
      setDisplayText("Ready to answer");
    },
    onInterviewComplete: () => {
      setStep("processing");
      setCurrentLoadingMessageIndex(0);
    },
  });

  // Determina se deve mostrar o loading
  // Aguarda até que todas as perguntas tenham áudio disponível
  const allQuestionsHaveAudio = questions.length > 0 && 
    questions.every(q => q.audioUrl && q.audioUrl.length > 0);
  
  const isWaitingForAudios = jobReportId !== null && 
    (status === null || 
     status !== JobReportStatus.AUDIOS_READY || 
     audioUrls.length === 0 ||
     !introductionUrl ||
     questions.length === 0 ||
     !allQuestionsHaveAudio);

  // 🧪 Debug removido - console limpo em produção

  // Atualiza mensagens de loading
  useEffect(() => {
    if (isWaitingForAudios || step === "processing") {
      const interval = setInterval(() => {
        setCurrentLoadingMessageIndex((prev) => (prev + 1) % initialLoadingMessages.length);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setCurrentLoadingMessageIndex(0);
    }
  }, [isWaitingForAudios, step]);

  // Atualiza áudios quando estiverem prontos (apenas uma vez ou quando houver mudanças reais)
  useEffect(() => {
    const isAudiosReady = status === JobReportStatus.AUDIOS_READY || 
                         (status !== null && String(status) === String(JobReportStatus.AUDIOS_READY));
    
    if (!isAudiosReady || audioUrls.length === 0) {
      return;
    }

    // Cria uma assinatura única dos áudios recebidos (baseada em URLs)
    const audioSignature = audioUrls
      .map(url => `${url.file_name}:${url.presigned_url || ''}`)
      .sort()
      .join('|');

    // Se já processamos esses mesmos áudios, não reprocessa
    if (audioProcessedRef.current === audioSignature && questions.length > 0) {
      return;
    }

    // Separa introdução e perguntas
    const introAudio = audioUrls.find(url => url.file_name.includes("introducao"));
    const questionAudios = audioUrls
      .filter(url => url.file_name.includes("pergunta"))
      .sort((a, b) => {
        const numA = parseInt(a.file_name.match(/pergunta_(\d+)/)?.[1] || "0");
        const numB = parseInt(b.file_name.match(/pergunta_(\d+)/)?.[1] || "0");
        return numA - numB;
      });

    if (introAudio?.presigned_url && !introductionUrl) {
      setIntroductionUrl(introAudio.presigned_url);
    }

    // Encontra o maior número de pergunta para determinar o total
    let maxQuestionNumber = 0;
    questionAudios.forEach(audio => {
      const match = audio.file_name.match(/pergunta_(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxQuestionNumber) {
          maxQuestionNumber = num;
        }
      }
    });

    // Se não encontrou nenhum número, usa o tamanho da lista como fallback
    if (maxQuestionNumber === 0 && questionAudios.length > 0) {
      maxQuestionNumber = questionAudios.length;
    }

    // Cria um mapa de perguntas por número (índice baseado em 1)
    const questionMap = new Map<number, Question>();
    questionAudios.forEach(audio => {
      const match = audio.file_name.match(/pergunta_(\d+)/);
      if (match && audio.presigned_url) {
        const questionNum = parseInt(match[1]);
        questionMap.set(questionNum, {
          id: `q${questionNum}`,
          audioUrl: audio.presigned_url,
          text: undefined,
        });
      }
    });

    // Cria lista completa de perguntas (1 até maxQuestionNumber)
    // Se uma pergunta ainda não tem áudio, cria um placeholder
    const questionList: Question[] = [];
    for (let i = 1; i <= maxQuestionNumber; i++) {
      if (questionMap.has(i)) {
        questionList.push(questionMap.get(i)!);
      } else {
        // Placeholder para pergunta que ainda não tem áudio
        questionList.push({
          id: `q${i}`,
          audioUrl: "", // Será atualizado quando o áudio chegar
          text: undefined,
        });
      }
    }

    const questionsWithAudio = questionList.filter(q => q.audioUrl && q.audioUrl.length > 0).length;
    
    // Sempre atualiza se a assinatura mudou (novos áudios chegaram)
    // A verificação de assinatura no início já garante que não reprocessa o mesmo
    console.log(`✅ ${maxQuestionNumber} perguntas detectadas (${questionsWithAudio}/${maxQuestionNumber} com áudio disponível)`);
    setQuestions(questionList);
    audioProcessedRef.current = audioSignature;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, audioUrls, introductionUrl]);

  // Sincroniza estado do áudio com a UI
  useEffect(() => {
    if (audioQueue.currentStep === "introduction" || audioQueue.currentStep === "question") {
      setAgentState("talking");
      setDisplayText("Speaking");
    }
  }, [audioQueue.currentStep]);

  // Handle recording state
  useEffect(() => {
    if (step === "recording" && audioRecorder.isRecording) {
      setAgentState("listening");
      setDisplayText("Listening");
    } else if (step === "confirming") {
      setAgentState(null);
      setDisplayText("Review your answer");
    }
  }, [step, audioRecorder.isRecording]);

  // Handle processing state
  useEffect(() => {
    if (step === "processing") {
      // Reset index quando entrar em processing
      setCurrentLoadingMessageIndex(0);
      
      const interval = setInterval(() => {
        setCurrentLoadingMessageIndex((prev) => {
          if (prev < processingMessages.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000); // 3 segundos entre mensagens

      return () => clearInterval(interval);
    }
  }, [step]);

  // Navega para o relatório quando estiver pronto
  useEffect(() => {
    if (step === "processing" && reportUrl) {
      console.log("✅ Relatório pronto! Navegando...");
      setTimeout(() => {
        navigate("/interview-report", {
          state: { reportUrl },
        });
      }, 1000);
    }
  }, [step, reportUrl, navigate]);

  // Start interview
  const handleStartInterview = async () => {
    if (!audioQueue.isReady) return;
    
    // Conta apenas perguntas que têm áudio disponível
    const questionsWithAudio = questions.filter(q => q.audioUrl && q.audioUrl.length > 0);
    
    if (questionsWithAudio.length === 0) {
      alert("Aguarde os áudios das perguntas estarem prontos.");
      return;
    }
    
    // Inicializa upload manager com o número total de perguntas (não apenas as com áudio)
    // O número total é baseado no maior índice encontrado
    const totalQuestions = questions.length;
    
    // Inicializa upload manager
    try {
      const uploadManager = new InterviewUploadManager();
      await uploadManager.initialize(
        jobReportId!,
        totalQuestions,
        API_URL,
        CALLBACK_URL
      );
      uploadManagerRef.current = uploadManager;
      
      audioQueue.startInterview();
    } catch (error) {
      console.error("Erro ao inicializar upload manager:", error);
      alert("Erro ao iniciar entrevista. Tente novamente.");
    }
  };

  // Start recording
  const handleStartRecording = async () => {
    try {
      await audioRecorder.startRecording(selectedDeviceId || undefined);
      setStep("recording");
      setAgentState("listening");
      setDisplayText("Listening");
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      alert("Erro ao iniciar gravação. Verifique as permissões do microfone.");
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    await audioRecorder.stopRecording();
    setStep("confirming");
    setAgentState(null);
    setDisplayText("Listening");
  };

  // Confirm and send answer
  const handleConfirmAnswer = async () => {
    const audioToUse = audioRecorder.audioWAV || audioRecorder.audioBlob;
    if (!audioToUse || !uploadManagerRef.current) return;

    setIsLoading(true);
    
    try {
      console.log(`📝 Submetendo resposta ${audioQueue.currentQuestionIndex + 1}...`);
      
      // Faz upload direto para S3
      await uploadManagerRef.current.uploadAnswer(
        audioQueue.currentQuestionIndex,
        audioToUse
      );
      
      console.log(`✅ Upload concluído para pergunta ${audioQueue.currentQuestionIndex + 1}`);

      // Save recorded answer locally
      const newAnswers = new Map(recordedAnswers);
      newAnswers.set(audioQueue.currentQuestionIndex, audioToUse);
      setRecordedAnswers(newAnswers);

      // Reset recording
      audioRecorder.resetRecording();
      setStep(null);

      console.log(`🎯 Avançando para próxima pergunta...`);
      
      // Move to next question or complete
      audioQueue.moveToNextQuestion();
      
      console.log(`✅ Avançou! Próxima pergunta: ${audioQueue.currentQuestionIndex + 1}`);
      
      // Se todos foram enviados, mostra mensagem
      if (uploadManagerRef.current.isComplete()) {
        console.log("🎉 Todas as respostas enviadas! Processando...");
      }
    } catch (error) {
      console.error("❌ Erro ao enviar resposta:", error);
      alert("Erro ao enviar resposta. Tente novamente.");
    } finally {
      console.log(`🔓 Liberando loading...`);
      setIsLoading(false);
    }
  };

  // Retry recording
  const handleRetryRecording = () => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current = null;
      setIsPlayingRecording(false);
    }
    audioRecorder.resetRecording();
    setStep(null);
    setAgentState(null);
    setDisplayText("Ready to answer");
  };

  // Play recorded audio
  const handlePlayRecording = useCallback(() => {
    const audioToPlay = audioRecorder.audioWAV || audioRecorder.audioBlob;
    if (!audioToPlay) return;

    // Stop current playback if playing
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current = null;
    }

    const audio = new Audio(URL.createObjectURL(audioToPlay));
    playbackAudioRef.current = audio;
    
    audio.onended = () => {
      setIsPlayingRecording(false);
      playbackAudioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlayingRecording(false);
      playbackAudioRef.current = null;
    };

    audio.play();
    setIsPlayingRecording(true);
  }, [audioRecorder.audioBlob, audioRecorder.audioWAV]);

  // Pause playback
  const handlePausePlayback = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current = null;
      setIsPlayingRecording(false);
    }
  }, []);

  // Cleanup playback on unmount
  useEffect(() => {
    return () => {
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
        playbackAudioRef.current = null;
      }
    };
  }, []);

  // Get volumes for orb
  const getInputVolume = () => {
    if (step === "recording" && audioRecorder.isRecording) {
      return audioRecorder.getVolume();
    }
    return 0;
  };

  const getOutputVolume = () => {
    if (audioPlayer.isPlaying) {
      return audioPlayer.getVolume();
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Loading Screen - mostra enquanto os áudios não estiverem prontos */}
      <AnimatePresence>
        {(step === "processing" || (jobReportId !== null && isWaitingForAudios)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex items-center justify-center"
          >
            <div className="text-center space-y-8 max-w-md px-6">
              {/* Loader Component - Static */}
              <div className="flex flex-col items-center justify-center gap-8 p-8">
                {/* Loader Visual - Static */}
                <div className="relative size-40">
                  <motion.div
                    className="relative size-40"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: [0.4, 0, 0.6, 1],
                    }}
                  >
                    {/* Outer elegant ring with shimmer */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, rgb(59, 130, 246) 90deg, transparent 180deg)`,
                        mask: `radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)`,
                        WebkitMask: `radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)`,
                        opacity: 0.8,
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    {/* Primary animated ring with gradient */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, rgb(59, 130, 246) 120deg, rgba(59, 130, 246, 0.5) 240deg, transparent 360deg)`,
                        mask: `radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)`,
                        WebkitMask: `radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)`,
                        opacity: 0.9,
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: [0.4, 0, 0.6, 1],
                      }}
                    />
                    {/* Secondary elegant ring - counter rotation */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from 180deg, transparent 0deg, rgba(59, 130, 246, 0.6) 45deg, transparent 90deg)`,
                        mask: `radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)`,
                        WebkitMask: `radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)`,
                        opacity: 0.35,
                      }}
                      animate={{
                        rotate: [0, -360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: [0.4, 0, 0.6, 1],
                      }}
                    />
                    {/* Accent particles */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from 270deg, transparent 0deg, rgba(59, 130, 246, 0.4) 20deg, transparent 40deg)`,
                        mask: `radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)`,
                        WebkitMask: `radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)`,
                        opacity: 0.5,
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                </div>

                {/* Animated Title */}
                <div className="space-y-3 max-w-80">
                  {/* Fixed height container for title to prevent layout shift */}
                  <div className="min-h-[60px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={currentLoadingMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="text-lg/tight font-semibold text-black/90 tracking-[-0.02em] leading-[1.15] antialiased text-center"
                      >
                        {step === "processing" 
                          ? processingMessages[currentLoadingMessageIndex]
                          : initialLoadingMessages[currentLoadingMessageIndex]}
                      </motion.h1>
                    </AnimatePresence>
                  </div>
                  
                  {/* Subtitle */}
                  <motion.p
                    className="text-base/relaxed text-black/60 font-normal tracking-[-0.01em] leading-[1.45] antialiased text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.8,
                      duration: 0.8,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {step === "processing" 
                      ? "This may take up to 5 minutes"
                      : "Preparing your success"}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">
            View:<span className="text-blue-500">in</span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="rounded-full border-gray-300"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </header>

      {/* Main Content - Orb centered */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="aspect-square w-full max-w-[400px] mx-auto">
            <Orb
              colors={["#3b82f6", "#8aceff"]}
              agentState={agentState}
              getInputVolume={getInputVolume}
              getOutputVolume={getOutputVolume}
              className="w-full h-full"
            />
          </div>

          {/* Agent Status */}
          <div className="mt-8 text-center min-h-[60px] flex items-center justify-center">
            <ShimmeringText text={displayText} />
          </div>
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="w-full border-t border-gray-200 bg-white px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Controls based on step */}
          {step !== "processing" && !isWaitingForAudios && (
            <div className="flex items-center justify-center">
              {audioQueue.currentStep === "idle" && audioQueue.isReady && (
                <Button
                  size="lg"
                  onClick={handleStartInterview}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Interview
                </Button>
              )}

              {audioQueue.currentStep !== "idle" && (
                <Card className={cn(
                  "m-0 w-full max-w-2xl border p-0 shadow-none",
                  (audioQueue.currentStep === "introduction" || audioQueue.currentStep === "question") && "opacity-50 pointer-events-none"
                )}>
                  <div className="flex items-center justify-between gap-2 p-2">
                    {/* Live Waveform */}
                    <div className="h-8 w-[120px] md:h-10 md:w-[200px]">
                      <div
                        className={cn(
                          "flex h-full items-center gap-2 rounded-md py-1",
                          "bg-gray-50"
                        )}
                      >
                        <div className="h-full flex-1">
                          <div className="relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-sm">
                            <LiveWaveform
                              key={step}
                              active={audioRecorder.isRecording && step === "recording"}
                              processing={step === "confirming" && !audioRecorder.isRecording}
                              deviceId={selectedDeviceId || undefined}
                              barWidth={3}
                              barGap={1}
                              barRadius={4}
                              fadeEdges={true}
                              fadeWidth={24}
                              sensitivity={1.8}
                              smoothingTimeConstant={0.85}
                              height={20}
                              mode="scrolling"
                              barColor="#3b82f6"
                              className={cn(
                                "h-full w-full transition-opacity duration-300",
                                (audioQueue.currentStep === "waiting_answer" && !step) && "opacity-0"
                              )}
                            />
                            {(audioQueue.currentStep === "waiting_answer" && !step) && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500 text-[10px] font-medium">
                                  Start Recording
                                </span>
                              </div>
                            )}
                            {(audioQueue.currentStep === "introduction" || audioQueue.currentStep === "question") && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500 text-[10px] font-medium">
                                  Agent is speaking...
                                </span>
                              </div>
                            )}
                            {step === "confirming" && !audioRecorder.isRecording && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500 text-[10px] font-medium">
                                  Ready to Send
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center">
                      <MicSelector
                        value={selectedDeviceId}
                        onValueChange={setSelectedDeviceId}
                        muted={step !== "recording" || !audioRecorder.isRecording}
                        onMutedChange={() => {}}
                        disabled={
                          isLoading || 
                          audioRecorder.isRecording || 
                          audioQueue.currentStep === "introduction" || 
                          audioQueue.currentStep === "question"
                        }
                      />
                      <Separator orientation="vertical" className="mx-1 -my-2.5" />
                      
                      {/* Start recording button */}
                      {audioQueue.currentStep === "waiting_answer" && !step && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleStartRecording}
                          aria-label="Start recording"
                        >
                          <Disc className="h-5 w-5 text-blue-500" />
                        </Button>
                      )}

                      {/* Stop recording button */}
                      {step === "recording" && audioRecorder.isRecording && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleStopRecording}
                          aria-label="Stop recording"
                        >
                          <Pause className="h-5 w-5 text-blue-600" />
                        </Button>
                      )}

                      {/* Playback controls */}
                      {step === "confirming" && (audioRecorder.audioBlob || audioRecorder.audioWAV) && (
                        <>
                          {!isPlayingRecording ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handlePlayRecording}
                              aria-label="Play recording"
                            >
                              <Play className="h-5 w-5 text-blue-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handlePausePlayback}
                              aria-label="Pause playback"
                            >
                              <Pause className="h-5 w-5 text-blue-500" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRetryRecording}
                            disabled={isLoading}
                            aria-label="Delete recording"
                          >
                            <Trash2 className="h-5 w-5 text-blue-500" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleConfirmAnswer}
                            disabled={isLoading}
                            aria-label="Send answer"
                          >
                            <Send className="h-5 w-5 text-blue-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

