import { memo, useMemo } from "react";
import { motion } from "motion/react";

// Path generation function
function generateAestheticPath(
  index: number,
  position: number,
  type: "primary" | "secondary" | "accent"
): string {
  const baseAmplitude =
    type === "primary" ? 150 : type === "secondary" ? 100 : 60;
  const phase = index * 0.2;
  const points: { x: number; y: number }[] = [];
  const segments = type === "primary" ? 10 : type === "secondary" ? 8 : 6;

  const startX = 6400;
  const startY = 100;
  const endX = -5400;
  const endY = -400 + index * 5;

  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const eased = 1 - (1 - progress) ** 2;

    const baseX = startX + (endX - startX) * eased;
    const baseY = startY + (endY - startY) * eased;

    const amplitudeFactor = 1 - eased * 0.3;
    const wave1 =
      Math.sin(progress * Math.PI * 3 + phase) *
      (baseAmplitude * 0.7 * amplitudeFactor);
    const wave2 =
      Math.cos(progress * Math.PI * 4 + phase) *
      (baseAmplitude * 0.3 * amplitudeFactor);
    const wave3 =
      Math.sin(progress * Math.PI * 2 + phase) *
      (baseAmplitude * 0.2 * amplitudeFactor);

    points.push({
      x: baseX * position,
      y: baseY + wave1 + wave2 + wave3,
    });
  }

  const pathCommands = points.map((point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[i - 1];
    const tension = 0.4;
    const cp1x = prevPoint.x + (point.x - prevPoint.x) * tension;
    const cp1y = prevPoint.y;
    const cp2x = prevPoint.x + (point.x - prevPoint.x) * (1 - tension);
    const cp2y = point.y;
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  });

  return pathCommands.join(" ");
}

const generateUniqueId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const BlueBackgroundPaths = memo(function BlueBackgroundPaths() {
  const primaryPaths = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: generateUniqueId("primary"),
        d: generateAestheticPath(i, 1, "primary"),
        opacity: 0.2 + i * 0.02,
        width: 4 + i * 0.3,
      })),
    []
  );

  const secondaryPaths = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: generateUniqueId("secondary"),
        d: generateAestheticPath(i, 1, "secondary"),
        opacity: 0.15 + i * 0.015,
        width: 3 + i * 0.2,
      })),
    []
  );

  const accentPaths = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: generateUniqueId("accent"),
        d: generateAestheticPath(i, 1, "accent"),
        opacity: 0.1 + i * 0.01,
        width: 2 + i * 0.15,
      })),
    []
  );

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="-2400 -800 4800 1600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient
            id="blueGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
          </linearGradient>
        </defs>

        <g className="primary-waves">
          {primaryPaths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="url(#blueGradient)"
              strokeWidth={path.width}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{
                opacity: path.opacity,
                y: [0, -20, 0],
              }}
              transition={{
                opacity: { duration: 1 },
                y: {
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  repeatType: "reverse",
                },
              }}
            />
          ))}
        </g>

        <g className="secondary-waves" style={{ opacity: 0.9 }}>
          {secondaryPaths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="url(#blueGradient)"
              strokeWidth={path.width}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{
                opacity: path.opacity,
                y: [0, -15, 0],
              }}
              transition={{
                opacity: { duration: 1 },
                y: {
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  repeatType: "reverse",
                },
              }}
            />
          ))}
        </g>

        <g className="accent-waves" style={{ opacity: 0.7 }}>
          {accentPaths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="url(#blueGradient)"
              strokeWidth={path.width}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{
                opacity: path.opacity,
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 1 },
                y: {
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  repeatType: "reverse",
                },
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
});

export default BlueBackgroundPaths;

