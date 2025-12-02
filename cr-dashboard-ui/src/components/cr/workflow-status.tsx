import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export type WorkflowStage = "draft" | "review" | "legal" | "approved";

export interface WorkflowStep {
  stage: WorkflowStage;
  label: string;
  completed: boolean;
  active: boolean;
  date?: string;
}

interface WorkflowStatusProps {
  steps: WorkflowStep[];
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WorkflowStatus({
  steps,
  orientation = "horizontal",
  size = "md",
  className,
}: WorkflowStatusProps) {
  const sizeVariants = {
    sm: {
      icon: "h-4 w-4",
      circle: "h-8 w-8",
      line: orientation === "horizontal" ? "h-0.5" : "w-0.5",
      text: "text-xs",
      date: "text-[10px]",
    },
    md: {
      icon: "h-5 w-5",
      circle: "h-10 w-10",
      line: orientation === "horizontal" ? "h-1" : "w-1",
      text: "text-sm",
      date: "text-xs",
    },
    lg: {
      icon: "h-6 w-6",
      circle: "h-12 w-12",
      line: orientation === "horizontal" ? "h-1" : "w-1",
      text: "text-base",
      date: "text-sm",
    },
  };

  const variant = sizeVariants[size];

  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row items-center" : "flex-col",
        className
      )}
    >
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-col items-center" : "flex-row items-start gap-3"
          )}
        >
          {/* Step indicator */}
          <div className={cn(
            "flex",
            orientation === "horizontal" ? "flex-col items-center gap-2" : "flex-col items-center"
          )}>
            {/* Circle */}
            <div
              className={cn(
                "rounded-full flex items-center justify-center transition-all",
                variant.circle,
                step.completed
                  ? "bg-green-500 text-white"
                  : step.active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? (
                <CheckCircle2 className={variant.icon} />
              ) : step.active ? (
                <Clock className={variant.icon} />
              ) : (
                <Circle className={variant.icon} />
              )}
            </div>

            {/* Label and date */}
            {orientation === "horizontal" && (
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "font-medium",
                    variant.text,
                    step.completed || step.active
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.date && (
                  <span className={cn("text-muted-foreground", variant.date)}>
                    {step.date}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Vertical layout label */}
          {orientation === "vertical" && (
            <div className="flex-1 pt-1">
              <p
                className={cn(
                  "font-medium",
                  variant.text,
                  step.completed || step.active
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.date && (
                <p className={cn("text-muted-foreground", variant.date)}>
                  {step.date}
                </p>
              )}
            </div>
          )}

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "transition-all",
                orientation === "horizontal"
                  ? cn("flex-1 min-w-12", variant.line)
                  : cn("h-8 ml-5", variant.line),
                steps[index + 1].completed || steps[index + 1].active
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

