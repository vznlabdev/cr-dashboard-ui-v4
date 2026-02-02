import type { TalentType } from "./talent-rights"

export type HiringStage = 
  | "prospect"
  | "contacted"
  | "screening"
  | "negotiating"
  | "contract_sent"
  | "onboarding"
  | "active"
  | "rejected"
  | "withdrawn"

export type ProspectSource = "referral" | "discovery" | "direct" | "agency"

export type ProspectPriority = "low" | "medium" | "high"

export interface TalentProspect {
  id: string
  name: string
  email?: string
  phone?: string
  talentType: TalentType
  source: ProspectSource
  
  // Pipeline
  stage: HiringStage
  priority: ProspectPriority
  assignedTo?: string
  
  // Evaluation
  portfolioUrl?: string
  socialMedia: { platform: string; url: string }[]
  notes: string[]
  tags: string[]
  estimatedRate?: number
  
  // Timeline
  contactedAt?: Date
  nextFollowUp?: Date
  stageHistory: StageHistoryEntry[]
  
  createdAt: Date
  createdBy: string
}

export interface StageHistoryEntry {
  stage: HiringStage
  movedAt: Date
  movedBy: string
  notes?: string
}
