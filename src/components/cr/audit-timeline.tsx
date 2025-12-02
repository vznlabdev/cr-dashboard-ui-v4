import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface TimelineEvent {
  icon: LucideIcon;
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
  type?: "success" | "warning" | "error" | "info";
}

interface AuditTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const typeColors = {
  success: {
    icon: "text-green-500",
    iconBg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  warning: {
    icon: "text-amber-500",
    iconBg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  error: {
    icon: "text-destructive",
    iconBg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  info: {
    icon: "text-blue-500",
    iconBg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

export function AuditTimeline({ events, className }: AuditTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => {
        const Icon = event.icon;
        const colors = event.type ? typeColors[event.type] : typeColors.info;
        const isLast = index === events.length - 1;

        return (
          <div key={index} className="flex gap-4 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
            )}

            {/* Icon */}
            <div className="relative z-10">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2",
                  colors.iconBg,
                  colors.border
                )}
              >
                <Icon className={cn("h-5 w-5", colors.icon)} />
              </div>
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    {event.user && (
                      <>
                        <span>{event.user}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{event.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

