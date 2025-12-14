/**
 * Utilitário para upload de áudios de resposta para S3
 * Usa presigned URLs geradas pelo backend
 */

interface UploadUrl {
  questionIndex: number;
  presignedUrl: string;
  s3Key: string;
}

interface UploadUrlsResponse {
  sessionId: string;
  uploadUrls: UploadUrl[];
  expiresIn: number;
}

/**
 * Solicita URLs de upload ao backend
 */
export async function requestUploadUrls(
  jobReportId: number,
  numQuestions: number,
  apiUrl: string,
  callbackUrl?: string
): Promise<UploadUrlsResponse> {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}/api/jobReport/generate-upload-urls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jobReportId: jobReportId,
      numQuestions: numQuestions,
      callbackUrl: callbackUrl, // Adiciona callback_url
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request upload URLs: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Faz upload de um áudio para S3 usando presigned URL
 */
export async function uploadAudioToS3(
  audioBlob: Blob,
  presignedUrl: string
): Promise<void> {
  console.log(`🔄 Iniciando upload para S3 (${audioBlob.size} bytes)...`);
  
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "audio/mpeg",
      },
      body: audioBlob,
    });

    console.log(`📡 Resposta S3: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`Failed to upload audio: ${response.status} ${response.statusText}`);
    }
    
    console.log(`✅ Upload para S3 concluído!`);
  } catch (error) {
    console.error(`❌ Erro no upload S3:`, error);
    throw error;
  }
}

/**
 * Gerenciador de upload de múltiplas respostas
 */
export class InterviewUploadManager {
  private sessionId: string | null = null;
  private uploadUrls: Map<number, UploadUrl> = new Map();
  private uploadedCount: number = 0;
  private totalQuestions: number = 0;

  /**
   * Inicializa o manager solicitando URLs de upload
   */
  async initialize(
    jobReportId: number,
    numQuestions: number,
    apiUrl: string,
    callbackUrl?: string
  ): Promise<void> {
    const response = await requestUploadUrls(
      jobReportId,
      numQuestions,
      apiUrl,
      callbackUrl
    );

    this.sessionId = response.sessionId;
    this.totalQuestions = numQuestions;
    this.uploadedCount = 0;

    // Mapeia URLs por índice de pergunta
    response.uploadUrls.forEach((url) => {
      this.uploadUrls.set(url.questionIndex, url);
    });

    console.log(
      `✅ Upload manager inicializado: ${numQuestions} perguntas, session: ${this.sessionId}`
    );
  }

  /**
   * Faz upload de uma resposta
   */
  async uploadAnswer(
    questionIndex: number,
    audioBlob: Blob
  ): Promise<void> {
    const uploadUrl = this.uploadUrls.get(questionIndex);

    if (!uploadUrl) {
      throw new Error(`No upload URL found for question ${questionIndex}`);
    }

    console.log(`📤 Enviando resposta ${questionIndex + 1}/${this.totalQuestions}...`);

    await uploadAudioToS3(audioBlob, uploadUrl.presignedUrl);

    this.uploadedCount++;

    console.log(
      `✅ Resposta ${questionIndex + 1} enviada (${this.uploadedCount}/${this.totalQuestions})`
    );

    // Se todos foram enviados, a lambda será acionada automaticamente pelo S3
    if (this.uploadedCount === this.totalQuestions) {
      console.log("🎉 Todas as respostas enviadas! Aguardando transcrição...");
    }
  }

  /**
   * Retorna o progresso do upload
   */
  getProgress(): { uploaded: number; total: number; percentage: number } {
    return {
      uploaded: this.uploadedCount,
      total: this.totalQuestions,
      percentage: (this.uploadedCount / this.totalQuestions) * 100,
    };
  }

  /**
   * Verifica se todos os uploads foram concluídos
   */
  isComplete(): boolean {
    return this.uploadedCount === this.totalQuestions;
  }

  /**
   * Retorna o session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }
}

