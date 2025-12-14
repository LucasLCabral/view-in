import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface VoiceCircleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VoiceCircle({
  size = "lg",
  className,
}: VoiceCircleProps) {
  const sizeConfig = {
    sm: "size-20",
    md: "size-32",
    lg: "size-40",
  };

  return (
    <div className={cn("relative", sizeConfig[size], className)}>
      <motion.div
        className="relative w-full h-full"
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
            background: `conic-gradient(from 0deg, transparent 0deg, rgb(37, 99, 235) 90deg, transparent 180deg)`,
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
            background: `conic-gradient(from 0deg, transparent 0deg, rgb(59, 130, 246) 120deg, rgba(37, 99, 235, 0.5) 240deg, transparent 360deg)`,
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
            background: `conic-gradient(from 180deg, transparent 0deg, rgba(37, 99, 235, 0.6) 45deg, transparent 90deg)`,
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
            background: `conic-gradient(from 270deg, transparent 0deg, rgba(96, 165, 250, 0.4) 20deg, transparent 40deg)`,
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

        {/* Inner ring 1 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 90deg, transparent 0deg, rgba(59, 130, 246, 0.7) 60deg, transparent 120deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 65%, black 67%, black 69%, transparent 71%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 65%, black 67%, black 69%, transparent 71%)`,
            opacity: 0.6,
          }}
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Inner ring 2 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 45deg, transparent 0deg, rgba(37, 99, 235, 0.5) 80deg, rgba(96, 165, 250, 0.3) 160deg, transparent 240deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 70%, black 72%, black 74%, transparent 76%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 70%, black 72%, black 74%, transparent 76%)`,
            opacity: 0.5,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Inner ring 3 - deepest */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 135deg, transparent 0deg, rgba(96, 165, 250, 0.6) 50deg, transparent 100deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 75%, black 76%, black 77%, transparent 78%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 75%, black 76%, black 77%, transparent 78%)`,
            opacity: 0.4,
          }}
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Inner ring 4 - center ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.4) 90deg, rgba(37, 99, 235, 0.3) 180deg, transparent 270deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 78%, black 79%, black 80%, transparent 81%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 78%, black 79%, black 80%, transparent 81%)`,
            opacity: 0.35,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Inner ring 5 - deep inner */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 225deg, transparent 0deg, rgba(96, 165, 250, 0.5) 45deg, transparent 90deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 82%, black 83%, black 84%, transparent 85%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 82%, black 83%, black 84%, transparent 85%)`,
            opacity: 0.3,
          }}
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Inner ring 6 - deeper inner */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 315deg, transparent 0deg, rgba(37, 99, 235, 0.4) 70deg, rgba(59, 130, 246, 0.3) 140deg, transparent 210deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 85%, black 86%, black 87%, transparent 88%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 85%, black 86%, black 87%, transparent 88%)`,
            opacity: 0.25,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Inner ring 7 - very deep inner */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 180deg, transparent 0deg, rgba(96, 165, 250, 0.4) 40deg, transparent 80deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 88%, black 89%, black 90%, transparent 91%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 88%, black 89%, black 90%, transparent 91%)`,
            opacity: 0.2,
          }}
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Inner ring 8 - almost center */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.3) 60deg, rgba(37, 99, 235, 0.2) 120deg, transparent 180deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 91%, black 92%, black 93%, transparent 94%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 91%, black 92%, black 93%, transparent 94%)`,
            opacity: 0.15,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Inner ring 9 - center core */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 90deg, transparent 0deg, rgba(96, 165, 250, 0.3) 50deg, transparent 100deg)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 94%, black 95%, black 96%, transparent 97%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 94%, black 95%, black 96%, transparent 97%)`,
            opacity: 0.1,
          }}
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.div>
    </div>
  );
}

