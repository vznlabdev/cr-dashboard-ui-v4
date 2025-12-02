/**
 * Application Constants & Enums
 * 
 * Centralized constants for consistent values across the application.
 * 
 * USAGE:
 * import { PROJECT_STATUSES, RISK_LEVELS } from '@/lib/constants';
 * 
 * <Select>
 *   {PROJECT_STATUSES.map(status => (
 *     <SelectItem key={status} value={status}>{status}</SelectItem>
 *   ))}
 * </Select>
 */

// ==============================================
// Project Constants
// ==============================================

export const PROJECT_STATUSES = ["Draft", "Active", "Review", "Approved"] as const;
export const RISK_LEVELS = ["Low", "Medium", "High"] as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  Draft: "Draft",
  Active: "Active",
  Review: "In Review",
  Approved: "Approved",
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  Low: "Low Risk",
  Medium: "Medium Risk",
  High: "High Risk",
};

// ==============================================
// Asset Constants
// ==============================================

export const ASSET_STATUSES = ["Draft", "Review", "Approved", "Rejected"] as const;
export const CONTENT_TYPES = ["Image", "Video", "Audio", "Text", "AR/VR"] as const;
export const AI_METHODS = ["AI Augmented", "AI Generative", "Multimodal"] as const;

export const ASSET_STATUS_LABELS: Record<string, string> = {
  Draft: "Draft",
  Review: "In Review",
  Approved: "Approved",
  Rejected: "Rejected",
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  Image: "Image",
  Video: "Video",
  Audio: "Audio",
  Text: "Text",
  "AR/VR": "AR/VR Experience",
};

export const AI_METHOD_LABELS: Record<string, string> = {
  "AI Augmented": "AI Augmented (Human + AI)",
  "AI Generative": "AI Generative (Fully AI)",
  Multimodal: "Multimodal (Combined)",
};

// ==============================================
// User Role Constants
// ==============================================

export const USER_ROLES = [
  "Company Admin",
  "Legal Reviewer",
  "Insurance Analyst",
  "Content Creator",
] as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  "Company Admin": "Company Admin",
  "Legal Reviewer": "Legal Reviewer",
  "Insurance Analyst": "Insurance Analyst",
  "Content Creator": "Content Creator",
};

export const USER_ROLE_DESCRIPTIONS: Record<string, string> = {
  "Company Admin": "Full access to all settings, projects, and team management",
  "Legal Reviewer": "Approve/reject assets, view compliance data, access audit logs",
  "Insurance Analyst": "View risk assessments, export reports, no approval permissions",
  "Content Creator": "Upload assets, view own projects, no approval permissions",
};

// ==============================================
// Notification Constants
// ==============================================

export const NOTIFICATION_TYPES = ["info", "success", "warning", "error"] as const;

// ==============================================
// Compliance & Risk Constants
// ==============================================

export const COMPLIANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  NEEDS_REVIEW: 50,
  CRITICAL: 0,
} as const;

export const RISK_INDEX_GRADES = ["A", "B", "C", "D", "F"] as const;

// ==============================================
// File Upload Constants
// ==============================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = {
  Image: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  Video: [".mp4", ".mov", ".avi", ".webm"],
  Audio: [".mp3", ".wav", ".ogg", ".m4a"],
  Text: [".txt", ".md", ".doc", ".docx", ".pdf"],
  "AR/VR": [".glb", ".gltf", ".usdz"],
};

// ==============================================
// Pagination Constants
// ==============================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;

// ==============================================
// Export Constants
// ==============================================

export const EXPORT_FORMATS = ["csv", "json", "pdf"] as const;

// ==============================================
// Color & Badge Variants
// ==============================================

export const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Active: "default",
  Review: "secondary",
  Draft: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export const RISK_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  Low: "default",
  Medium: "secondary",
  High: "destructive",
};

export const SEVERITY_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};

// ==============================================
// Date & Time Constants
// ==============================================

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  LONG: "MMMM dd, yyyy 'at' h:mm a",
  SHORT: "MM/dd/yyyy",
  ISO: "yyyy-MM-dd",
} as const;

// ==============================================
// API Constants
// ==============================================

export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// ==============================================
// Feature Flags (from env)
// ==============================================

export const FEATURES = {
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  BULK_ACTIONS: process.env.NEXT_PUBLIC_ENABLE_BULK_ACTIONS !== "false",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false",
  EXPORTS: process.env.NEXT_PUBLIC_ENABLE_EXPORTS !== "false",
} as const;

// ==============================================
// Helper Functions
// ==============================================

/**
 * Check if value is a valid project status
 */
export function isValidProjectStatus(value: string): value is typeof PROJECT_STATUSES[number] {
  return PROJECT_STATUSES.includes(value as any);
}

/**
 * Check if value is a valid risk level
 */
export function isValidRiskLevel(value: string): value is typeof RISK_LEVELS[number] {
  return RISK_LEVELS.includes(value as any);
}

/**
 * Get compliance level based on score
 */
export function getComplianceLevel(score: number): "excellent" | "good" | "needs-review" | "critical" {
  if (score >= COMPLIANCE_THRESHOLDS.EXCELLENT) return "excellent";
  if (score >= COMPLIANCE_THRESHOLDS.GOOD) return "good";
  if (score >= COMPLIANCE_THRESHOLDS.NEEDS_REVIEW) return "needs-review";
  return "critical";
}

/**
 * Get compliance color class
 */
export function getComplianceColorClass(score: number): string {
  if (score >= 90) return "text-green-500";
  if (score >= 70) return "text-amber-500";
  return "text-destructive";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

