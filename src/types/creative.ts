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
  icon: string
}

export const DESIGN_TYPE_CONFIG: Record<DesignType, DesignTypeConfig> = {
  digital_marketing: { label: "Digital Marketing", icon: "📊" },
  social_media: { label: "Social Media", icon: "📱" },
  ecommerce: { label: "Ecommerce", icon: "🛒" },
  email: { label: "Email Design", icon: "✉️" },
  logo_branding: { label: "Logo & Branding", icon: "🎨" },
  pdf_ebook: { label: "PDF / eBook", icon: "📄" },
  presentation: { label: "Presentation", icon: "📽️" },
  web_design: { label: "Web Design", icon: "🌐" },
  ux_ui: { label: "UX/UI Design", icon: "💻" },
  print_merch: { label: "Print & Merch", icon: "👕" },
  packaging: { label: "Packaging", icon: "📦" },
  poster_flyer: { label: "Poster / Flyer", icon: "🪧" },
  trade_show: { label: "Trade Show", icon: "🎪" },
  business_card: { label: "Business Card", icon: "💳" },
  sticker_keychain: { label: "Sticker / Keychain", icon: "🏷️" },
  custom: { label: "Custom", icon: "✨" },
}

export const PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-slate-600", bgColor: "bg-slate-500/10" },
  medium: { label: "Medium", color: "text-blue-600", bgColor: "bg-blue-500/10" },
  high: { label: "High", color: "text-amber-600", bgColor: "bg-amber-500/10" },
  urgent: { label: "Urgent", color: "text-red-600", bgColor: "bg-red-500/10" },
}

