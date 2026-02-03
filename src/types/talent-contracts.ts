export type ContractStatus = 
  | "draft"
  | "sent"
  | "under_review"
  | "negotiating"
  | "pending_signature"
  | "signed"
  | "expired"
  | "terminated"

export type CompensationType = "flat_fee" | "royalty" | "per_use" | "hybrid"

export type ContractTemplateType = "standard" | "minor" | "character" | "mascot"

export type ContractType = 
  | "nilp_rights_agreement"
  | "usage_rights"
  | "brand_endorsement"
  | "work_for_hire"
  | "other"

// ==============================================
// NILP Rights Structures
// ==============================================

export interface NILPRightsGranted {
  name: {
    included: boolean
    usage: string[]  // ["campaign_credits", "social_media", "press_releases"]
    restrictions?: string
  }
  image: {
    included: boolean
    approvedImages?: string[]  // Asset IDs or URLs
    usage: string[]  // ["tv_commercial", "digital_ads", "social_media"]
    restrictions?: string
  }
  likeness: {
    included: boolean
    aiGeneration: boolean
    approvedTools?: string[]  // ["chatgpt", "midjourney"]
    requiresApproval: boolean
    restrictions?: string
  }
  persona: {
    included: boolean
    personalityTraits?: string[]
    brandVoice?: string
    messagingTone?: string
    restrictions?: string
  }
}

export interface ContractTerms {
  effectiveDate: Date
  expirationDate: Date
  territory: string[]  // ["United States", "Canada", "Global"]
  mediaChannels: string[]  // ["tv", "digital", "social", "print"]
  intendedUse: string  // "Advertising and promotional materials"
  category: string  // "Sports Apparel", "Consumer Electronics"
  exclusivity: {
    isExclusive: boolean
    blockedCategories?: string[]
    competitors?: string[]
  }
  autoRenewal: boolean
  renewalTerms?: string
}

export interface ContractCompensation {
  totalAmount: number
  currency: string
  breakdown?: {
    nameRights?: number
    imageRights?: number
    likenessRights?: number
    personaRights?: number
  }
  paymentTerms: string  // "Net 30", "Upon signature"
  paymentMethod?: string
  paymentStatus: "pending" | "paid" | "overdue"
  paidAt?: Date
  invoiceNumber?: string
}

export interface ContractDocument {
  id: string
  type: "contract" | "brief" | "invoice" | "amendment"
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: Date
  uploadedBy: string
  signedAt?: Date
  signatureMethod?: "electronic" | "physical"
  signatureIpAddress?: string
}

export interface ContractReminder {
  type: "30_days" | "7_days" | "category_available"
  enabled: boolean
  triggeredAt?: Date
}

export interface ContractHistoryEntry {
  id: string
  action: "created" | "sent" | "viewed" | "negotiated" | "signed" | "executed" | "paid" | "renewed" | "terminated"
  timestamp: Date
  performedBy: string
  performedByName?: string
  details?: string
}

export interface TalentContract {
  id: string
  talentId: string
  talentName: string
  templateType: ContractTemplateType
  contractType: ContractType
  status: ContractStatus
  version: number
  
  // Contract details
  title: string
  contractId: string  // Format: CR-YYYY-###-BRAND
  brandName: string
  brandLogoUrl?: string
  projectId?: string  // Link to specific task/project
  projectTitle?: string
  
  // File management
  contractUrl: string
  signedContractUrl?: string
  
  // NILP Rights
  nilpRights: NILPRightsGranted
  
  // Terms
  terms: ContractTerms
  
  // Compensation
  compensation: ContractCompensation
  
  // Legacy compensation fields (for backward compatibility)
  compensationType: CompensationType
  compensationAmount?: number
  royaltyPercentage?: number
  validFrom: Date
  validThrough: Date
  
  // Legacy rights (for backward compatibility)
  rightsGranted: {
    name: boolean
    image: boolean
    likeness: boolean
    persona: boolean
  }
  usageRestrictions: string[]
  territoryRestrictions?: string[]
  exclusivity: boolean
  
  // Documents
  documents: ContractDocument[]
  
  // Special provisions
  specialProvisions?: string[]
  approvalRights: boolean
  moralRights: boolean
  terminationNotice?: number  // days
  
  // Reminders & Notifications
  reminders: ContractReminder[]
  
  // Workflow
  sentAt?: Date
  viewedAt?: Date
  lastNegotiationAt?: Date
  signedAt?: Date
  signedByTalent?: boolean
  signedByAdmin?: boolean
  executedAt?: Date
  
  // Negotiation
  negotiations: ContractNegotiation[]
  
  // History
  contractHistory: ContractHistoryEntry[]
  
  // Metadata
  createdAt: Date
  createdBy: string
  createdByName?: string
  updatedAt: Date
  updatedBy?: string
}

export interface ContractNegotiation {
  id: string
  contractId: string
  proposedBy: "talent" | "admin"
  proposedAt: Date
  changes: ContractChange[]
  status: "pending" | "accepted" | "rejected"
  respondedAt?: Date
  notes?: string
}

export interface ContractChange {
  field: string
  oldValue: any
  newValue: any
  reason?: string
}

// ==============================================
// Form & UI Types
// ==============================================

export interface CreateContractForm {
  talentId: string
  title: string
  brandName: string
  contractType: ContractType
  projectId?: string
  nilpRights: NILPRightsGranted
  terms: ContractTerms
  compensation: ContractCompensation
  reminders: ContractReminder[]
  specialProvisions?: string[]
}

export interface SignatureData {
  fullLegalName: string
  agreedToTerms: boolean
  ipAddress?: string
  timestamp: Date
}

// ==============================================
// Helper Functions
// ==============================================

export function getDaysUntilExpiration(expirationDate: Date): number {
  const now = new Date()
  const diff = expirationDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getContractStatusColor(status: ContractStatus): string {
  switch (status) {
    case "draft": return "text-gray-600"
    case "sent": return "text-blue-600"
    case "under_review": return "text-yellow-600"
    case "negotiating": return "text-orange-600"
    case "pending_signature": return "text-purple-600"
    case "signed": return "text-green-600"
    case "expired": return "text-red-600"
    case "terminated": return "text-gray-600"
    default: return "text-gray-600"
  }
}

export function getContractStatusBadgeVariant(status: ContractStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "signed": return "default"
    case "expired": return "destructive"
    case "terminated": return "destructive"
    case "pending_signature": return "secondary"
    default: return "outline"
  }
}
