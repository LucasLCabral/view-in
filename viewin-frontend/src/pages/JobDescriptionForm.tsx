import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Briefcase } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/hooks/useAuth"

const loadingMessages = [
  "Loading...",
  "We are generating your future interview",
  "You will rock it!",
  "Preparing personalized questions...",
  "Almost there!",
  "Get ready to shine! ✨"
]

export default function JobDescriptionForm() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    location: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { 
        state: { 
          message: "Por favor, faça login para criar um job report" 
        } 
      })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 5000) // Aumentado de 2000ms para 5000ms (5 segundos)
      return () => clearInterval(interval)
    } else {
      setCurrentMessageIndex(0)
    }
  }, [isSubmitting])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Frontend sempre chama o backend local
      const apiUrl = "http://localhost:8080"
      
      // URL do ngrok (apenas para callbacks da AWS, não para o frontend chamar)
      const callbackUrl = import.meta.env.VITE_NGROK_URL || "http://localhost:8080"

      console.log("Criando job report com:", { callbackUrl, apiUrl, formData })

      // Verifica se está autenticado antes de fazer a requisição
      if (!isAuthenticated) {
        throw new Error("Você precisa estar logado para criar um job report")
      }

      // Usa o hook useAuth para obter os headers com o token
      const authHeaders = getAuthHeaders()
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(authHeaders.Authorization && { Authorization: authHeaders.Authorization })
      }

      // Normaliza a descrição: remove espaços/linhas em excesso mas mantém a estrutura
      const normalizeDescription = (text: string) => {
        return text
          .replace(/\n{3,}/g, '\n\n') // Máximo 2 quebras de linha consecutivas
          .replace(/[ \t]{3,}/g, '  ') // Máximo 2 espaços consecutivos
          .trim()
      }

      // Faz POST para criar o job report (chama o backend local)
      const response = await fetch(`${apiUrl}/api/jobReport/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          company: formData.company.trim(),
          title: formData.title.trim(),
          description: normalizeDescription(formData.description),
          callbackUrl: callbackUrl, // Esta URL será enviada para a AWS para callbacks
        }),
      })

      if (!response.ok) {
        let errorMessage = `Erro ao criar job report (${response.status})`
        const responseText = await response.text()
        try {
          const errorData = JSON.parse(responseText)
          // Se for erro de validação (400), mostra as mensagens específicas
          if (response.status === 400 && typeof errorData === 'object') {
            const validationErrors = Object.entries(errorData)
              .map(([field, message]) => {
                const fieldName = field === 'description' ? 'Descrição' : 
                                 field === 'company' ? 'Empresa' : 
                                 field === 'title' ? 'Título' : field
                return `${fieldName}: ${message}`
              })
              .join('\n')
            errorMessage = `Erro de validação:\n${validationErrors}`
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          // Se não conseguir parsear JSON, usa o texto da resposta
          if (responseText) {
            errorMessage = responseText
          }
        }
        console.error("Erro na resposta:", response.status, errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Job report criado com sucesso:", data)
      
      const newJobReportId = data.jobReportId || data.job_report_id || null
      
      if (!newJobReportId) {
        throw new Error("ID do job report não retornado pelo servidor")
      }
      
      // Navega imediatamente para /agent com o jobReportId
      // O loading será mostrado na AgentPage enquanto os áudios não estiverem prontos
      navigate("/agent", {
        state: {
          jobReportId: newJobReportId,
        },
      })
    } catch (error) {
      console.error("Erro ao enviar:", error)
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao criar job report: ${errorMessage}. Verifique o console para mais detalhes.`)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Loading Screen */}
      <AnimatePresence>
        {isSubmitting && (
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
                <div className="space-y-3 max-w-64">
                  {/* Fixed height container for title to prevent layout shift */}
                  <div className="min-h-[60px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={currentMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="text-lg/tight font-semibold text-black/90 tracking-[-0.02em] leading-[1.15] antialiased text-center"
                      >
                        {loadingMessages[currentMessageIndex]}
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
                    Preparing your success
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold">
              View:<span className="text-blue-500">in</span>
            </Link>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-8 lg:px-16 xl:px-24 2xl:px-32 py-12">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row">
          {/* Left Panel - Informational */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
            <div className="max-w-lg space-y-4">
              {/* Tag/Badge */}
              <div className="flex">
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-xl">
                  <Briefcase className="size-4" />
                  <span className="text-sm font-medium text-gray-700">AI Interview Assistant</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                Describe your future job
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base lg:text-md leading-relaxed">
                The information is essential for the AI to generate a personalized interview and appropriate to the needs of the job.
              </p>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 flex flex-col max-h-[calc(100vh-120px)]">
              {/* Form Header - Fixed */}
              <div className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
                {/* Form Title */}
                <h2 className="text-xl font-bold text-center">
                  Job Description
                </h2>
              </div>

              {/* Scrollable Form Content */}
              <div className="overflow-y-auto flex-1 px-6 py-4">
                <div className="space-y-4">
                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Job Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Ex: Software Engineer"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full h-10 rounded-lg text-sm"
                    />
                  </div>

                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">
                      Company <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Ex: Google"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full h-10 rounded-lg text-sm"
                    />
                  </div>

                  {/* Localização */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Ex: Remote"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full h-10 rounded-lg text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the responsibilities, objectives and context of the job..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full rounded-lg resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons - Fixed */}
              <div className="flex justify-between gap-4 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg h-10 text-sm"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.company || !formData.description}
                  className="flex-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 h-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

