/**
 * Tipos TypeScript para o relatório de entrevista
 * Este arquivo define a estrutura esperada do JSON retornado pela API
 */

export interface QuestionFeedback {
  question?: string;
  pergunta?: string; // Formato em português da Lambda
  score: number; // 0-10
  feedback: string;
  strengths?: string[];
  pontos_fortes?: string[]; // Formato em português da Lambda
  improvements?: string[];
  melhorias?: string[]; // Formato em português da Lambda
}

export interface CompetencyEvaluation {
  comunicacao?: number;
  conhecimento_tecnico?: number;
  resolucao_problemas?: number;
  trabalho_equipe?: number;
  confianca?: number;
  [key: string]: number | undefined; // Permite outras competências
}

export interface InterviewReport {
  overall_score: number; // 0-10
  analise_geral?: string;
  pontos_fortes_gerais?: string[];
  pontos_atencao_gerais?: string[];
  recomendacoes?: string[];
  avaliacao_por_pergunta: QuestionFeedback[];
  avaliacao_por_competencia?: CompetencyEvaluation;
  session_id?: string;
  transcriptions_count?: number;
  transcription_files?: string[];
}

/**
 * Mapeia o JSON retornado pela API para o formato esperado pelo componente InterviewReport
 * Suporta tanto formato em inglês quanto português
 */
export function mapReportToComponentFormat(report: InterviewReport) {
  return {
    overallScore: report.overall_score,
    feedbacks: report.avaliacao_por_pergunta.map((item) => ({
      question: item.question || item.pergunta || "Pergunta não disponível",
      score: item.score,
      feedback: item.feedback,
      strengths: item.strengths || item.pontos_fortes || [],
      improvements: item.improvements || item.melhorias || [],
    })),
  };
}
