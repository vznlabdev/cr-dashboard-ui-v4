// Creative Workspace Types
// Based on creative_workspace_project_reference.md

// =============================================================================
// TICKET TYPES
// =============================================================================

export type TicketStatus =
  | "submitted"
  | "compliance"
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

// =============================================================================
// VERSION CONTROL TYPES
// =============================================================================

export type VersionStatus = 
  | "draft"           // Being worked on
  | "submitted"       // Submitted for review
  | "client_review"   // Client is reviewing
  | "client_approved" // Client approved, pending admin
  | "admin_review"    // Admin is reviewing
  | "approved"        // Final approval
  | "rejected"        // Rejected, needs revision

export interface AssetVersion {
  id: string
  versionNumber: number  // v1, v2, v3, etc.
  parentAssetId: string  // Groups versions together
  taskId?: string  // Link to task this version belongs to
  
  // File details
  name: string
  description?: string
  fileUrl: string
  thumbnailUrl: string
  fileType: AssetFileType
  contentType: AssetContentType  // "ai_generated" or "original"
  fileSize: number
  mimeType: string
  dimensions?: { width: number; height: number }
  
  // Version metadata
  status: VersionStatus
  uploadedAt: Date
  uploadedById: string
  uploadedByName: string
  uploadedByRole: string  // UserRole
  
  // Review workflow
  submittedAt?: Date
  clientReviewedAt?: Date
  clientReviewedBy?: string
  adminApprovedAt?: Date
  adminApprovedBy?: string
  rejectedAt?: Date
  rejectedBy?: string
  rejectionReason?: string
  
  // Changes from previous version
  changeNotes?: string  // What changed in this version
  previousVersionId?: string  // Reference to previous version
  
  // Engagement
  commentsCount: number
  comments: VersionComment[]
  
  // AI generation details
  promptHistory?: PromptHistory
  aiModel?: string
  
  // Brand & design info (from parent group)
  brandId?: string
  brandName?: string
  brandColor?: string
  brandLogoUrl?: string
  designType?: DesignType
  tags?: string[]
  ticketId?: string
  ticketTitle?: string
  
  // Additional Asset-compatible fields
  createdAt?: Date
  updatedAt?: Date
  copyrightCheckStatus?: "pending" | "in_progress" | "completed" | "failed"
  copyrightCheckProgress?: number
  copyrightCheckData?: any
  approvalStatus?: ApprovalStatus
  approvedBy?: string
  approvedByName?: string // display name of approver
  approvedAt?: Date
  approvalReason?: string // reason for manual approval
  
  // Comprehensive review data
  reviewData?: AssetReviewData
  quickScores?: {
    overall: number
    copyright: number
    accessibility: number
    seo: number
  }
}

export interface VersionComment {
  id: string
  versionId: string
  content: string
  authorId: string
  authorName: string
  authorRole: string  // UserRole
  authorAvatar?: string
  createdAt: Date
  updatedAt?: Date
  
  // For threaded comments
  parentCommentId?: string
  replies?: VersionComment[]
  
  // For specific feedback on areas of the asset
  annotationX?: number  // X coordinate (percentage)
  annotationY?: number  // Y coordinate (percentage)
}

export interface AssetVersionGroup {
  id: string  // This is the parentAssetId
  name: string
  taskId?: string
  projectId?: string
  brandId: string
  brandName: string
  brandColor?: string
  brandLogoUrl?: string
  
  // Current active version
  currentVersionId: string
  currentVersionNumber: number
  latestVersionId: string
  
  // All versions
  versions: AssetVersion[]
  totalVersions: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  tags: string[]
  designType: DesignType
}

export interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
  updatedAt?: Date
  // Clearance system comment fields
  isSystemComment?: boolean
  clearanceType?: 'admin' | 'legal' | 'qa'
  clearanceReason?: string
  linkedAsset?: string
  linkedAssetId?: string
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
  mode?: "manual" | "generative" | "assisted"
  intendedUses?: string[]
  deliverableType?: string
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
/** Asset and version approval workflow; matches VersionStatus for consistency. */
export type ApprovalStatus = VersionStatus
export type CheckStatus = "not-started" | "pending" | "checking" | "completed" | "failed"

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
  /** Copyright score 0-100 used in overallScore (same as 100 - similarityScore when from our generators) */
  score?: number
  matchedSources: MatchedSource[]
  riskBreakdown: RiskBreakdown
  recommendations: string[]
  checkedAt: Date
  checkDuration?: number // in milliseconds
}

// ADA/Accessibility Check
export interface AccessibilityIssue {
  severity: "critical" | "serious" | "moderate" | "minor"
  type: "contrast" | "text" | "structure" | "navigation" | "aria"
  description: string
  element?: string
  recommendation: string
}

export interface AccessibilityCheckData {
  score: number // 0-100, WCAG compliance score
  issues: AccessibilityIssue[]
  wcagLevel: "A" | "AA" | "AAA" | "none"
  colorContrast: {
    passed: boolean
    ratio: number
    recommendation: string
  }
  altText: {
    present: boolean
    quality: "good" | "fair" | "poor" | "missing"
  }
  recommendations: string[]
  checkedAt: Date
  checkDuration?: number
}

// SEO Check
export interface SEOCheckData {
  score: number // 0-100
  imageOptimization: {
    format: "optimal" | "acceptable" | "poor"
    sizeRating: "excellent" | "good" | "large" | "too-large"
    compressionPotential: number // percentage
  }
  metadata: {
    filenameQuality: "descriptive" | "generic" | "poor"
    altTextPresent: boolean
    dimensionsOptimal: boolean
  }
  recommendations: string[]
  checkedAt: Date
  checkDuration?: number
}

// Brand Compliance Check
export interface BrandComplianceCheckData {
  score: number // 0-100
  colorCompliance: {
    passed: boolean
    brandColorsUsed: string[]
    offBrandColors: string[]
  }
  logoUsage: {
    passed: boolean
    issues: string[]
  }
  styleGuideAdherence: number // 0-100
  recommendations: string[]
  checkedAt: Date
  checkDuration?: number
}

// Performance Check
export interface PerformanceCheckData {
  score: number // 0-100
  fileSize: {
    current: number
    optimal: number
    savings: number // bytes
  }
  loadTimeEstimate: number // milliseconds
  compressionScore: number // 0-100
  formatRecommendation?: string
  recommendations: string[]
  checkedAt: Date
  checkDuration?: number
}

// Security/Malware Check
export interface SecurityThreat {
  severity: "critical" | "high" | "medium" | "low"
  type: "malware" | "suspicious-code" | "metadata-leak" | "embedded-content"
  description: string
}

export interface SecurityCheckData {
  score: number // 0-100, 100 = clean
  threats: SecurityThreat[]
  safe: boolean
  recommendations: string[]
  checkedAt: Date
  checkDuration?: number
}

// Comprehensive Asset Review Data
export interface AssetReviewData {
  overallScore: number // 0-100, weighted average
  checksCompleted: number
  totalChecks: number
  copyright: {
    status: CheckStatus
    data?: CopyrightCheckData
  }
  accessibility: {
    status: CheckStatus
    data?: AccessibilityCheckData
  }
  seo: {
    status: CheckStatus
    data?: SEOCheckData
  }
  brandCompliance: {
    status: CheckStatus
    data?: BrandComplianceCheckData
  }
  performance: {
    status: CheckStatus
    data?: PerformanceCheckData
  }
  security: {
    status: CheckStatus
    data?: SecurityCheckData
  }
  lastReviewedAt?: Date
  reviewedBy?: string
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
  approvedByName?: string // display name of approver
  approvedAt?: Date
  approvalReason?: string // reason for manual approval
  rejectionReason?: string
  // Comprehensive review data
  reviewData?: AssetReviewData
  quickScores?: {
    overall: number
    copyright: number
    accessibility: number
    seo: number
  }
  commentsCount?: number
  comments?: VersionComment[]
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
  | "compliance"
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
  compliance: {
    label: "Compliance",
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
  compliance: {
    label: "Compliance",
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

