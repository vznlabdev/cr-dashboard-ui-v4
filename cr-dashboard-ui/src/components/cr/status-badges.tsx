import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, XCircle, FileText, Image, Video, Music, MessageSquare } from "lucide-react";

// Project/Asset Status
export type ProjectStatus = "draft" | "review" | "approved" | "rejected";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ContentType = "text" | "image" | "video" | "audio" | "ar-vr";
export type AIMethod = "augmented" | "generative" | "multimodal";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

interface ContentTypeBadgeProps {
  type: ContentType;
  showIcon?: boolean;
  className?: string;
}

interface AIMethodBadgeProps {
  method: AIMethod;
  className?: string;
}

// Project/Asset Status Badge
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    draft: {
      label: "Draft",
      variant: "outline" as const,
      icon: FileText,
      className: "border-muted-foreground/50 text-muted-foreground",
    },
    review: {
      label: "In Review",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
    },
    approved: {
      label: "Approved",
      variant: "default" as const,
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("gap-1", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Risk Level Badge
export function RiskBadge({ level, className }: RiskBadgeProps) {
  const configs = {
    low: {
      label: "Low Risk",
      variant: "default" as const,
      className: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
    },
    medium: {
      label: "Medium Risk",
      variant: "secondary" as const,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
    },
    high: {
      label: "High Risk",
      variant: "destructive" as const,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    critical: {
      label: "Critical Risk",
      variant: "destructive" as const,
      className: "bg-destructive text-destructive-foreground",
    },
  };

  const config = configs[level];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      <AlertCircle className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Content Type Badge
export function ContentTypeBadge({ type, showIcon = true, className }: ContentTypeBadgeProps) {
  const configs = {
    text: {
      label: "Text",
      icon: MessageSquare,
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
    },
    image: {
      label: "Image",
      icon: Image,
      className: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
    },
    video: {
      label: "Video",
      icon: Video,
      className: "bg-pink-500/10 text-pink-600 dark:text-pink-500 border-pink-500/20",
    },
    audio: {
      label: "Audio",
      icon: Music,
      className: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
    },
    "ar-vr": {
      label: "AR/VR",
      icon: FileText,
      className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 border-indigo-500/20",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

// AI Method Badge
export function AIMethodBadge({ method, className }: AIMethodBadgeProps) {
  const configs = {
    augmented: {
      label: "AI Augmented",
      description: "Human + AI",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
    },
    generative: {
      label: "AI Generative",
      description: "Fully AI",
      className: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
    },
    multimodal: {
      label: "Multimodal",
      description: "Combined Media",
      className: "bg-pink-500/10 text-pink-600 dark:text-pink-500 border-pink-500/20",
    },
  };

  const config = configs[method];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

// Compliance Percentage Badge (for quick display)
export function CompliancePercentageBadge({ score, className }: { score: number; className?: string }) {
  const getVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const getClassName = (score: number) => {
    if (score >= 90) return "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20";
    if (score >= 70) return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <Badge variant={getVariant(score)} className={cn(getClassName(score), className)}>
      {score}% Compliant
    </Badge>
  );
}

