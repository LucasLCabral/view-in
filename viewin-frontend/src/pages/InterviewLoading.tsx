import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const loadingMessages = [
  "Analyzing your performance...",
  "Analyzing how you did...",
  "Generating personalized report...",
  "Processing your responses...",
  "Almost there...",
];

export default function InterviewLoading() {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        } else {
          setIsComplete(true);
          return prev;
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete) {
      const timeout = setTimeout(() => {
        navigate("/interview-report");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, navigate]);

  return (
    <div className="min-h-screen bg-white text-black relative">
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

