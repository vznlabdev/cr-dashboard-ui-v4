import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

type RiskGrade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";

interface RiskIndexBadgeProps {
  grade: RiskGrade;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

const riskConfig = {
  "A+": { color: "bg-green-500", text: "text-white", border: "border-green-500", label: "Excellent", ring: "ring-green-500/20" },
  "A": { color: "bg-green-500", text: "text-white", border: "border-green-500", label: "Excellent", ring: "ring-green-500/20" },
  "A-": { color: "bg-green-600", text: "text-white", border: "border-green-600", label: "Very Good", ring: "ring-green-600/20" },
  "B+": { color: "bg-blue-500", text: "text-blue-50", border: "border-blue-500", label: "Good", ring: "ring-blue-500/20" },
  "B": { color: "bg-blue-500", text: "text-blue-50", border: "border-blue-500", label: "Good", ring: "ring-blue-500/20" },
  "B-": { color: "bg-blue-600", text: "text-blue-50", border: "border-blue-600", label: "Acceptable", ring: "ring-blue-600/20" },
  "C+": { color: "bg-amber-500", text: "text-amber-50", border: "border-amber-500", label: "Fair", ring: "ring-amber-500/20" },
  "C": { color: "bg-amber-500", text: "text-amber-50", border: "border-amber-500", label: "Fair", ring: "ring-amber-500/20" },
  "C-": { color: "bg-amber-600", text: "text-amber-50", border: "border-amber-600", label: "Needs Improvement", ring: "ring-amber-600/20" },
  "D": { color: "bg-destructive", text: "text-destructive-foreground", border: "border-destructive", label: "Poor", ring: "ring-destructive/20" },
  "F": { color: "bg-destructive", text: "text-destructive-foreground", border: "border-destructive", label: "Critical", ring: "ring-destructive/20" },
};

export function RiskIndexBadge({
  grade,
  size = "md",
  showIcon = true,
  showLabel = true,
  className,
}: RiskIndexBadgeProps) {
  const config = riskConfig[grade];

  const sizeVariants = {
    sm: {
      container: "h-12 w-12",
      text: "text-lg",
      label: "text-xs",
      icon: "h-3 w-3",
      ring: "ring-2",
    },
    md: {
      container: "h-16 w-16",
      text: "text-2xl",
      label: "text-sm",
      icon: "h-4 w-4",
      ring: "ring-4",
    },
    lg: {
      container: "h-20 w-20",
      text: "text-3xl",
      label: "text-base",
      icon: "h-5 w-5",
      ring: "ring-4",
    },
  };

  const variant = sizeVariants[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold",
          variant.container,
          variant.text,
          config.color,
          config.text,
          variant.ring,
          config.ring,
          "shadow-lg",
          "transition-all hover:scale-105"
        )}
      >
        {grade}
      </div>

      {showLabel && (
        <div className="flex items-center gap-1.5">
          {showIcon && (
            <Shield className={cn(variant.icon, "text-muted-foreground")} />
          )}
          <span className={cn("font-medium text-muted-foreground", variant.label)}>
            {config.label}
          </span>
        </div>
      )}
    </div>
  );
}

