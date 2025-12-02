"use client"

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ComplianceScoreGaugeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
  trend?: number; // positive or negative change
  className?: string;
}

export function ComplianceScoreGauge({
  score,
  size = "md",
  showTrend = false,
  trend = 0,
  className,
}: ComplianceScoreGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"; // Green for high scores
    if (score >= 70) return "text-amber-500";
    return "text-destructive";
  };

  // Size variants
  const sizeVariants = {
    sm: {
      container: "h-24 w-24",
      text: "text-xl",
      label: "text-xs",
      border: "border-4",
    },
    md: {
      container: "h-32 w-32",
      text: "text-3xl",
      label: "text-sm",
      border: "border-[6px]",
    },
    lg: {
      container: "h-40 w-40",
      text: "text-4xl",
      label: "text-base",
      border: "border-8",
    },
  };

  const variant = sizeVariants[size];

  // Calculate circumference for the progress circle
  const radius = size === "sm" ? 38 : size === "md" ? 54 : 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2 p-2", className)}>
      <div className="relative">
        {/* SVG Circle Progress */}
        <svg
          className={cn(variant.container)}
          viewBox="0 0 140 140"
          style={{ overflow: 'visible' }}
        >
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-out",
              getScoreColor(clampedScore)
            )}
            transform="rotate(-90 70 70)"
          />
        </svg>
        
        {/* Score text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className={cn("font-bold", variant.text, getScoreColor(clampedScore))}>
              {clampedScore}
            </span>
            <span className={cn("font-bold ml-1", variant.label, getScoreColor(clampedScore))}>
              %
            </span>
          </div>
        </div>
      </div>

      {/* Trend indicator */}
      {showTrend && trend !== 0 && (
        <div className="flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+{trend}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3 text-destructive" />
              <span className="text-destructive font-medium">{trend}%</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

