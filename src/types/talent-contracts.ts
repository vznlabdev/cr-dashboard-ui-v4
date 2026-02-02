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

export interface TalentContract {
  id: string
  talentId: string
  templateType: ContractTemplateType
  status: ContractStatus
  version: number
  
  // Contract details
  title: string
  contractUrl: string
  signedContractUrl?: string
  
  // Terms
  validFrom: Date
  validThrough: Date
  compensationType: CompensationType
  compensationAmount?: number
  royaltyPercentage?: number
  
  // Rights granted
  rightsGranted: {
    name: boolean
    image: boolean
    likeness: boolean
    persona: boolean
  }
  usageRestrictions: string[]
  territoryRestrictions?: string[]
  exclusivity: boolean
  
  // Workflow
  sentAt?: Date
  viewedAt?: Date
  lastNegotiationAt?: Date
  signedAt?: Date
  signedByTalent?: boolean
  signedByAdmin?: boolean
  
  // Negotiation
  negotiations: ContractNegotiation[]
  
  createdAt: Date
  createdBy: string
  updatedAt: Date
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
