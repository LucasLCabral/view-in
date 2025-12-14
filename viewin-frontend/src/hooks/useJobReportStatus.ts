import { useState, useEffect, useRef } from "react";

export enum JobReportStatus {
  PENDING = "PENDING",
  AUDIOS_READY = "AUDIOS_READY",
  REPORT_READY = "REPORT_READY",
  COMPLETED = "COMPLETED",
}

export interface PresignedUrlResponse {
  s3_path: string;
  presigned_url: string;
  file_name: string;
}

export interface JobReportStatusResponse {
  status: JobReportStatus;
  audio_urls?: PresignedUrlResponse[];
  report_url?: string;
}

interface UseJobReportStatusReturn {
  status: JobReportStatus | null;
  audioUrls: PresignedUrlResponse[];
  reportUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useJobReportStatus(
  jobReportId: number | null,
  apiUrl: string = "",
  pollInterval: number = 3000
): UseJobReportStatusReturn {
  const [status, setStatus] = useState<JobReportStatus | null>(null);
  const [audioUrls, setAudioUrls] = useState<PresignedUrlResponse[]>([]);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldStopPolling = useRef(false);

  useEffect(() => {
    if (!jobReportId || !apiUrl) {
      return;
    }

    // Reset flag
    shouldStopPolling.current = false;

    // Limpa polling anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const fetchStatus = async () => {
      // Para se já recebeu status final ou já tem reportUrl
      if (shouldStopPolling.current || reportUrl) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("auth_token");
        const headers: HeadersInit = {};
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${apiUrl}/api/jobReport/status/${jobReportId}`, {
          headers,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.statusText}`);
        }

        const data: JobReportStatusResponse = await response.json();
        
        // Converte string para enum se necessário
        let newStatus: JobReportStatus | null = null;
        if (typeof data.status === "string") {
          newStatus = data.status as JobReportStatus;
          if (!Object.values(JobReportStatus).includes(newStatus)) {
            console.warn("Status inválido recebido:", data.status);
            newStatus = null;
          }
        } else {
          newStatus = data.status as JobReportStatus;
        }
        
        setStatus(newStatus);
        
        if (data.audio_urls) {
          setAudioUrls(data.audio_urls);
        }
        
        if (data.report_url) {
          console.log("✅ Report URL recebida:", data.report_url);
          setReportUrl(data.report_url);
          
          // Para polling imediatamente quando receber o report_url
          if (!shouldStopPolling.current) {
            console.log("🛑 Parando polling - Relatório pronto!");
            shouldStopPolling.current = true;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        } else if (newStatus) {
          console.log(`🔍 Status atual: ${newStatus}${data.report_url ? ' (com URL)' : ' (sem URL)'}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Erro ao buscar status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Busca imediatamente
    fetchStatus();

    // Configura polling
    intervalRef.current = setInterval(() => {
      if (!shouldStopPolling.current) {
        fetchStatus();
      }
    }, pollInterval);

    // Cleanup
    return () => {
      shouldStopPolling.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobReportId, apiUrl, pollInterval]);

  return {
    status,
    audioUrls,
    reportUrl,
    isLoading,
    error,
  };
}

