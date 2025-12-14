import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Construction } from "lucide-react";
import { motion } from "motion/react";

interface UnderConstructionProps {
  feature?: string;
}

export default function UnderConstruction({ feature }: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
            View:<span className="text-blue-500">in</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
              <Construction className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Under Construction
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {feature 
                ? `We're currently building ${feature}.`
                : "We're currently building this feature."}
            </p>
            <p className="text-base text-gray-500">
              Check back soon for updates!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <Link to="/">
              <Button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-full border-gray-300"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

