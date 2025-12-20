import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center relative", className)}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 rounded-lg opacity-50" />
      <div className="relative z-10">
        <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-4 mb-4 animate-pulse-subtle">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2 gradient-text">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        {action && (
          action.href ? (
            <Button asChild className="magnetic">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button onClick={action.onClick} className="magnetic">
              {action.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

