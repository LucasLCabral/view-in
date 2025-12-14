import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Mic,
  BarChart3,
  FileText,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Play,
  History,
  TrendingUp,
  Briefcase,
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="text-xl font-semibold">
            View:<span className="text-blue-500">in</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition-colors"
          >
            <Play className="w-5 h-5" />
            Practice Interview
          </Link>
          <Link
            to="/dashboard/history"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <History className="w-5 h-5" />
            History
          </Link>
          <Link
            to="/dashboard/analytics"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </Link>
          <Link
            to="/dashboard/reports"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Reports
          </Link>
          <Link
            to="/dashboard/calendar"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Schedule
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back! Ready to practice?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {getUserInitials()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.username || "Usuário"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Practices</span>
                <Play className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12% this month
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average Score</span>
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">8.5</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +0.8 this month
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">This Week</span>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-600 mt-2">sessions completed</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Improvement</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">35%</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                positive trend
              </p>
            </div>
          </div>

          {/* Main Action Card */}
          <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Start Practice Session
                </h2>
                <p className="text-gray-600">
                  Practice with AI-powered feedback and improve your interview skills
                </p>
              </div>
              <Link to="/job-description">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Mic className="w-5 h-5 mr-2" />
                  Start Practice
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 transition-colors hover:bg-gray-50">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Describe Job
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Copy and paste your dreaming job position to practice with targeted interview questions.
              </p>
              <Link
                to="/job-description"
                className="text-sm text-blue-500 font-medium hover:text-blue-600"
              >
                Describe job →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 transition-colors hover:bg-gray-50">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Reports
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Access detailed performance reports and insights from your practice sessions.
              </p>
              <Link
                to="/dashboard/reports"
                className="text-sm text-blue-500 font-medium hover:text-blue-600"
              >
                View reports →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 transition-colors hover:bg-gray-50">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Track your progress over time with comprehensive analytics and metrics.
              </p>
              <Link
                to="/dashboard/analytics"
                className="text-sm text-blue-500 font-medium hover:text-blue-600"
              >
                View analytics →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 transition-colors hover:bg-gray-50">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Schedule Practice
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Plan your practice sessions and set reminders for regular interviews.
              </p>
              <Link
                to="/dashboard/calendar"
                className="text-sm text-blue-500 font-medium hover:text-blue-600"
              >
                Schedule →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

