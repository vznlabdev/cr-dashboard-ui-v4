import type {
  ComplianceOverview,
  ConsentRecord,
  AssetProfile,
  ProvenanceScore,
  ModelRiskScore,
  EvidenceRecord,
  JurisdictionProfile,
  LegislationNewsItem,
  ComplianceFilters,
  PremiumCalculation,
  RemediationItem,
  RiskClass,
  CountryJurisdictionProfile,
  GlobalLegislationNewsItem,
  LegislationNewsCategory,
} from "@/types/compliance"

import {
  complianceOverview,
  consentRecords,
  assetProfiles,
  provenanceScores,
  modelRiskScores,
  evidenceRecords,
  jurisdictionProfiles,
  legislationNews,
  getMRSMapping,
  countryJurisdictionProfiles,
  globalLegislationNews,
} from "./mock-data"

// Simulated network delay
function delay(ms: number = 200 + Math.random() * 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==============================================
// Dashboard Overview
// ==============================================

export async function getComplianceOverview(filters?: ComplianceFilters): Promise<ComplianceOverview> {
  await delay()
  // In a real app, filters would scope the data server-side
  return complianceOverview
}

// ==============================================
// Consent Records (ACLAR)
// ==============================================

export interface ConsentRecordFilters extends ComplianceFilters {
  type?: ConsentRecord["type"]
  status?: ConsentRecord["status"]
}

export async function getConsentRecords(filters?: ConsentRecordFilters): Promise<ConsentRecord[]> {
  await delay()
  let results = [...consentRecords]

  if (filters?.type) {
    results = results.filter((r) => r.type === filters.type)
  }
  if (filters?.status) {
    results = results.filter((r) => r.status === filters.status)
  }
  if (filters?.jurisdiction && filters.jurisdiction.length > 0) {
    results = results.filter((r) => filters.jurisdiction!.includes(r.jurisdiction))
  }
  if (filters?.projectId) {
    results = results.filter((r) => r.projectId === filters.projectId)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (r) =>
        r.entityName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.hash.toLowerCase().includes(q)
    )
  }
  return results
}

export async function getConsentRecord(id: string): Promise<ConsentRecord | undefined> {
  await delay(150)
  return consentRecords.find((r) => r.id === id)
}

// ==============================================
// Asset Profiles (KYA)
// ==============================================

export interface AssetProfileFilters extends ComplianceFilters {
  origin?: AssetProfile["origin"]
  riskLevel?: AssetProfile["riskLevel"]
  status?: AssetProfile["status"]
  contentType?: AssetProfile["contentType"]
}

export async function getAssetProfiles(filters?: AssetProfileFilters): Promise<AssetProfile[]> {
  await delay()
  let results = [...assetProfiles]

  if (filters?.origin) {
    results = results.filter((a) => a.origin === filters.origin)
  }
  if (filters?.riskLevel) {
    results = results.filter((a) => a.riskLevel === filters.riskLevel)
  }
  if (filters?.status) {
    results = results.filter((a) => a.status === filters.status)
  }
  if (filters?.contentType) {
    results = results.filter((a) => a.contentType === filters.contentType)
  }
  if (filters?.projectId) {
    results = results.filter((a) => a.projectId === filters.projectId)
  }
  if (filters?.jurisdiction && filters.jurisdiction.length > 0) {
    results = results.filter((a) => a.jurisdictions.some((j) => filters.jurisdiction!.includes(j)))
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.assetId.toLowerCase().includes(q)
    )
  }
  return results
}

export async function getAssetProfile(id: string): Promise<AssetProfile | undefined> {
  await delay(150)
  return assetProfiles.find((a) => a.id === id || a.assetId === id)
}

// ==============================================
// Scoring
// ==============================================

export async function getProvenanceScore(assetId: string): Promise<ProvenanceScore | undefined> {
  await delay(150)
  return provenanceScores.find((ps) => ps.assetId === assetId)
}

export async function getProvenanceScores(): Promise<ProvenanceScore[]> {
  await delay()
  return provenanceScores
}

export async function getModelRiskScore(modelId: string): Promise<ModelRiskScore | undefined> {
  await delay(150)
  return modelRiskScores.find((m) => m.modelId === modelId)
}

export async function getModelRiskScores(): Promise<ModelRiskScore[]> {
  await delay()
  return modelRiskScores
}

export async function getModelRiskExplainability(modelId: string): Promise<{
  model: ModelRiskScore
  remediationRoadmap: RemediationItem[]
  projectedMRS: number
} | null> {
  await delay(300)
  const model = modelRiskScores.find((m) => m.modelId === modelId)
  if (!model) return null

  // Build remediation roadmap from failing/warning risk factors
  const remediationRoadmap: RemediationItem[] = model.riskFactors
    .filter((f) => f.status !== "PASS" && f.estimatedImprovement > 0)
    .sort((a, b) => b.estimatedImprovement - a.estimatedImprovement)
    .map((f, idx) => ({
      action: f.remediationAction,
      estimatedImprovement: f.estimatedImprovement,
      effort: f.estimatedImprovement > 10 ? "High" : f.estimatedImprovement > 5 ? "Medium" : "Low",
      priority: idx + 1,
    }))

  const projectedMRS = Math.min(100, model.finalMRS + remediationRoadmap.reduce((sum, r) => sum + r.estimatedImprovement, 0))

  return { model, remediationRoadmap, projectedMRS }
}

// ==============================================
// Evidence
// ==============================================

export async function getEvidenceRecords(filters?: ComplianceFilters): Promise<EvidenceRecord[]> {
  await delay()
  let results = [...evidenceRecords]

  if (filters?.projectId) {
    results = results.filter((e) => e.projectId === filters.projectId)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (e) =>
        e.incidentId.toLowerCase().includes(q) ||
        e.assetName?.toLowerCase().includes(q) ||
        e.modelName?.toLowerCase().includes(q)
    )
  }
  return results
}

export async function getEvidenceRecord(incidentId: string): Promise<EvidenceRecord | undefined> {
  await delay(150)
  return evidenceRecords.find((e) => e.incidentId === incidentId || e.id === incidentId)
}

// ==============================================
// Jurisdictions
// ==============================================

export async function getJurisdictions(): Promise<JurisdictionProfile[]> {
  await delay()
  return jurisdictionProfiles
}

export async function getJurisdiction(stateCode: string): Promise<JurisdictionProfile | undefined> {
  await delay(100)
  return jurisdictionProfiles.find((j) => j.stateCode === stateCode)
}

export async function getLegislationNews(filters?: {
  stateCode?: string
  category?: LegislationNewsItem["category"]
  limit?: number
}): Promise<LegislationNewsItem[]> {
  await delay()
  let results = [...legislationNews]

  if (filters?.stateCode) {
    results = results.filter((n) => n.stateCode === filters.stateCode)
  }
  if (filters?.category) {
    results = results.filter((n) => n.category === filters.category)
  }
  if (filters?.limit) {
    results = results.slice(0, filters.limit)
  }
  return results
}

// ==============================================
// Country / Global Jurisdictions
// ==============================================

export async function getCountryJurisdictions(): Promise<CountryJurisdictionProfile[]> {
  await delay()
  return countryJurisdictionProfiles
}

export async function getCountryJurisdiction(countryCode: string): Promise<CountryJurisdictionProfile | undefined> {
  await delay(100)
  return countryJurisdictionProfiles.find((j) => j.countryCode === countryCode)
}

export async function getGlobalLegislationNews(filters?: {
  countryCode?: string
  category?: LegislationNewsCategory
  limit?: number
}): Promise<GlobalLegislationNewsItem[]> {
  await delay()
  let results = [...globalLegislationNews]

  if (filters?.countryCode) {
    results = results.filter((n) => n.countryCode === filters.countryCode)
  }
  if (filters?.category) {
    results = results.filter((n) => n.category === filters.category)
  }
  if (filters?.limit) {
    results = results.slice(0, filters.limit)
  }
  return results
}

// ==============================================
// Premium Calculation
// ==============================================

export async function calculatePremium(
  policyLimit: number,
  baseRate: number,
  jurisdictionCode: string,
  mrs: number
): Promise<PremiumCalculation> {
  await delay(100)

  const jurisdiction = jurisdictionProfiles.find((j) => j.stateCode === jurisdictionCode)
  const jurisdictionMultiplier = jurisdiction?.multiplier ?? 1.0
  const mrsMapping = getMRSMapping(mrs)

  const premium = mrsMapping.riskClass === "Critical"
    ? 0 // Decline
    : policyLimit * (baseRate / 100) * mrsMapping.premiumMultiplier * jurisdictionMultiplier

  return {
    policyLimit,
    baseRate,
    jurisdiction: jurisdictionCode,
    jurisdictionMultiplier,
    mrs,
    riskMultiplier: mrsMapping.premiumMultiplier,
    riskClass: mrsMapping.riskClass,
    premium: Math.round(premium),
    deductible: mrsMapping.deductiblePct !== null ? Math.round(policyLimit * (mrsMapping.deductiblePct / 100)) : null,
    maxCapacity: Math.round(policyLimit * (mrsMapping.maxCapacityPct / 100)),
  }
}

// ==============================================
// Multi-State Risk Calculator
// ==============================================

export async function calculateMultiStateRisk(
  stateCodes: string[],
  contentType: string
): Promise<{
  states: JurisdictionProfile[]
  combinedPenaltyExposure: string
  recommendedMultiplier: number
  riskLevel: RiskClass
}> {
  await delay(200)

  const states = jurisdictionProfiles.filter((j) => stateCodes.includes(j.stateCode))
  const maxMultiplier = Math.max(...states.map((s) => s.multiplier), 1.0)
  const avgMultiplier = states.length > 0 ? states.reduce((sum, s) => sum + s.multiplier, 0) / states.length : 1.0

  const riskLevel: RiskClass =
    maxMultiplier >= 1.8 ? "Elevated" :
      maxMultiplier >= 1.4 ? "Guarded" :
        maxMultiplier >= 1.2 ? "Moderate" : "Low"

  return {
    states,
    combinedPenaltyExposure: `Up to $${(states.length * 5000).toLocaleString()} aggregate`,
    recommendedMultiplier: Math.round(Math.max(maxMultiplier, avgMultiplier * 1.1) * 100) / 100,
    riskLevel,
  }
}
