import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Mic, Brain, BarChart3, Zap } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  { icon: Mic, title: "Voice Analysis", description: "Real-time analysis", color: "bg-blue-500" },
  { icon: Brain, title: "AI Feedback", description: "Intelligent feedback", color: "bg-purple-500" },
  { icon: BarChart3, title: "Progress", description: "Track evolution", color: "bg-green-500" },
  { icon: Zap, title: "Quick Practice", description: "Practice quickly", color: "bg-yellow-500" },
];

export default function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 p-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 backdrop-blur-sm">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", feature.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Animated beam lines */}
                {idx < features.length - 1 && (
                  <motion.div
                    className="absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.2 + 0.3, duration: 0.5 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Central connection point */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
    </div>
  );
}

