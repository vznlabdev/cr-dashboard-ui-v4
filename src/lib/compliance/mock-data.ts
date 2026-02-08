import type {
  ConsentRecord,
  AssetProfile,
  ProvenanceScore,
  ModelRiskScore,
  EvidenceRecord,
  JurisdictionProfile,
  LegislationNewsItem,
  ComplianceAlert,
  ComplianceOverview,
  MRSInsuranceMapping,
  RiskClass,
  RiskFactor,
  ScoreChange,
  JurisdictionImpact,
  EvidenceCategoryKey,
  EvidenceCategoryData,
  EvidenceTimelineEvent,
  AuditTrailEntry,
  CountryJurisdictionProfile,
  GlobalLegislationNewsItem,
} from "@/types/compliance"

// ==============================================
// MRS-to-Insurance Mapping Table
// ==============================================

export const mrsInsuranceMappings: MRSInsuranceMapping[] = [
  { mrsRange: [90, 100], riskClass: "Low", premiumMultiplier: 0.8, deductiblePct: 1, maxCapacityPct: 100 },
  { mrsRange: [80, 89], riskClass: "Moderate", premiumMultiplier: 1.0, deductiblePct: 2.5, maxCapacityPct: 75 },
  { mrsRange: [70, 79], riskClass: "Guarded", premiumMultiplier: 1.25, deductiblePct: 5, maxCapacityPct: 50 },
  { mrsRange: [60, 69], riskClass: "Elevated", premiumMultiplier: 1.75, deductiblePct: 10, maxCapacityPct: 25 },
  { mrsRange: [50, 59], riskClass: "Severe", premiumMultiplier: 2.5, deductiblePct: null, maxCapacityPct: 0 },
  { mrsRange: [0, 49], riskClass: "Critical", premiumMultiplier: 0, deductiblePct: null, maxCapacityPct: 0 },
]

export function getMRSMapping(mrs: number): MRSInsuranceMapping {
  for (const mapping of mrsInsuranceMappings) {
    if (mrs >= mapping.mrsRange[0] && mrs <= mapping.mrsRange[1]) return mapping
  }
  return mrsInsuranceMappings[mrsInsuranceMappings.length - 1]
}

export function getRiskClassForMRS(mrs: number): RiskClass {
  return getMRSMapping(mrs).riskClass
}

// ==============================================
// Jurisdiction Profiles (50 states)
// ==============================================

export const jurisdictionProfiles: JurisdictionProfile[] = [
  // --- Detailed states ---
  {
    state: "New York", stateCode: "NY",
    lawCategories: ["AI_AD_DISCLOSURE", "NIL_RIGHTS", "RIGHT_OF_PUBLICITY", "DEEPFAKE", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "$1,000 first / $5,000 subsequent",
    nilPenalty: "$2,000 per unauthorized use",
    deepfakePenalty: "$10,000 per incident + injunction",
    enforcementIntensity: "Very High", multiplier: 1.8,
    legislationStatus: "ENACTED", effectiveDate: "2025-01-01",
    statuteReference: "NY S.5959-B / A.8195-A",
    summary: "Comprehensive AI content regulation requiring disclosure on all AI-generated advertising, strict NIL protections, and deepfake prohibitions for commercial use."
  },
  {
    state: "California", stateCode: "CA",
    lawCategories: ["AI_AD_DISCLOSURE", "NIL_RIGHTS", "RIGHT_OF_PUBLICITY", "DEEPFAKE", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "$2,500 per violation",
    nilPenalty: "$5,000 per unauthorized use",
    deepfakePenalty: "Up to $150,000 + statutory damages",
    enforcementIntensity: "Very High", multiplier: 2.0,
    legislationStatus: "ENACTED", effectiveDate: "2024-09-17",
    statuteReference: "AB 2602 / AB 1836 / SB 942",
    summary: "Strongest AI content laws in the US. Covers synthetic performer protections, posthumous likeness rights, and mandatory AI watermarking for political and commercial content."
  },
  {
    state: "Tennessee", stateCode: "TN",
    lawCategories: ["NIL_RIGHTS", "RIGHT_OF_PUBLICITY", "DEEPFAKE"],
    aiAdPenalty: "N/A",
    nilPenalty: "Actual damages + profits",
    deepfakePenalty: "Actual damages + attorney fees",
    enforcementIntensity: "High", multiplier: 1.5,
    legislationStatus: "ENACTED", effectiveDate: "2024-07-01",
    statuteReference: "ELVIS Act (SB 2096)",
    summary: "The ELVIS Act — first state to explicitly protect voice and likeness from AI replication. Covers musicians, performers, and public figures."
  },
  {
    state: "Texas", stateCode: "TX",
    lawCategories: ["DEEPFAKE", "RIGHT_OF_PUBLICITY", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "N/A",
    nilPenalty: "$2,500 per incident",
    deepfakePenalty: "Class A misdemeanor + civil liability",
    enforcementIntensity: "High", multiplier: 1.4,
    legislationStatus: "ENACTED", effectiveDate: "2024-09-01",
    statuteReference: "SB 1361 / HB 2125",
    summary: "Expanded deepfake criminalization and biometric data protections. Civil cause of action for unauthorized digital likeness use."
  },
  {
    state: "Florida", stateCode: "FL",
    lawCategories: ["RIGHT_OF_PUBLICITY", "DEEPFAKE", "NIL_RIGHTS"],
    aiAdPenalty: "N/A",
    nilPenalty: "$1,000 per violation",
    deepfakePenalty: "Third-degree felony for malicious deepfakes",
    enforcementIntensity: "High", multiplier: 1.3,
    legislationStatus: "ENACTED", effectiveDate: "2025-07-01",
    statuteReference: "HB 919 / SB 1798",
    summary: "Expanded right of publicity to cover AI-generated replicas. Criminal penalties for malicious deepfakes."
  },
  {
    state: "Illinois", stateCode: "IL",
    lawCategories: ["BIOMETRIC_LIKENESS", "AI_AD_DISCLOSURE", "NIL_RIGHTS", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "$1,000 per violation",
    nilPenalty: "Actual damages or $1,000 per violation",
    deepfakePenalty: "N/A (covered under BIPA)",
    enforcementIntensity: "Very High", multiplier: 1.7,
    legislationStatus: "ENACTED", effectiveDate: "2008-10-03",
    statuteReference: "BIPA (740 ILCS 14) + AI Video Interview Act",
    summary: "BIPA is the strongest biometric privacy law in the US. Private right of action for biometric data misuse. AI content disclosure requirements for hiring."
  },
  {
    state: "Massachusetts", stateCode: "MA",
    lawCategories: ["AI_AD_DISCLOSURE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "$500 per violation",
    nilPenalty: "Actual damages",
    deepfakePenalty: "N/A",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "ENACTED", effectiveDate: "2025-03-01",
    statuteReference: "H.70 / S.31",
    summary: "AI advertising disclosure requirements and enhanced right of publicity protections for digital likenesses."
  },
  // --- States with proposed legislation ---
  {
    state: "Washington", stateCode: "WA",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "$5,000 per violation",
    nilPenalty: "Actual damages",
    deepfakePenalty: "$10,000 per incident",
    enforcementIntensity: "High", multiplier: 1.5,
    legislationStatus: "ENACTED", effectiveDate: "2024-06-06",
    statuteReference: "SB 5152 / HB 1999",
    summary: "AI deepfake disclosure and consent requirements. Enhanced digital likeness protections."
  },
  {
    state: "Georgia", stateCode: "GA",
    lawCategories: ["RIGHT_OF_PUBLICITY", "DEEPFAKE"],
    aiAdPenalty: "N/A",
    nilPenalty: "Actual damages",
    deepfakePenalty: "Proposed: $5,000 per incident",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "SB 321",
    summary: "Proposed expansion of right of publicity to cover AI-generated content and digital replicas."
  },
  {
    state: "Colorado", stateCode: "CO",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "CPA enforcement actions",
    nilPenalty: "N/A",
    deepfakePenalty: "N/A",
    enforcementIntensity: "Medium", multiplier: 1.15,
    legislationStatus: "ENACTED", effectiveDate: "2025-02-01",
    statuteReference: "SB 24-205",
    summary: "Colorado AI Act requiring transparency and disclosure for high-risk AI systems including content generation."
  },
  // --- Remaining states (minimal profiles) ---
  ...generateRemainingStates(),
]

function generateRemainingStates(): JurisdictionProfile[] {
  const coveredCodes = ["NY", "CA", "TN", "TX", "FL", "IL", "MA", "WA", "GA", "CO"]
  const allStates: [string, string][] = [
    ["Alabama", "AL"], ["Alaska", "AK"], ["Arizona", "AZ"], ["Arkansas", "AR"],
    ["Connecticut", "CT"], ["Delaware", "DE"], ["Hawaii", "HI"], ["Idaho", "ID"],
    ["Indiana", "IN"], ["Iowa", "IA"], ["Kansas", "KS"], ["Kentucky", "KY"],
    ["Louisiana", "LA"], ["Maine", "ME"], ["Maryland", "MD"], ["Michigan", "MI"],
    ["Minnesota", "MN"], ["Mississippi", "MS"], ["Missouri", "MO"], ["Montana", "MT"],
    ["Nebraska", "NE"], ["Nevada", "NV"], ["New Hampshire", "NH"], ["New Jersey", "NJ"],
    ["New Mexico", "NM"], ["North Carolina", "NC"], ["North Dakota", "ND"], ["Ohio", "OH"],
    ["Oklahoma", "OK"], ["Oregon", "OR"], ["Pennsylvania", "PA"], ["Rhode Island", "RI"],
    ["South Carolina", "SC"], ["South Dakota", "SD"], ["Utah", "UT"], ["Vermont", "VT"],
    ["Virginia", "VA"], ["West Virginia", "WV"], ["Wisconsin", "WI"], ["Wyoming", "WY"],
  ]

  const proposedStates = ["NJ", "PA", "MI", "OH", "VA", "MN", "OR", "NV"]
  const inCommittee = ["AZ", "MD", "NC", "WI"]

  return allStates
    .filter(([, code]) => !coveredCodes.includes(code))
    .map(([state, code]) => {
      const isProposed = proposedStates.includes(code)
      const isInCommittee = inCommittee.includes(code)
      return {
        state, stateCode: code,
        lawCategories: isProposed ? ["RIGHT_OF_PUBLICITY" as const] : [],
        aiAdPenalty: "N/A", nilPenalty: "N/A", deepfakePenalty: "N/A",
        enforcementIntensity: "None" as const,
        multiplier: 1.0,
        legislationStatus: isProposed ? "PROPOSED" as const : isInCommittee ? "IN_COMMITTEE" as const : "NONE" as const,
      }
    })
}

// ==============================================
// Legislation News Items (20)
// ==============================================

export const legislationNews: LegislationNewsItem[] = [
  { id: "ln-1", headline: "New York enacts comprehensive AI advertising disclosure law", state: "New York", stateCode: "NY", date: "2025-01-15", category: "NEW_LAW", summary: "NY S.5959-B signed into law requiring clear disclosure on all AI-generated or AI-modified advertising content distributed in New York State.", sourceUrl: "#" },
  { id: "ln-2", headline: "California expands synthetic performer protections under AB 2602", state: "California", stateCode: "CA", date: "2025-01-10", category: "NEW_LAW", summary: "New provisions strengthen protections for performers against unauthorized AI replicas of their voice and likeness in entertainment productions.", sourceUrl: "#" },
  { id: "ln-3", headline: "Tennessee ELVIS Act enforcement: First major AI voice case filed", state: "Tennessee", stateCode: "TN", date: "2025-02-01", category: "ENFORCEMENT_ACTION", summary: "TN Attorney General files first enforcement action under the ELVIS Act against an AI music platform for generating unauthorized vocal replicas.", sourceUrl: "#" },
  { id: "ln-4", headline: "Illinois BIPA amendment addresses AI-generated biometric data", state: "Illinois", stateCode: "IL", date: "2025-01-22", category: "AMENDMENT", summary: "Amendment to BIPA explicitly covers AI-generated biometric identifiers and establishes new consent requirements for synthetic biometric data.", sourceUrl: "#" },
  { id: "ln-5", headline: "Texas expands deepfake criminal penalties for commercial use", state: "Texas", stateCode: "TX", date: "2025-01-28", category: "NEW_LAW", summary: "HB 2125 signed, creating enhanced criminal penalties for commercial deepfakes used without consent in advertising and marketing.", sourceUrl: "#" },
  { id: "ln-6", headline: "Florida digital likeness protection bill advances to Senate", state: "Florida", stateCode: "FL", date: "2025-02-03", category: "PROPOSED", summary: "HB 919 passes Florida House, expanding right of publicity to cover AI-generated digital replicas in commercial contexts.", sourceUrl: "#" },
  { id: "ln-7", headline: "Massachusetts passes AI ad disclosure requirements", state: "Massachusetts", stateCode: "MA", date: "2025-01-18", category: "NEW_LAW", summary: "H.70 enacted requiring businesses to disclose use of AI in consumer-facing advertising and marketing materials.", sourceUrl: "#" },
  { id: "ln-8", headline: "New Jersey introduces comprehensive AI content bill", state: "New Jersey", stateCode: "NJ", date: "2025-01-30", category: "PROPOSED", summary: "Bipartisan bill introduced covering AI advertising disclosure, NIL protections, and deepfake penalties modeled on California's approach.", sourceUrl: "#" },
  { id: "ln-9", headline: "Washington state deepfake consent law takes effect", state: "Washington", stateCode: "WA", date: "2025-01-05", category: "NEW_LAW", summary: "SB 5152 enforcement begins requiring explicit consent for AI-generated replicas of individuals in commercial content.", sourceUrl: "#" },
  { id: "ln-10", headline: "Colorado AI Act transparency requirements go live", state: "Colorado", stateCode: "CO", date: "2025-02-01", category: "NEW_LAW", summary: "SB 24-205 takes effect requiring high-risk AI system operators to provide transparency disclosures including content generation tools.", sourceUrl: "#" },
  { id: "ln-11", headline: "Georgia proposes AI right of publicity expansion", state: "Georgia", stateCode: "GA", date: "2025-01-25", category: "PROPOSED", summary: "SB 321 introduced to expand Georgia's right of publicity statute to explicitly cover AI-generated replicas of living and deceased individuals.", sourceUrl: "#" },
  { id: "ln-12", headline: "FTC issues guidance on AI-generated endorsements", state: "Federal", stateCode: "US", date: "2025-01-12", category: "ENFORCEMENT_ACTION", summary: "FTC publishes updated endorsement guidelines specifically addressing AI-generated testimonials and synthetic spokespersons in advertising.", sourceUrl: "#" },
  { id: "ln-13", headline: "Pennsylvania introduces AI content labeling bill", state: "Pennsylvania", stateCode: "PA", date: "2025-02-02", category: "PROPOSED", summary: "Bipartisan bill requiring clear labeling of AI-generated content in political advertising and commercial media.", sourceUrl: "#" },
  { id: "ln-14", headline: "Michigan proposes AI performer protections", state: "Michigan", stateCode: "MI", date: "2025-01-20", category: "PROPOSED", summary: "New bill modeled on Tennessee ELVIS Act to protect musicians and performers from unauthorized AI voice and likeness replication.", sourceUrl: "#" },
  { id: "ln-15", headline: "NY AG announces AI advertising enforcement initiative", state: "New York", stateCode: "NY", date: "2025-02-04", category: "ENFORCEMENT_ACTION", summary: "New York Attorney General creates dedicated AI content compliance unit to enforce new advertising disclosure requirements.", sourceUrl: "#" },
  { id: "ln-16", headline: "Virginia committee reviews AI likeness protection bill", state: "Virginia", stateCode: "VA", date: "2025-01-27", category: "PROPOSED", summary: "House committee advances bill creating civil cause of action for unauthorized AI-generated likenesses in commercial content.", sourceUrl: "#" },
  { id: "ln-17", headline: "Ohio introduces AI-generated content transparency act", state: "Ohio", stateCode: "OH", date: "2025-01-15", category: "PROPOSED", summary: "Proposed legislation requiring platforms to label AI-generated content and provide provenance metadata.", sourceUrl: "#" },
  { id: "ln-18", headline: "Oregon considers AI deepfake ban in political advertising", state: "Oregon", stateCode: "OR", date: "2025-02-03", category: "PROPOSED", summary: "Bill introduced prohibiting AI-generated deepfakes in political advertising within 60 days of an election.", sourceUrl: "#" },
  { id: "ln-19", headline: "Minnesota proposes AI training data disclosure requirements", state: "Minnesota", stateCode: "MN", date: "2025-01-31", category: "PROPOSED", summary: "Novel bill requiring AI content generators to disclose training data sources and obtain consent from identified individuals.", sourceUrl: "#" },
  { id: "ln-20", headline: "Nevada introduces AI entertainment industry protections", state: "Nevada", stateCode: "NV", date: "2025-02-05", category: "PROPOSED", summary: "Bill targets AI-generated entertainment content in Las Vegas, requiring performer consent for digital replicas in shows and advertising.", sourceUrl: "#" },
]

// ==============================================
// Consent Records (50)
// ==============================================

const jurisdictions = ["NY", "CA", "TX", "FL", "IL", "MA"]
const entityNames = [
  "Jordan Williams", "Sarah Chen", "Marcus Rodriguez", "Aisha Patel", "James O'Brien",
  "Nike Inc.", "Samsung Electronics", "Toyota Motor Corp", "Coca-Cola Company", "Apple Inc.",
  "Global Media Partners", "Digital Vision Studios", "CreativeForce Agency", "Skyline Productions", "AthleteConnect",
]

function generateConsentRecords(): ConsentRecord[] {
  const records: ConsentRecord[] = []
  const types: ConsentRecord["type"][] = ["NIL", "AI_CONTENT", "AD_DISCLOSURE"]
  const statuses: ConsentRecord["status"][] = ["verified", "pending", "expired", "revoked"]

  for (let i = 0; i < 50; i++) {
    const type = types[i % 3]
    const statusIdx = i < 30 ? 0 : i < 40 ? 1 : i < 45 ? 2 : 3
    const status = statuses[statusIdx]
    const jurisdiction = jurisdictions[i % jurisdictions.length]
    const entity = entityNames[i % entityNames.length]
    const isOrg = entity.includes("Inc.") || entity.includes("Corp") || entity.includes("Company") || entity.includes("Agency") || entity.includes("Studios") || entity.includes("Partners") || entity.includes("Productions") || entity.includes("Connect")
    const createdDate = new Date(2024, 6 + Math.floor(i / 10), 1 + (i % 28))
    const hash = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    const auditTrail: AuditTrailEntry[] = [
      { id: `at-${i}-1`, timestamp: createdDate.toISOString(), actor: "System", action: "Created", detail: `Consent record created for ${entity}` },
    ]
    if (status === "verified") {
      auditTrail.push({ id: `at-${i}-2`, timestamp: new Date(createdDate.getTime() + 86400000 * 3).toISOString(), actor: "Compliance Officer", action: "Verified", detail: "Document review passed" })
    }

    records.push({
      id: `cr-${String(i + 1).padStart(4, "0")}`,
      type,
      entityName: entity,
      entityType: isOrg ? "organization" : "individual",
      status,
      jurisdiction,
      hash,
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + 86400000 * 5).toISOString(),
      expiresAt: status !== "revoked" ? new Date(createdDate.getTime() + 86400000 * 365).toISOString() : undefined,
      projectId: `proj-${(i % 3) + 1}`,
      projectName: ["Nike Summer Campaign", "Samsung Product Launch", "Toyota Brand Refresh"][i % 3],
      linkedAssetIds: [`asset-${i + 1}`, `asset-${i + 51}`],
      auditTrail,
      verifiedBy: status === "verified" ? "Legal Team" : undefined,
      verifiedAt: status === "verified" ? new Date(createdDate.getTime() + 86400000 * 3).toISOString() : undefined,
    })
  }
  return records
}

export const consentRecords: ConsentRecord[] = generateConsentRecords()

// ==============================================
// Asset Profiles (30)
// ==============================================

function generateAssetProfiles(): AssetProfile[] {
  const profiles: AssetProfile[] = []
  const origins: AssetProfile["origin"][] = ["HUMAN", "AI", "HYBRID"]
  const contentTypes: AssetProfile["contentType"][] = ["Image", "Video", "Audio", "Text", "AR/VR"]
  const riskLevels: AssetProfile["riskLevel"][] = ["Low", "Medium", "High", "Critical"]
  const names = [
    "Hero Banner v3", "Product Video Cut", "Voice-Over Track A", "Social Copy Pack",
    "AR Try-On Experience", "Campaign Key Visual", "BTS Documentary", "Podcast Intro",
    "Blog Series Draft", "3D Product Model", "Influencer Composite", "AI Generated Headshot",
    "Synthetic Performer Clip", "Brand Manifesto Video", "Radio Spot Mix",
  ]
  const tools = ["Midjourney v6", "DALL-E 3", "Stable Diffusion XL", "Runway Gen-3", "ElevenLabs", "Suno AI", undefined]

  for (let i = 0; i < 30; i++) {
    const origin = origins[i % 3]
    const contentType = contentTypes[i % 5]
    const riskLevel = riskLevels[Math.min(Math.floor(i / 8), 3)]
    const name = names[i % names.length]
    const confidence = origin === "HUMAN" ? 95 + Math.floor(Math.random() * 5) : origin === "AI" ? 85 + Math.floor(Math.random() * 10) : 70 + Math.floor(Math.random() * 20)

    const alerts: ComplianceAlert[] = []
    if (riskLevel === "High" || riskLevel === "Critical") {
      alerts.push({
        id: `alert-ap-${i}`,
        type: "non_compliant",
        severity: riskLevel === "Critical" ? "critical" : "high",
        message: `${name} requires compliance review — ${riskLevel} risk`,
        assetId: `asset-${i + 1}`,
        projectId: `proj-${(i % 3) + 1}`,
        projectName: ["Nike Summer Campaign", "Samsung Product Launch", "Toyota Brand Refresh"][i % 3],
        jurisdiction: jurisdictions[i % jurisdictions.length],
        timestamp: new Date(2025, 0, 15 + (i % 15)).toISOString(),
        dismissed: false,
      })
    }

    profiles.push({
      id: `ap-${String(i + 1).padStart(4, "0")}`,
      assetId: `asset-${i + 1}`,
      name,
      origin,
      intendedUse: ["Advertising", "Social Media", "Editorial", "Entertainment", "Internal"][i % 5],
      audience: ["General Public", "B2B", "Youth (13-24)", "Premium", "Global"][i % 5],
      jurisdictions: [jurisdictions[i % jurisdictions.length], ...(i % 3 === 0 ? [jurisdictions[(i + 1) % jurisdictions.length]] : [])],
      classificationConfidence: confidence,
      status: i < 20 ? "classified" : i < 25 ? "pending" : i < 28 ? "flagged" : "rejected",
      riskLevel,
      projectId: `proj-${(i % 3) + 1}`,
      projectName: ["Nike Summer Campaign", "Samsung Product Launch", "Toyota Brand Refresh"][i % 3],
      taskId: `task-${i + 1}`,
      linkedConsentIds: [`cr-${String((i % 50) + 1).padStart(4, "0")}`],
      provenanceScoreId: `ps-${String(i + 1).padStart(4, "0")}`,
      createdAt: new Date(2024, 8 + Math.floor(i / 10), 1 + (i % 28)).toISOString(),
      updatedAt: new Date(2025, 0, 1 + (i % 28)).toISOString(),
      contentType,
      aiTool: origin !== "HUMAN" ? tools[i % tools.length] ?? undefined : undefined,
      modelUsed: origin !== "HUMAN" ? ["GPT-4o", "Claude 3.5", "Gemini Ultra", "Llama 3"][i % 4] : undefined,
      alerts,
    })
  }
  return profiles
}

export const assetProfiles: AssetProfile[] = generateAssetProfiles()

// ==============================================
// Provenance Scores
// ==============================================

function generateProvenanceScores(): ProvenanceScore[] {
  return assetProfiles.map((ap, i) => {
    const lineage = 50 + Math.floor(Math.random() * 50)
    const consent = 40 + Math.floor(Math.random() * 60)
    const regulatory = 55 + Math.floor(Math.random() * 45)
    const metadata = 45 + Math.floor(Math.random() * 55)
    const composite = Math.round((lineage * 0.3 + consent * 0.25 + regulatory * 0.25 + metadata * 0.2))

    const remediations: string[] = []
    if (lineage < 70) remediations.push("Complete provenance chain documentation")
    if (consent < 70) remediations.push("Obtain missing consent records for linked entities")
    if (regulatory < 70) remediations.push("Review jurisdiction-specific compliance requirements")
    if (metadata < 70) remediations.push("Add missing metadata fields (tool version, prompt record)")

    return {
      id: `ps-${String(i + 1).padStart(4, "0")}`,
      assetId: ap.assetId,
      assetName: ap.name,
      lineageFidelity: lineage,
      consentCompliance: consent,
      regulatoryCompatibility: regulatory,
      metadataQuality: metadata,
      compositeScore: composite,
      explanation: composite >= 85 ? "Strong provenance chain with comprehensive documentation" :
        composite >= 70 ? "Adequate provenance with minor gaps in documentation" :
          composite >= 55 ? "Moderate provenance — missing consent records and metadata" :
            "Weak provenance chain — significant compliance gaps",
      remediations,
      history: Array.from({ length: 30 }, (_, d) => ({
        date: new Date(2025, 0, d + 1).toISOString().split("T")[0],
        score: Math.max(40, Math.min(100, composite + Math.floor((Math.random() - 0.5) * 10))),
      })),
      calculatedAt: new Date(2025, 1, 1).toISOString(),
    }
  })
}

export const provenanceScores: ProvenanceScore[] = generateProvenanceScores()

// ==============================================
// Model Risk Scores
// ==============================================

function generateModelRiskScores(): ModelRiskScore[] {
  const models = [
    { id: "model-1", name: "Midjourney v6", base: 78 },
    { id: "model-2", name: "DALL-E 3", base: 85 },
    { id: "model-3", name: "Stable Diffusion XL", base: 62 },
    { id: "model-4", name: "Runway Gen-3 Alpha", base: 72 },
    { id: "model-5", name: "ElevenLabs Voice", base: 55 },
    { id: "model-6", name: "Suno AI Music", base: 48 },
    { id: "model-7", name: "GPT-4o Vision", base: 88 },
    { id: "model-8", name: "Claude 3.5 Sonnet", base: 91 },
    { id: "model-9", name: "Gemini Ultra", base: 83 },
    { id: "model-10", name: "Llama 3 70B", base: 67 },
  ]

  return models.map((m) => {
    const nyAdj = m.base < 80 ? -3 : 0
    const finalMRS = m.base + nyAdj
    const mapping = getMRSMapping(finalMRS)

    const riskFactors: RiskFactor[] = [
      { id: `rf-${m.id}-1`, name: "NIL consent status", category: "CONSENT", weight: 0.15, scoreImpact: m.base >= 80 ? 0 : -12.5, status: m.base >= 80 ? "PASS" : "FAIL", detail: m.base >= 80 ? "All NIL consents verified" : "Missing NIL consent for 3 pending athletes", remediationAction: "Obtain verified NIL consent for pending athletes", estimatedImprovement: 12.5 },
      { id: `rf-${m.id}-2`, name: "AI advertising disclosure", category: "REGULATORY", weight: 0.12, scoreImpact: m.base >= 75 ? 0 : -8, status: m.base >= 75 ? "PASS" : "WARNING", detail: m.base >= 75 ? "AI disclosure tags present on all ads" : "No AI ad disclosure for NY campaign", remediationAction: "Add AI disclosure tags for NY ad campaign", estimatedImprovement: 8 },
      { id: `rf-${m.id}-3`, name: "Training data provenance", category: "PROVENANCE", weight: 0.15, scoreImpact: m.base >= 85 ? 0 : -10, status: m.base >= 85 ? "PASS" : "WARNING", detail: m.base >= 85 ? "Full training data audit complete" : "Incomplete training data provenance chain", remediationAction: "Complete training data provenance chain", estimatedImprovement: 10 },
      { id: `rf-${m.id}-4`, name: "Output attribution chain", category: "PROVENANCE", weight: 0.10, scoreImpact: m.base >= 70 ? 0 : -6, status: m.base >= 70 ? "PASS" : "FAIL", detail: m.base >= 70 ? "Attribution chain complete" : "Output attribution chain has gaps", remediationAction: "Document output attribution chain", estimatedImprovement: 6 },
      { id: `rf-${m.id}-5`, name: "Deepfake detection confidence", category: "TECHNICAL", weight: 0.10, scoreImpact: 0, status: "PASS", detail: "Deepfake detection confidence >95%", remediationAction: "N/A", estimatedImprovement: 0 },
      { id: `rf-${m.id}-6`, name: "Model version audit trail", category: "OPERATIONAL", weight: 0.08, scoreImpact: m.base >= 80 ? 0 : -3, status: m.base >= 80 ? "PASS" : "WARNING", detail: m.base >= 80 ? "Version audit trail complete" : "Missing model version documentation", remediationAction: "Update model version documentation", estimatedImprovement: 3 },
      { id: `rf-${m.id}-7`, name: "Jurisdiction coverage", category: "REGULATORY", weight: 0.10, scoreImpact: m.base >= 75 ? 0 : -5, status: m.base >= 75 ? "PASS" : "FAIL", detail: m.base >= 75 ? "All target jurisdictions covered" : "Coverage gap in NY and CA jurisdictions", remediationAction: "Add compliance for NY and CA requirements", estimatedImprovement: 5 },
      { id: `rf-${m.id}-8`, name: "Historical incident count", category: "OPERATIONAL", weight: 0.05, scoreImpact: m.base >= 70 ? 0 : -2, status: m.base >= 70 ? "PASS" : "WARNING", detail: m.base >= 70 ? "No prior incidents" : "2 prior compliance incidents", remediationAction: "Resolve historical compliance incidents", estimatedImprovement: 2 },
      { id: `rf-${m.id}-9`, name: "Metadata completeness", category: "PROVENANCE", weight: 0.08, scoreImpact: m.base >= 80 ? 0 : -4, status: m.base >= 80 ? "PASS" : "FAIL", detail: m.base >= 80 ? "Metadata 100% complete" : "Metadata missing: prompt record, tool version", remediationAction: "Complete all metadata fields", estimatedImprovement: 4 },
      { id: `rf-${m.id}-10`, name: "Content type risk", category: "TECHNICAL", weight: 0.07, scoreImpact: m.name.includes("Voice") || m.name.includes("Music") ? -5 : 0, status: m.name.includes("Voice") || m.name.includes("Music") ? "WARNING" : "PASS", detail: m.name.includes("Voice") || m.name.includes("Music") ? "Audio/voice content has elevated risk profile" : "Content type risk within acceptable range", remediationAction: "Apply enhanced review for audio content", estimatedImprovement: 5 },
    ]

    const scoreHistory: ScoreChange[] = Array.from({ length: 8 }, (_, idx) => {
      const daysAgo = (8 - idx) * 11
      const oldS = Math.max(40, m.base - 15 + idx * 2 + Math.floor(Math.random() * 5))
      const newS = Math.max(40, oldS + Math.floor((Math.random() - 0.3) * 6))
      return {
        date: new Date(Date.now() - daysAgo * 86400000).toISOString().split("T")[0],
        oldScore: oldS, newScore: newS,
        reason: ["Training data audit completed", "NIL consent obtained", "Jurisdiction gap identified", "Model version updated", "Compliance review passed", "Metadata fields added", "New NY regulation applied", "Quarterly re-assessment"][idx],
        triggeredBy: ["System", "Compliance Officer", "Auto-scan", "Legal Team"][idx % 4],
      }
    })

    const jurisdictionImpacts: JurisdictionImpact[] = [
      { jurisdiction: "NY", lawType: "AI Ad Disclosure", complianceStatus: m.base >= 80 ? "compliant" : "non_compliant", scorePenalty: m.base >= 80 ? 0 : -5, multiplierImpact: 1.8 },
      { jurisdiction: "CA", lawType: "Synthetic Performer", complianceStatus: m.base >= 75 ? "compliant" : "partial", scorePenalty: m.base >= 75 ? 0 : -4, multiplierImpact: 2.0 },
      { jurisdiction: "IL", lawType: "BIPA Biometric", complianceStatus: "compliant", scorePenalty: 0, multiplierImpact: 1.7 },
      { jurisdiction: "TN", lawType: "ELVIS Act", complianceStatus: m.name.includes("Voice") || m.name.includes("Music") ? "non_compliant" : "compliant", scorePenalty: m.name.includes("Voice") || m.name.includes("Music") ? -3 : 0, multiplierImpact: 1.5 },
    ]

    return {
      id: `mrs-${m.id}`,
      modelId: m.id,
      modelName: m.name,
      baseScore: m.base,
      nyAdjustment: nyAdj,
      finalMRS,
      riskClass: mapping.riskClass,
      premiumMultiplier: mapping.premiumMultiplier,
      deductiblePct: mapping.deductiblePct,
      maxCapacityPct: mapping.maxCapacityPct,
      riskFactors,
      scoreHistory,
      jurisdictionImpacts,
      calculatedAt: new Date(2025, 1, 1).toISOString(),
    }
  })
}

export const modelRiskScores: ModelRiskScore[] = generateModelRiskScores()

// ==============================================
// Evidence Records (10)
// ==============================================

function generateEvidenceRecords(): EvidenceRecord[] {
  const evidenceCategories: EvidenceCategoryKey[] = [
    "identity_posture", "application_url", "data_classification", "action_taken",
    "policy_decision", "prompt_metadata", "model_versioning", "trace_logs",
  ]

  return Array.from({ length: 10 }, (_, i) => {
    const capturedCount = 4 + Math.floor(Math.random() * 5) // 4-8
    const categories: Record<EvidenceCategoryKey, EvidenceCategoryData> = {} as Record<EvidenceCategoryKey, EvidenceCategoryData>

    evidenceCategories.forEach((cat, catIdx) => {
      const isCaptured = catIdx < capturedCount
      const isPartial = catIdx === capturedCount
      categories[cat] = {
        status: isCaptured ? "captured" : isPartial ? "partial" : "missing",
        data: isCaptured ? generateEvidenceData(cat, i) : {},
        capturedAt: isCaptured ? new Date(2025, 0, 10 + i).toISOString() : undefined,
      }
    })

    const actualCaptured = Object.values(categories).filter((c) => c.status === "captured").length

    const timeline: EvidenceTimelineEvent[] = evidenceCategories
      .filter((_, catIdx) => catIdx < capturedCount)
      .map((cat, tIdx) => ({
        id: `evt-${i}-${tIdx}`,
        timestamp: new Date(2025, 0, 10 + i, 9 + tIdx).toISOString(),
        category: cat,
        action: "Evidence captured",
        actor: "System",
        detail: `${cat.replace(/_/g, " ")} data collected`,
      }))

    return {
      id: `ev-${String(i + 1).padStart(4, "0")}`,
      incidentId: `INC-${2025}-${String(i + 1).padStart(3, "0")}`,
      assetId: `asset-${i + 1}`,
      assetName: assetProfiles[i]?.name || `Asset ${i + 1}`,
      modelId: i < 5 ? `model-${i + 1}` : undefined,
      modelName: i < 5 ? modelRiskScores[i]?.modelName : undefined,
      type: ["Copyright dispute", "NIL violation", "Deepfake complaint", "Disclosure failure", "Training data claim"][i % 5],
      status: i < 5 ? "open" : i < 8 ? "resolved" : "escalated",
      date: new Date(2025, 0, 10 + i).toISOString(),
      categories,
      completeness: actualCaptured,
      completenessPercent: Math.round((actualCaptured / 8) * 100),
      projectId: `proj-${(i % 3) + 1}`,
      projectName: ["Nike Summer Campaign", "Samsung Product Launch", "Toyota Brand Refresh"][i % 3],
      timeline,
    }
  })
}

function generateEvidenceData(category: EvidenceCategoryKey, seed: number): Record<string, string | number | boolean | null> {
  switch (category) {
    case "identity_posture": return { userId: `user-${seed + 100}`, deviceFingerprint: `fp-${seed}abc`, authMethod: "SSO", ipAddress: `192.168.1.${seed + 10}`, geolocation: "New York, NY" }
    case "application_url": return { appName: "Creation Rights Studio", url: `https://app.creationrights.com/assets/${seed}`, sessionId: `sess-${seed}xyz`, referrer: "dashboard" }
    case "data_classification": return { level: "Confidential", dataType: "AI-Generated Content", sensitivityTags: "PII,NIL,Commercial" }
    case "action_taken": return { actionType: ["copy", "publish", "deploy", "upload"][seed % 4], timestamp: new Date(2025, 0, 10 + seed).toISOString(), target: "Production CDN" }
    case "policy_decision": return { policyName: "AI Content Compliance v2.1", decision: seed % 3 === 0 ? "block" : "allow", ruleMatched: "NIL consent required", confidence: 0.95 }
    case "prompt_metadata": return { promptHash: `0x${seed}abcdef1234`, tokenCount: 1200 + seed * 100, modelUsed: ["GPT-4o", "Midjourney", "DALL-E 3"][seed % 3] }
    case "model_versioning": return { modelName: ["Midjourney v6", "DALL-E 3", "Stable Diffusion XL"][seed % 3], version: `${seed % 3 + 1}.${seed % 5}.0`, checkpoint: `ckpt-${seed}`, framework: "PyTorch 2.1" }
    case "trace_logs": return { retentionPeriod: "90 days", traceId: `trace-${seed}-${Date.now()}`, logCount: 150 + seed * 20 }
    default: return {}
  }
}

export const evidenceRecords: EvidenceRecord[] = generateEvidenceRecords()

// ==============================================
// Compliance Alerts (aggregated)
// ==============================================

function generateComplianceAlerts(): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = []
  // From asset profiles
  assetProfiles.forEach((ap) => alerts.push(...ap.alerts))
  // Additional alerts
  const extra: ComplianceAlert[] = [
    { id: "alert-leg-1", type: "legislation_change", severity: "high", message: "NY AI ad disclosure law takes effect — 12 assets require updated tags", jurisdiction: "NY", projectId: "proj-1", projectName: "Nike Summer Campaign", timestamp: new Date(2025, 0, 15).toISOString(), dismissed: false },
    { id: "alert-leg-2", type: "legislation_change", severity: "medium", message: "CA AB 2602 enforcement update — review synthetic performer assets", jurisdiction: "CA", projectId: "proj-2", projectName: "Samsung Product Launch", timestamp: new Date(2025, 0, 20).toISOString(), dismissed: false },
    { id: "alert-consent-1", type: "missing_consent", severity: "critical", message: "3 NIL consents expired — assets blocked from distribution", assetId: "asset-5", projectId: "proj-1", projectName: "Nike Summer Campaign", jurisdiction: "NY", timestamp: new Date(2025, 1, 1).toISOString(), dismissed: false },
    { id: "alert-risk-1", type: "risk_threshold", severity: "high", message: "ElevenLabs Voice model MRS dropped below 60 — Elevated risk class", modelId: "model-5", timestamp: new Date(2025, 1, 2).toISOString(), dismissed: false },
    { id: "alert-risk-2", type: "risk_threshold", severity: "critical", message: "Suno AI Music model MRS below 50 — Critical: decline coverage", modelId: "model-6", timestamp: new Date(2025, 1, 3).toISOString(), dismissed: false },
    { id: "alert-disclosure-1", type: "disclosure_missing", severity: "high", message: "8 AI-generated ads missing required NY disclosure tags", jurisdiction: "NY", projectId: "proj-1", projectName: "Nike Summer Campaign", timestamp: new Date(2025, 1, 4).toISOString(), dismissed: false },
    { id: "alert-jurisdiction-1", type: "jurisdiction_conflict", severity: "medium", message: "Campaign distributed to IL without BIPA biometric consent", jurisdiction: "IL", projectId: "proj-3", projectName: "Toyota Brand Refresh", timestamp: new Date(2025, 1, 3).toISOString(), dismissed: false },
  ]
  alerts.push(...extra)
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const complianceAlerts: ComplianceAlert[] = generateComplianceAlerts()

// ==============================================
// Compliance Overview
// ==============================================

export const complianceOverview: ComplianceOverview = {
  totalAssetsMonitored: assetProfiles.length + 95, // Include assets without profiles
  flaggedCount: complianceAlerts.filter((a) => !a.dismissed && (a.severity === "critical" || a.severity === "high")).length,
  avgProvenanceScore: Math.round(provenanceScores.reduce((sum, ps) => sum + ps.compositeScore, 0) / provenanceScores.length),
  avgMRS: Math.round(modelRiskScores.reduce((sum, mrs) => sum + mrs.finalMRS, 0) / modelRiskScores.length),
  highestRiskModel: (() => {
    const worst = [...modelRiskScores].sort((a, b) => a.finalMRS - b.finalMRS)[0]
    return { name: worst.modelName, mrs: worst.finalMRS, riskClass: worst.riskClass }
  })(),
  riskDistribution: [
    { riskClass: "Low", count: modelRiskScores.filter((m) => m.riskClass === "Low").length * 3, color: "#10b981" },
    { riskClass: "Moderate", count: modelRiskScores.filter((m) => m.riskClass === "Moderate").length * 3 + 5, color: "#f59e0b" },
    { riskClass: "Guarded", count: modelRiskScores.filter((m) => m.riskClass === "Guarded").length * 3 + 3, color: "#f97316" },
    { riskClass: "Elevated", count: modelRiskScores.filter((m) => m.riskClass === "Elevated").length * 3 + 2, color: "#ef4444" },
    { riskClass: "Severe", count: modelRiskScores.filter((m) => m.riskClass === "Severe").length * 3 + 1, color: "#e11d48" },
    { riskClass: "Critical", count: modelRiskScores.filter((m) => m.riskClass === "Critical").length * 3, color: "#1e293b" },
  ],
  topRiskModels: [...modelRiskScores]
    .sort((a, b) => a.finalMRS - b.finalMRS)
    .slice(0, 5)
    .map((m) => ({
      id: m.modelId,
      name: m.modelName,
      mrs: m.finalMRS,
      riskClass: m.riskClass,
      topRiskFactor: m.riskFactors.filter((f) => f.scoreImpact < 0).sort((a, b) => a.scoreImpact - b.scoreImpact)[0]?.name || "No issues",
    })),
  alerts: complianceAlerts.slice(0, 20),
  legislationSummary: {
    enacted: jurisdictionProfiles.filter((j) => j.legislationStatus === "ENACTED").length,
    pending: jurisdictionProfiles.filter((j) => j.legislationStatus === "PROPOSED" || j.legislationStatus === "IN_COMMITTEE").length,
    none: jurisdictionProfiles.filter((j) => j.legislationStatus === "NONE").length,
  },
  trendData: [
    { month: "Sep", score: 72, mrs: 74 },
    { month: "Oct", score: 75, mrs: 76 },
    { month: "Nov", score: 78, mrs: 75 },
    { month: "Dec", score: 80, mrs: 78 },
    { month: "Jan", score: 82, mrs: 77 },
    { month: "Feb", score: 79, mrs: 73 },
  ],
}

// ==============================================
// Country Jurisdiction Profiles (Global)
// ==============================================

export const countryJurisdictionProfiles: CountryJurisdictionProfile[] = [
  // ---- EUROPE ----
  {
    countryCode: "EU", countryName: "European Union", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "Up to €35M or 7% global turnover",
    nilPenalty: "Member-state dependent",
    deepfakePenalty: "Up to €15M or 3% global turnover",
    enforcementIntensity: "Very High", multiplier: 2.2,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act (Regulation 2024/1689)",
    summary: "World's first comprehensive AI law. Risk-based framework banning unacceptable-risk AI, strict transparency obligations for generative AI and deepfakes, mandatory disclosure for AI-generated content."
  },
  {
    countryCode: "GB", countryName: "United Kingdom", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Up to £18M or 10% turnover (Ofcom)",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Up to 2 years imprisonment (Online Safety Act)",
    enforcementIntensity: "High", multiplier: 1.6,
    legislationStatus: "ENACTED", effectiveDate: "2023-10-26",
    statuteReference: "Online Safety Act 2023 / AI Regulation White Paper",
    summary: "Online Safety Act criminalizes sharing AI deepfakes. Pro-innovation AI regulatory framework with sector-specific oversight. DSIT leading AI safety standards."
  },
  {
    countryCode: "DE", countryName: "Germany", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "BIOMETRIC_LIKENESS", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Up to €300,000 (UWG)",
    nilPenalty: "Civil damages under personality rights",
    deepfakePenalty: "Criminal penalties under personal rights law",
    enforcementIntensity: "High", multiplier: 1.5,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act + BGB §823 / KUG",
    summary: "Strong personality rights tradition protecting likeness. EU AI Act directly applicable. Federal data protection authority enforces AI transparency requirements."
  },
  {
    countryCode: "FR", countryName: "France", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Up to €300,000 / 6% digital ad revenue",
    nilPenalty: "Civil damages (Code civil Art. 9)",
    deepfakePenalty: "Up to 2 years / €60,000 (identity usurpation)",
    enforcementIntensity: "High", multiplier: 1.5,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act + Loi n° 2024-449 (SREN Act)",
    summary: "SREN Act adds AI-specific deepfake penalties. Strong image rights under Code civil. CNIL actively regulates AI training data and GDPR intersections."
  },
  {
    countryCode: "IT", countryName: "Italy", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "RIGHT_OF_PUBLICITY", "DEEPFAKE"],
    aiAdPenalty: "Up to €250,000",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Up to €100,000",
    enforcementIntensity: "Medium", multiplier: 1.3,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act + Italian AI Act (DDL 1146)",
    summary: "Italy passed a national AI Act complementing EU regulation. Early mover — temporarily banned ChatGPT in 2023. Garante actively enforces data protection in AI context."
  },
  {
    countryCode: "ES", countryName: "Spain", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "Up to €200,000",
    nilPenalty: "Civil damages",
    deepfakePenalty: "EU AI Act provisions",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act + AESIA (Spanish AI Supervisory Agency)",
    summary: "First EU country to create a dedicated AI supervisory agency (AESIA). EU AI Act directly applicable. AESIA piloting regulatory sandbox for AI compliance."
  },
  {
    countryCode: "NL", countryName: "Netherlands", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "EU AI Act penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "EU AI Act provisions",
    enforcementIntensity: "High", multiplier: 1.4,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act + Algoritmeregister",
    summary: "Pioneer in algorithmic transparency — mandatory Algorithm Register for government AI. Dutch DPA aggressively enforces AI/GDPR intersection."
  },
  {
    countryCode: "SE", countryName: "Sweden", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "EU AI Act penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "EU AI Act provisions",
    enforcementIntensity: "Medium", multiplier: 1.1,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act",
    summary: "EU AI Act directly applicable. IMY (data protection authority) overseeing AI compliance. Relatively permissive approach emphasizing innovation."
  },
  {
    countryCode: "DK", countryName: "Denmark", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "RIGHT_OF_PUBLICITY", "DEEPFAKE", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "EU AI Act penalties",
    nilPenalty: "Copyright Act damages (likeness as IP)",
    deepfakePenalty: "EU AI Act provisions + Copyright Act",
    enforcementIntensity: "High", multiplier: 1.5,
    legislationStatus: "ENACTED", effectiveDate: "2025-01-01",
    statuteReference: "EU AI Act + Copyright Act Amendment (likeness protection)",
    summary: "Landmark copyright law amendment treats a person's likeness (face, voice, body) as intellectual property. 50-year post-death protection. Prohibits AI-generated reproductions shared without consent. Exceptions for parody and satire. EU AI Act directly applicable."
  },
  {
    countryCode: "NO", countryName: "Norway", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "EEA-aligned penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "EEA-aligned provisions",
    enforcementIntensity: "Medium", multiplier: 1.15,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "EEA AI Act adoption (pending)",
    summary: "Norway will adopt the EU AI Act through the EEA agreement. Datatilsynet (DPA) actively involved in AI policy. Marketing Control Act covers AI advertising."
  },
  {
    countryCode: "CH", countryName: "Switzerland", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Sector-specific",
    nilPenalty: "Civil damages (ZGB Art. 28)",
    deepfakePenalty: "Criminal law provisions",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Federal Council AI Guidelines / New AI regulation proposal",
    summary: "Sector-specific approach under consideration. Strong personality rights under Swiss Civil Code. Federal Council evaluating EU AI Act alignment."
  },
  {
    countryCode: "IE", countryName: "Ireland", region: "Europe",
    lawCategories: ["AI_AD_DISCLOSURE", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "EU AI Act penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "EU AI Act provisions",
    enforcementIntensity: "High", multiplier: 1.4,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "EU AI Act + DPC oversight",
    summary: "Irish DPC is lead supervisory authority for many Big Tech AI systems under EU AI Act due to corporate headquarters. Critical enforcement jurisdiction."
  },

  // ---- ASIA-PACIFIC ----
  {
    countryCode: "CN", countryName: "China", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "NIL_RIGHTS", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "Up to ¥100,000 + service suspension",
    nilPenalty: "Civil liability + administrative penalties",
    deepfakePenalty: "Up to 3 years imprisonment",
    enforcementIntensity: "Very High", multiplier: 1.8,
    legislationStatus: "ENACTED", effectiveDate: "2023-01-10",
    statuteReference: "Deep Synthesis Provisions / Generative AI Measures (2023)",
    summary: "Comprehensive regulations on deep synthesis and generative AI. Mandatory labeling of all AI-generated content. Algorithm registration with CAC. Real-name verification for users."
  },
  {
    countryCode: "KR", countryName: "South Korea", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Up to ₩30M",
    nilPenalty: "Civil damages + criminal penalties",
    deepfakePenalty: "Up to 5 years / ₩50M (deepfake sex crimes)",
    enforcementIntensity: "Very High", multiplier: 1.7,
    legislationStatus: "ENACTED", effectiveDate: "2024-01-01",
    statuteReference: "AI Basic Act / Deepfake Prevention Act (2024)",
    summary: "AI Basic Act enacted in 2024 — risk-based framework similar to EU AI Act. Severe penalties for deepfake crimes. PIPC enforces AI data protections."
  },
  {
    countryCode: "JP", countryName: "Japan", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Administrative guidance",
    nilPenalty: "Civil damages (publicity rights)",
    deepfakePenalty: "Defamation and portrait rights claims",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "AI Guidelines (2024) / Proposed AI Basic Law",
    summary: "Voluntary AI guidelines emphasizing innovation. Proposed AI Basic Law under development. Relatively permissive approach — no explicit copyright protection for AI training data."
  },
  {
    countryCode: "SG", countryName: "Singapore", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "PDPA penalties up to SGD 1M",
    nilPenalty: "Civil damages",
    deepfakePenalty: "POFMA provisions (online falsehoods)",
    enforcementIntensity: "Medium", multiplier: 1.15,
    legislationStatus: "ENACTED", effectiveDate: "2024-05-30",
    statuteReference: "AI Governance Framework / Model AI Governance (2024)",
    summary: "Voluntary but influential AI governance framework. IMDA Model AI Governance expanded in 2024. POFMA covers AI-generated falsehoods. Innovation-friendly sandbox approach."
  },
  {
    countryCode: "IN", countryName: "India", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE"],
    aiAdPenalty: "IT Act penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Up to 3 years imprisonment (IT Act amendments)",
    enforcementIntensity: "Medium", multiplier: 1.3,
    legislationStatus: "ENACTED", effectiveDate: "2024-03-15",
    statuteReference: "IT Act Deepfake Rules (2024) / Digital India Act (proposed)",
    summary: "IT Act amended to address AI deepfakes with criminal penalties. MeitY advisory on AI labeling. Comprehensive Digital India Act in development to replace IT Act."
  },
  {
    countryCode: "AU", countryName: "Australia", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE"],
    aiAdPenalty: "Up to AUD 50M (AI in advertising)",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Up to 7 years (non-consensual deepfakes)",
    enforcementIntensity: "High", multiplier: 1.5,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-15",
    statuteReference: "Online Safety Act (AI amendments) / Criminal Code deepfake offences",
    summary: "Criminal Code amended for non-consensual deepfakes. eSafety Commissioner expanded powers for AI content. Mandatory AI transparency for government use. Voluntary guardrails for industry."
  },
  {
    countryCode: "NZ", countryName: "New Zealand", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "Fair Trading Act penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Harmful Digital Communications Act",
    enforcementIntensity: "Low", multiplier: 1.05,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "AI Strategy 2024 / Proposed AI Framework",
    summary: "Principles-based AI strategy. Harmful Digital Communications Act covers some AI misuse. No dedicated AI legislation yet — relying on existing consumer protection and privacy law."
  },
  {
    countryCode: "TW", countryName: "Taiwan", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE"],
    aiAdPenalty: "Administrative penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Criminal penalties proposed",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "AI Basic Act (draft 2024)",
    summary: "Draft AI Basic Act under legislative review. Taiwan's NSTC leading AI governance. Proposed deepfake regulation and AI labeling requirements for elections."
  },
  {
    countryCode: "PH", countryName: "Philippines", region: "Asia-Pacific",
    lawCategories: ["DEEPFAKE", "AI_AD_DISCLOSURE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Up to ₱5M (HB 10567)",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Up to 12–20 years imprisonment (HB 807)",
    enforcementIntensity: "Very High", multiplier: 1.6,
    legislationStatus: "ENACTED", effectiveDate: "2025-06-01",
    statuteReference: "Take It Down Act (HB 807) / Deepfake Accountability Act (HB 10567)",
    summary: "Comprehensive anti-deepfake legislation. HB 807 imposes up to 12 years (20 for minors) for AI-generated sexually explicit content, with a DICT-managed Take It Down Portal. HB 10567 mandates AI content disclosure for elections with ₱5M penalties."
  },
  {
    countryCode: "TH", countryName: "Thailand", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE"],
    aiAdPenalty: "ETDA regulatory penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Proposed criminal penalties for prohibited-risk AI",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Draft AI Law Principles / ETDA AI Governance Center",
    summary: "Risk-based draft AI law modeled on EU AI Act. Prohibited-risk and high-risk AI tiers proposed. ETDA's AI Governance Center (AIGC) providing standards. National AI Strategy targets 2027 implementation."
  },
  {
    countryCode: "ID", countryName: "Indonesia", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE"],
    aiAdPenalty: "Electronic Transactions Law penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Cyberlaw provisions + proposed AI rules",
    enforcementIntensity: "Medium", multiplier: 1.15,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Electronic Information and Transactions Law / PDPL / Draft AI Ethics Rules",
    summary: "Deepfake content surged 550% in 5 years. Government drafting ethical AI rules after election deepfakes. Personal Data Protection Law (PDPL) covers AI processing. Three-principle AI framework: support humans, protect privacy, ensure supervision."
  },
  {
    countryCode: "MY", countryName: "Malaysia", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE"],
    aiAdPenalty: "Communications and Multimedia Act penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Online Safety Act 2024 + proposed AI Bill",
    enforcementIntensity: "High", multiplier: 1.3,
    legislationStatus: "ENACTED", effectiveDate: "2024-08-01",
    statuteReference: "Online Safety Act 2024 / Proposed AI Labeling Law / AI Bill (mid-2026)",
    summary: "Online Safety Act 2024 addresses deepfakes, scams, and cyberbullying. Mandatory 'AI generated' labeling law expected by end 2025. Comprehensive AI Bill pending by mid-2026. Spurred by deepfake blackmail targeting lawmakers."
  },
  {
    countryCode: "VN", countryName: "Vietnam", region: "Asia-Pacific",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "Cybersecurity Law penalties",
    nilPenalty: "N/A",
    deepfakePenalty: "Cybersecurity Law provisions",
    enforcementIntensity: "Low", multiplier: 1.05,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Cybersecurity Law / Draft AI Development Strategy",
    summary: "Cybersecurity Law covers some AI misuse. National AI Research and Development Strategy published. Dedicated AI regulation under development with focus on responsible AI deployment."
  },

  // ---- MIDDLE EAST ----
  {
    countryCode: "AE", countryName: "United Arab Emirates", region: "Middle East",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "CBUAE / ADGM regulatory penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Cybercrime Law penalties",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "ENACTED", effectiveDate: "2023-01-01",
    statuteReference: "UAE AI Strategy 2031 / ADGM AI framework",
    summary: "First country to appoint a Minister of AI. ADGM financial free zone has AI-specific governance. Dubai AI Campus regulatory sandbox. Cybercrime law covers AI misuse."
  },
  {
    countryCode: "SA", countryName: "Saudi Arabia", region: "Middle East",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "SDAIA regulatory penalties",
    nilPenalty: "N/A",
    deepfakePenalty: "Cybercrime provisions",
    enforcementIntensity: "Medium", multiplier: 1.15,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "SDAIA AI Ethics Principles / National AI Strategy",
    summary: "Saudi Data & AI Authority (SDAIA) leading regulation. Voluntary AI ethics principles published. Comprehensive AI governance framework in development aligned with Vision 2030."
  },
  {
    countryCode: "IL", countryName: "Israel", region: "Middle East",
    lawCategories: ["AI_AD_DISCLOSURE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Consumer protection penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Privacy Protection Law provisions",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Israel Innovation Authority AI Policy (2024)",
    summary: "Innovation-friendly approach with proposed AI regulation. Privacy Protection Authority expanding to cover AI. Strong deeptech AI sector with light-touch governance philosophy."
  },
  {
    countryCode: "TR", countryName: "Turkey", region: "Middle East",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "KVKK data protection penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Turkish Penal Code provisions",
    enforcementIntensity: "Medium", multiplier: 1.15,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "National AI Strategy 2025 / KVKK (Personal Data Protection Law)",
    summary: "National AI Strategy published with 2025 targets. KVKK (data protection authority) applying existing law to AI processing. Comprehensive AI regulation proposal under development. Active deepfake enforcement under Penal Code."
  },

  // ---- AMERICAS (non-US) ----
  {
    countryCode: "CA", countryName: "Canada", region: "Americas",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "BIOMETRIC_LIKENESS"],
    aiAdPenalty: "Up to CAD 10M or 3% global revenue",
    nilPenalty: "Civil damages (personality rights)",
    deepfakePenalty: "Criminal Code provisions + AIDA penalties",
    enforcementIntensity: "High", multiplier: 1.5,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "AIDA (Bill C-27, Part 3) / Proposed Online Harms Act",
    summary: "Artificial Intelligence and Data Act (AIDA) proposed as part of Bill C-27. Would create mandatory AI risk assessments, transparency obligations, and penalties for AI harms. Died on order paper — expected to be reintroduced."
  },
  {
    countryCode: "BR", countryName: "Brazil", region: "Americas",
    lawCategories: ["AI_AD_DISCLOSURE", "DEEPFAKE", "RIGHT_OF_PUBLICITY"],
    aiAdPenalty: "Up to 2% of revenue (LGPD)",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Up to BRL 50M per violation",
    enforcementIntensity: "High", multiplier: 1.4,
    legislationStatus: "ENACTED", effectiveDate: "2025-01-01",
    statuteReference: "Marco Legal da IA (PL 2338/2023)",
    summary: "Brazil's AI regulatory framework (Marco Legal da IA) enacted. Risk-based approach inspired by EU AI Act. Mandatory impact assessments for high-risk AI. LGPD data protection applies to AI training."
  },
  {
    countryCode: "MX", countryName: "Mexico", region: "Americas",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "Federal consumer protection penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Proposed",
    enforcementIntensity: "Low", multiplier: 1.05,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Proposed Federal AI Regulation (2024)",
    summary: "Multiple AI regulation bills introduced in Congress. No comprehensive law yet. Data protection law (LFPDPPP) applies to AI processing of personal data."
  },
  {
    countryCode: "CL", countryName: "Chile", region: "Americas",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "Administrative penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "N/A",
    enforcementIntensity: "Low", multiplier: 1.05,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "National AI Policy 2024 / Proposed AI Bill",
    summary: "Updated national AI policy in 2024. AI regulation bill under development. First Latin American country to publish a national AI policy (2021)."
  },
  {
    countryCode: "CO", countryName: "Colombia", region: "Americas",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "SIC consumer protection penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Penal Code provisions",
    enforcementIntensity: "Low", multiplier: 1.05,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Proposed AI Regulatory Framework / Ley 1581 (Data Protection)",
    summary: "AI regulatory framework proposal under congressional review. Ley 1581 data protection law applies to AI personal data processing. SIC (consumer protection agency) has enforcement authority over AI in commerce."
  },
  {
    countryCode: "AR", countryName: "Argentina", region: "Americas",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "Data protection penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Penal Code provisions",
    enforcementIntensity: "Low", multiplier: 1.05,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "Proposed AI Regulation Bills / Ley 25.326 (Personal Data Protection)",
    summary: "Multiple AI regulation bills introduced in Congress. Strong personal data protection law (Ley 25.326) applies to AI. National AI Plan published. Active civil society engagement on AI governance."
  },
  {
    countryCode: "PE", countryName: "Peru", region: "Americas",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "Administrative penalties",
    nilPenalty: "Civil damages",
    deepfakePenalty: "N/A",
    enforcementIntensity: "Medium", multiplier: 1.2,
    legislationStatus: "ENACTED", effectiveDate: "2023-07-24",
    statuteReference: "Law No. 31814 (AI Promotion Framework)",
    summary: "First Latin American country with a dedicated AI law. Law No. 31814 promotes responsible AI use with transparency requirements. Establishes ethical framework for AI deployment in public and private sectors."
  },

  // ---- AFRICA ----
  {
    countryCode: "ZA", countryName: "South Africa", region: "Africa",
    lawCategories: ["AI_AD_DISCLOSURE"],
    aiAdPenalty: "POPIA penalties up to ZAR 10M",
    nilPenalty: "Civil damages",
    deepfakePenalty: "Cybercrimes Act provisions",
    enforcementIntensity: "Low", multiplier: 1.1,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "POPIA + AI Policy Framework (draft)",
    summary: "POPIA (data protection) applies to AI processing. Draft National AI Policy Framework published. Cybercrimes Act covers some AI-generated content misuse."
  },
  {
    countryCode: "NG", countryName: "Nigeria", region: "Africa",
    lawCategories: [],
    aiAdPenalty: "N/A",
    nilPenalty: "N/A",
    deepfakePenalty: "N/A",
    enforcementIntensity: "None", multiplier: 1.0,
    legislationStatus: "PROPOSED", effectiveDate: undefined,
    statuteReference: "NITDA AI Strategy (2024)",
    summary: "National AI Strategy published by NITDA. No dedicated AI legislation yet. NDPR (data protection) provides limited coverage for AI data processing."
  },
  {
    countryCode: "KE", countryName: "Kenya", region: "Africa",
    lawCategories: [],
    aiAdPenalty: "N/A",
    nilPenalty: "N/A",
    deepfakePenalty: "N/A",
    enforcementIntensity: "None", multiplier: 1.0,
    legislationStatus: "NONE", effectiveDate: undefined,
    statuteReference: "Proposed AI Policy Framework",
    summary: "AI policy under development. Data Protection Act 2019 provides limited coverage. No dedicated AI content or deepfake legislation."
  },
]

// ==============================================
// Global Legislation News
// ==============================================

export const globalLegislationNews: GlobalLegislationNewsItem[] = [
  { id: "gln-1", headline: "EU AI Act enters into force — phased enforcement begins", countryName: "European Union", countryCode: "EU", region: "Europe", date: "2025-02-01", category: "NEW_LAW", summary: "EU AI Act Article 5 (prohibited AI) now enforceable. High-risk AI system obligations take effect August 2025. Transparency requirements for generative AI models apply from August 2025.", sourceUrl: "#" },
  { id: "gln-2", headline: "China mandates watermarking for all AI-generated content", countryName: "China", countryCode: "CN", region: "Asia-Pacific", date: "2025-01-20", category: "ENFORCEMENT_ACTION", summary: "CAC begins enforcing mandatory AI content watermarking across all platforms. Non-compliant services face suspension and fines.", sourceUrl: "#" },
  { id: "gln-3", headline: "UK Online Safety Act: Ofcom issues AI deepfake enforcement guidance", countryName: "United Kingdom", countryCode: "GB", region: "Europe", date: "2025-01-15", category: "ENFORCEMENT_ACTION", summary: "Ofcom publishes codes of practice for platforms on AI-generated intimate imagery and deepfakes under the Online Safety Act.", sourceUrl: "#" },
  { id: "gln-4", headline: "South Korea enacts comprehensive AI Basic Act", countryName: "South Korea", countryCode: "KR", region: "Asia-Pacific", date: "2025-01-10", category: "NEW_LAW", summary: "Korea's AI Basic Act creates risk classification system, mandatory impact assessments, and AI transparency obligations for public-facing systems.", sourceUrl: "#" },
  { id: "gln-5", headline: "Brazil's AI regulatory framework signed into law", countryName: "Brazil", countryCode: "BR", region: "Americas", date: "2025-01-05", category: "NEW_LAW", summary: "Marco Legal da IA enacted after 2+ years of debate. Risk-based approach with mandatory impact assessments for high-risk AI. Effective January 2025.", sourceUrl: "#" },
  { id: "gln-6", headline: "Australia criminalizes non-consensual AI deepfakes", countryName: "Australia", countryCode: "AU", region: "Asia-Pacific", date: "2025-01-22", category: "NEW_LAW", summary: "Criminal Code amendments take effect — creation or distribution of non-consensual AI deepfakes carries up to 7 years imprisonment.", sourceUrl: "#" },
  { id: "gln-7", headline: "India mandates AI content labeling for elections", countryName: "India", countryCode: "IN", region: "Asia-Pacific", date: "2025-02-03", category: "ENFORCEMENT_ACTION", summary: "MeitY issues binding advisory requiring all platforms to label AI-generated political content ahead of state elections.", sourceUrl: "#" },
  { id: "gln-8", headline: "Canada reintroduces AIDA — Artificial Intelligence and Data Act", countryName: "Canada", countryCode: "CA", region: "Americas", date: "2025-01-28", category: "PROPOSED", summary: "Revised AIDA tabled in Parliament with stronger enforcement mechanisms and alignment with EU AI Act risk categories.", sourceUrl: "#" },
  { id: "gln-9", headline: "France CNIL fines AI company €10M for training data violations", countryName: "France", countryCode: "FR", region: "Europe", date: "2025-01-18", category: "ENFORCEMENT_ACTION", summary: "CNIL issues first major fine for GDPR violations in AI model training — unauthorized use of personal data from web scraping.", sourceUrl: "#" },
  { id: "gln-10", headline: "Singapore updates Model AI Governance Framework for GenAI", countryName: "Singapore", countryCode: "SG", region: "Asia-Pacific", date: "2025-02-05", category: "AMENDMENT", summary: "IMDA releases Model AI Governance Framework 2.0 with specific guidance on generative AI transparency and content provenance.", sourceUrl: "#" },
  { id: "gln-11", headline: "UAE launches AI regulatory sandbox in ADGM", countryName: "United Arab Emirates", countryCode: "AE", region: "Middle East", date: "2025-01-12", category: "NEW_LAW", summary: "Abu Dhabi Global Market launches dedicated AI regulatory sandbox allowing companies to test AI products under supervised compliance.", sourceUrl: "#" },
  { id: "gln-12", headline: "Germany's BfDI issues AI transparency guidelines", countryName: "Germany", countryCode: "DE", region: "Europe", date: "2025-01-25", category: "AMENDMENT", summary: "Federal Commissioner for Data Protection publishes binding guidelines on AI content disclosure requirements under EU AI Act implementation.", sourceUrl: "#" },
  { id: "gln-13", headline: "Japan proposes AI Basic Law with focus on innovation", countryName: "Japan", countryCode: "JP", region: "Asia-Pacific", date: "2025-02-01", category: "PROPOSED", summary: "Cabinet office proposes AI Basic Law emphasizing responsible innovation, voluntary compliance for most uses, and limited mandatory obligations for high-risk applications.", sourceUrl: "#" },
  { id: "gln-14", headline: "Italy's Garante blocks AI tool for GDPR violations", countryName: "Italy", countryCode: "IT", region: "Europe", date: "2025-01-30", category: "ENFORCEMENT_ACTION", summary: "Italian data protection authority temporarily blocks an AI content generation service for failing to implement age verification and content labeling.", sourceUrl: "#" },
  { id: "gln-15", headline: "Ireland's DPC opens EU AI Act enforcement office", countryName: "Ireland", countryCode: "IE", region: "Europe", date: "2025-02-04", category: "NEW_LAW", summary: "Irish DPC establishes dedicated AI compliance division — expected to become primary enforcer for many Big Tech AI systems under EU AI Act.", sourceUrl: "#" },
  { id: "gln-16", headline: "Philippines enacts Take It Down Act — up to 20 years for deepfake crimes", countryName: "Philippines", countryCode: "PH", region: "Asia-Pacific", date: "2025-06-15", category: "NEW_LAW", summary: "HB 807 signed into law imposing 12–20 year sentences for AI-generated sexually explicit deepfakes. DICT launches Take It Down Portal for 48-hour content removal. Platforms face ₱1M fines per violation.", sourceUrl: "#" },
  { id: "gln-17", headline: "Denmark amends copyright law — likeness now intellectual property", countryName: "Denmark", countryCode: "DK", region: "Europe", date: "2025-03-10", category: "NEW_LAW", summary: "Landmark amendment treats a person's face, voice, and body as IP. AI-generated reproductions require consent. Protection extends 50 years after death. Exceptions for parody and satire.", sourceUrl: "#" },
  { id: "gln-18", headline: "Malaysia mandates AI-generated content labeling", countryName: "Malaysia", countryCode: "MY", region: "Asia-Pacific", date: "2025-07-13", category: "NEW_LAW", summary: "Communications Minister announces mandatory 'AI generated' labeling to curb scams, defamation, and deepfakes. Law expected by end 2025, with comprehensive AI Bill targeting mid-2026.", sourceUrl: "#" },
  { id: "gln-19", headline: "Peru's AI law marks first dedicated legislation in Latin America", countryName: "Peru", countryCode: "PE", region: "Americas", date: "2025-01-08", category: "NEW_LAW", summary: "Law No. 31814 (2023) establishing ethical AI promotion framework continues implementation. Peru becomes a regional reference for AI governance with transparency and accountability requirements.", sourceUrl: "#" },
  { id: "gln-20", headline: "Thailand unveils draft AI law based on EU AI Act risk framework", countryName: "Thailand", countryCode: "TH", region: "Asia-Pacific", date: "2025-04-20", category: "PROPOSED", summary: "ETDA's AI Governance Center publishes Draft AI Law Principles with prohibited-risk and high-risk tiers. National AI Strategy targets 2027 full implementation. Focus on deepfakes and disinformation.", sourceUrl: "#" },
]
