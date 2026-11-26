"use client";

import dynamic from "next/dynamic";

const NeuralBackground = dynamic(
  () => import("@/components/ui/flow-field-background"),
  { ssr: false }
);

interface AnimatedBackgroundProps {
  color?: string;
  particleCount?: number;
  speed?: number;
  trailOpacity?: number;
}

export function AnimatedBackground({
  color = "#c7d2fe",
  particleCount = 200,
  speed = 0.5,
  trailOpacity = 0.04,
}: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0">
      <NeuralBackground
        color={color}
        particleCount={particleCount}
        speed={speed}
        trailOpacity={trailOpacity}
      />
    </div>
  );
}
