import { Routes, Route, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import VoiceCircle from "@/components/VoiceCircle"
import AI_Voice from "@/components/kokonutui/ai-voice"
import JobDescriptionForm from "@/pages/JobDescriptionForm"
import Dashboard from "@/pages/Dashboard"
import AgentPage from "@/pages/AgentPage"
import InterviewLoading from "@/pages/InterviewLoading"
import InterviewReport from "@/pages/InterviewReport"
import DetailedReports from "@/pages/DetailedReports"
import NotFound from "@/pages/NotFound"
import UnderConstruction from "@/pages/UnderConstruction"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import BlueBackgroundPaths from "@/components/kokonutui/blue-background-paths"
import { BentoDemo } from "@/components/kokonutui/bento-demo"
import ProtectedRoute from "@/components/ProtectedRoute"

function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Header */}
      <header className="w-full border-b border-gray-200 relative z-10 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-xl font-semibold">
              View:<span className="text-blue-500">in</span>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="rounded-full border-black text-black hover:bg-gray-50">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full bg-black text-white hover:bg-gray-900">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-12">
            {/* Text Content */}
            <div className="text-center space-y-8 max-w-2xl">
              {/* Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-xl">
                  <Sparkles className="w-3 h-3 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">future at work</span>
                </div>
              </div>
               
              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                Your AI interview assistant
              </h1>

              {/* Description */}
              <p className="text-sm md:text-lg text-gray-700 leading-relaxed">
              Level up your interviews with real-time AI feedback and coaching. 
              Prepare yourself for the <span className="text-blue-500">future</span> of job interviews.
              </p>
            </div>

            {/* AI Voice Component with Voice Circle overlay */}
            <div className="relative flex justify-center items-center">
              {/* AI Voice Component */}
              <div className="relative z-20 w-full">
                <AI_Voice />
              </div>
              
              {/* Voice Circle positioned absolutely over the microphone/button */}
              <div className="absolute top-[48px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <VoiceCircle size="sm" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Background Paths - Between sections */}
      <div className="relative w-full h-[600px] overflow-hidden -my-[200px] z-0 pointer-events-none">
        <BlueBackgroundPaths />
      </div>

      {/* Features Bento Grid */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to ace your next interview
            </p>
          </div>

          <BentoDemo />
        </div>
      </section>

    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/job-description" element={<JobDescriptionForm />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/agent" element={<AgentPage />} />
      <Route path="/interview-loading" element={<InterviewLoading />} />
      <Route path="/interview-report" element={<InterviewReport />} />
      <Route path="/detailed-reports" element={<DetailedReports />} />
      <Route 
        path="/dashboard/history" 
        element={
          <ProtectedRoute>
            <UnderConstruction feature="History" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/analytics" 
        element={
          <ProtectedRoute>
            <UnderConstruction feature="Analytics" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/reports" 
        element={
          <ProtectedRoute>
            <UnderConstruction feature="Reports" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/calendar" 
        element={
          <ProtectedRoute>
            <UnderConstruction feature="Schedule" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <ProtectedRoute>
            <UnderConstruction feature="Settings" />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
