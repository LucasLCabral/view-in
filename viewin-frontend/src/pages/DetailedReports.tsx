import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";

export default function DetailedReports() {
  // Mock data
  const metrics = [
    {
      label: "Communication Score",
      value: 8.7,
      change: +0.5,
      trend: "up",
    },
    {
      label: "Confidence Level",
      value: 8.2,
      change: +1.2,
      trend: "up",
    },
    {
      label: "Technical Accuracy",
      value: 9.1,
      change: +0.3,
      trend: "up",
    },
    {
      label: "Response Time",
      value: 7.8,
      change: -0.2,
      trend: "down",
    },
  ];

  const timeline = [
    {
      date: "2024-01-15",
      score: 8.5,
      questions: 3,
      duration: "12:34",
    },
    {
      date: "2024-01-10",
      score: 8.2,
      questions: 3,
      duration: "11:45",
    },
    {
      date: "2024-01-05",
      score: 7.9,
      questions: 3,
      duration: "13:20",
    },
    {
      date: "2024-01-01",
      score: 7.5,
      questions: 3,
      duration: "14:10",
    },
  ];

  const improvements = [
    {
      area: "Communication",
      current: 8.7,
      target: 9.5,
      progress: 75,
    },
    {
      area: "Technical Depth",
      current: 8.3,
      target: 9.0,
      progress: 83,
    },
    {
      area: "Time Management",
      current: 7.8,
      target: 8.5,
      progress: 65,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
            View:<span className="text-blue-500">in</span>
          </Link>

          {/* Back Button */}
          <Link to="/interview-report">
            <Button variant="outline" size="sm" className="rounded-full border-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Report
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Detailed Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive insights into your interview performance
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">
                  {metric.label}
                </span>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(metric.change).toFixed(1)}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {metric.value.toFixed(1)}
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(metric.value / 10) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Performance Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Performance Timeline
            </h2>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>

          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.questions} questions • {item.duration} duration
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-500">
                    {item.score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">/ 10</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Improvement Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Improvement Areas
            </h2>
            <Target className="w-5 h-5 text-blue-500" />
          </div>

          <div className="space-y-6">
            {improvements.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.area}
                  </span>
                  <span className="text-sm text-gray-600">
                    {item.current.toFixed(1)} / {item.target.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.progress}% progress</span>
                  <span>
                    {((item.target - item.current) / item.target * 100).toFixed(0)}% to go
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">Key Insights</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Strong Communication Skills
                </p>
                <p className="text-sm text-gray-600">
                  Your communication score has improved by 0.5 points this month.
                  Continue practicing clear articulation and structured responses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Consistent Performance
                </p>
                <p className="text-sm text-gray-600">
                  You've maintained a steady upward trend across all interviews.
                  Your average score has increased from 7.5 to 8.5.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Focus on Time Management
                </p>
                <p className="text-sm text-gray-600">
                  Response time could be improved. Practice delivering concise
                  answers while maintaining quality.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

