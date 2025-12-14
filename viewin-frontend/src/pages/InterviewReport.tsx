import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { InterviewReport as InterviewReportType } from "@/types/report";
import { mapReportToComponentFormat } from "@/types/report";

interface Feedback {
  question: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export default function InterviewReport() {
  const location = useLocation();
  const reportUrl = location.state?.reportUrl as string | undefined;
  const [overallScore, setOverallScore] = useState<number>(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportUrl) {
        setError("Nenhuma URL de relatório fornecida");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("🔍 Buscando relatório em:", reportUrl);

        // Busca o relatório do S3 usando a URL pré-assinada
        const response = await fetch(reportUrl);
        if (!response.ok) {
          throw new Error(`Falha ao buscar relatório: ${response.status} ${response.statusText}`);
        }

        const reportData: InterviewReportType = await response.json();
        console.log("✅ Relatório carregado:", reportData);
        
        // Valida se o relatório tem os campos necessários
        if (!reportData.overall_score || !reportData.avaliacao_por_pergunta) {
          console.error("❌ Relatório inválido - campos faltando:", reportData);
          throw new Error("Relatório está em formato inválido");
        }
        
        // Mapeia o formato da API para o formato do componente
        const mapped = mapReportToComponentFormat(reportData);
        console.log("📊 Dados mapeados:", mapped);
        setOverallScore(mapped.overallScore);
        setFeedbacks(mapped.feedbacks);
      } catch (err) {
        console.error("❌ Erro ao buscar relatório:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar relatório: {error}</p>
          <Link to="/dashboard">
            <Button className="mt-4">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Verifica se há dados para exibir
  if (!isLoading && feedbacks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum feedback encontrado no relatório</p>
          <p className="text-sm text-gray-500 mt-2">O relatório pode estar vazio ou em formato incorreto</p>
          <Link to="/dashboard">
            <Button className="mt-4">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageScore =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length
      : overallScore;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
            View:<span className="text-blue-500">in</span>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Link to="/dashboard">
              <Button size="sm" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Interview Report
          </h1>
          <p className="text-lg text-gray-600">
            Detailed analysis of your interview performance
          </p>
        </motion.div>

        {/* Overall Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Main Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl p-8 border border-gray-200"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-gray-600 mb-2">Overall Score</p>
              <div className="text-7xl font-bold text-blue-500 mb-2">
                {overallScore.toFixed(1)}
              </div>
              <p className="text-gray-600">out of 10</p>
              <p className="text-sm text-gray-500 mt-4">
                Based on {feedbacks.length} questions
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Strengths
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {feedbacks.reduce((sum, f) => sum + f.strengths.length, 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Improvements
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {feedbacks.reduce((sum, f) => sum + f.improvements.length, 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Average
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {averageScore.toFixed(1)}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Question-by-Question Feedback */}
        {feedbacks.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Question-by-Question Feedback
            </h3>

            <div className="space-y-6">
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Question Header */}
                  <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Question {index + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < Math.round(feedback.score)
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {feedback.question}
                        </p>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-500">
                            {feedback.score}
                          </div>
                          <div className="text-xs text-gray-500">/ 10</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="p-6">
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {feedback.feedback}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            Strengths
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {feedback.strengths.map((strength, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-green-500 mt-1">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            Areas for Improvement
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {feedback.improvements.map((improvement, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <Link to="/detailed-reports">
            <Button
              variant="outline"
              className="rounded-full border-gray-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
