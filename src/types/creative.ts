// Creative Workspace Types
// Based on creative_workspace_project_reference.md

// =============================================================================
// TICKET TYPES
// =============================================================================

export type TicketStatus =
  | "submitted"
  | "assessment"
  | "assigned"
  | "production"
  | "qa_review"
  | "delivered"

export type DesignType =
  | "digital_marketing"
  | "social_media"
  | "ecommerce"
  | "email"
  | "logo_branding"
  | "pdf_ebook"
  | "presentation"
  | "web_design"
  | "ux_ui"
  | "print_merch"
  | "packaging"
  | "poster_flyer"
  | "trade_show"
  | "business_card"
  | "sticker_keychain"
  | "custom"

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: Date
  uploadedBy: string
}

export interface Version {
  id: string
  number: number
  name: string
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
  uploadedBy: string
  notes?: string
}

export interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
  updatedAt?: Date
}

export interface Ticket {
  id: string
  title: string
  designType: DesignType
  brandId: string
  brandName?: string
  brandLogoUrl?: string
  brandColor?: string
  projectTag?: string
  targetAudience: string
  description: string
  status: TicketStatus
  priority: "low" | "medium" | "high" | "urgent"
  attachments: Attachment[]
  versions: Version[]
  comments: Comment[]
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  estimatedHours?: number
  trackedTime: number
  dueDate?: Date
  createdBy: string
  createdByName: string
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// BRAND TYPES
// =============================================================================

export interface BrandColor {
  id: string
  name: string
  hex: string
  type: "primary" | "secondary" | "accent"
}

export interface BrandFont {
  id: string
  name: string
  type: "primary" | "secondary"
  usage: string
  url?: string
}

export interface BrandAsset {
  id: string
  name: string
  url: string
  type: string
  variant?: string
}

export interface Inspiration {
  id: string
  title: string
  url?: string
  imageUrl?: string
  description?: string
}

export interface Brand {
  id: string
  name: string
  logoUrl?: string
  description: string
  targetAudience: string
  mission?: string
  vision?: string
  values: string[]
  personality: string[]
  colors: BrandColor[]
  fonts: BrandFont[]
  logos: BrandAsset[]
  referenceImages: BrandAsset[]
  inspirations: Inspiration[]
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// ASSET LIBRARY TYPES
// =============================================================================

export type AssetFileType = "image" | "video" | "pdf" | "document" | "archive" | "other"

export type AssetContentType = "original" | "ai_generated"

export type PromptRole = "user" | "assistant" | "system"

export interface PromptMessage {
  id: string
  role: PromptRole
  content: string
  timestamp: Date
  model?: string
  parameters?: Record<string, any>
}

export interface PromptHistory {
  messages: PromptMessage[]
  aiTool?: string
  modelVersion?: string
  generationDate?: Date
}

export type CopyrightCheckStatus = "pending" | "checking" | "completed" | "failed"
export type ApprovalStatus = "pending" | "approved" | "rejected"

export interface MatchedSource {
  id: string
  title: string
  url?: string
  similarity: number // 0-100
  type: "image" | "text" | "video" | "audio"
  source: string // e.g., "Getty Images", "Shutterstock", etc.
}

export interface RiskBreakdown {
  copyrightRisk: number // 0-100
  trademarkRisk: number // 0-100
  overallRisk: number // 0-100
  riskLevel: "low" | "medium" | "high"
}

export interface CopyrightCheckData {
  similarityScore: number // 0-100, threshold is typically 30%
  matchedSources: MatchedSource[]
  riskBreakdown: RiskBreakdown
  recommendations: string[]
  checkedAt: Date
  checkDuration?: number // in milliseconds
}

export interface Asset {
  id: string
  name: string
  description?: string
  thumbnailUrl: string
  fileUrl: string
  fileType: AssetFileType
  contentType: AssetContentType
  mimeType: string
  fileSize: number // in bytes
  dimensions?: { width: number; height: number }
  brandId: string
  brandName: string
  brandColor?: string
  brandLogoUrl?: string
  ticketId?: string
  ticketTitle?: string
  designType: DesignType
  tags: string[]
  uploadedById: string
  uploadedByName: string
  createdAt: Date
  updatedAt: Date
  promptHistory?: PromptHistory
  // Copyright check fields
  copyrightCheckStatus?: CopyrightCheckStatus
  copyrightCheckProgress?: number // 0-100
  copyrightCheckData?: CopyrightCheckData
  approvalStatus?: ApprovalStatus
  approvedBy?: string // admin user ID
  approvedAt?: Date
  rejectionReason?: string
}

export interface AssetFilterConfig {
  label: string
  icon: string
}

export const ASSET_FILE_TYPE_CONFIG: Record<AssetFileType, AssetFilterConfig> = {
  image: { label: "Images", icon: "🖼️" },
  video: { label: "Videos", icon: "🎬" },
  pdf: { label: "PDFs", icon: "📄" },
  document: { label: "Documents", icon: "📝" },
  archive: { label: "Archives", icon: "📦" },
  other: { label: "Other", icon: "📎" },
}

export interface AssetContentTypeConfig {
  label: string
  iconName: string
  color: string
  bgColor: string
}

export const ASSET_CONTENT_TYPE_CONFIG: Record<AssetContentType, AssetContentTypeConfig> = {
  original: {
    label: "Original",
    iconName: "FileText",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  ai_generated: {
    label: "AI Generated",
    iconName: "Sparkles",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
}

// =============================================================================
// TEAM TYPES
// =============================================================================

export type WorkflowRole =
  | "assessment"
  | "team_leader"
  | "creative"
  | "qa"
  | "external_contributor"
  | "client"

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: WorkflowRole
  skills: string[]
  currentLoad: number
  maxCapacity: number
  isAvailable: boolean
}

// =============================================================================
// UI HELPER TYPES
// =============================================================================

export interface TicketStatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
}

export const TICKET_STATUS_CONFIG: Record<TicketStatus, TicketStatusConfig> = {
  submitted: {
    label: "Submitted",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  assessment: {
    label: "Assessment",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  assigned: {
    label: "Assigned",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  production: {
    label: "In Production",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  qa_review: {
    label: "QA Review",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
}

export interface DesignTypeConfig {
  label: string
  iconName: string
}

export const DESIGN_TYPE_CONFIG: Record<DesignType, DesignTypeConfig> = {
  digital_marketing: { label: "Digital Marketing", iconName: "BarChart3" },
  social_media: { label: "Social Media", iconName: "Share2" },
  ecommerce: { label: "Ecommerce", iconName: "ShoppingCart" },
  email: { label: "Email Design", iconName: "Mail" },
  logo_branding: { label: "Logo & Branding", iconName: "Palette" },
  pdf_ebook: { label: "PDF / eBook", iconName: "FileText" },
  presentation: { label: "Presentation", iconName: "Presentation" },
  web_design: { label: "Web Design", iconName: "Globe" },
  ux_ui: { label: "UX/UI Design", iconName: "Layout" },
  print_merch: { label: "Print & Merch", iconName: "Shirt" },
  packaging: { label: "Packaging", iconName: "Package" },
  poster_flyer: { label: "Poster / Flyer", iconName: "Image" },
  trade_show: { label: "Trade Show", iconName: "Store" },
  business_card: { label: "Business Card", iconName: "CreditCard" },
  sticker_keychain: { label: "Sticker / Keychain", iconName: "Tag" },
  custom: { label: "Custom", iconName: "Sparkles" },
}

export const PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-slate-600", bgColor: "bg-slate-500/10" },
  medium: { label: "Medium", color: "text-blue-600", bgColor: "bg-blue-500/10" },
  high: { label: "High", color: "text-amber-600", bgColor: "bg-amber-500/10" },
  urgent: { label: "Urgent", color: "text-red-600", bgColor: "bg-red-500/10" },
}

export interface WorkflowRoleConfig {
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}

export const WORKFLOW_ROLE_CONFIG: Record<WorkflowRole, WorkflowRoleConfig> = {
  assessment: {
    label: "Assessment",
    description: "Reviews tickets, estimates work, assigns creatives",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  team_leader: {
    label: "Team Leader",
    description: "Balances workload, oversees progress",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  creative: {
    label: "Designer",
    description: "Executes tasks, uploads versions, handles revisions",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  qa: {
    label: "QA Reviewer",
    description: "Reviews deliverables, approves or returns work",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  external_contributor: {
    label: "External",
    description: "Restricted to assigned tasks only",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  client: {
    label: "Client",
    description: "Submits requests, reviews deliverables",
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
}

