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
