/**
 * MVP distribution compliance risk for an asset against project distribution markets.
 * Focus: CA, NY, TX, EU, UK regulations.
 */

import type { ProjectDistribution } from "@/types"

export type DistributionComplianceStatus = "clear" | "needs_review" | "blocked"

export type MarketRiskLevel = "low" | "medium" | "high" | "blocked"

export interface MarketIssue {
  market: string
  riskLevel: MarketRiskLevel
  needed: string
}

export interface AssetDistributionRiskResult {
  status: DistributionComplianceStatus
  marketIssues: MarketIssue[]
  totalPenaltyExposure: number
}

/** Asset-like shape for risk calculation */
export interface AssetForDistributionRisk {
  contentType?: string
  creatorIds?: string[]
  talentRightsVerified?: boolean
  /** Optional: platform-specific compliance flags (e.g. metaAiLabelApplied) */
  platformCompliance?: Record<string, boolean>
}

const MARKETS_REQUIRING_AI_DISCLOSURE = ["CA", "NY", "EU", "UK"]
const MARKETS_REQUIRING_NILP_FOR_ADS = ["CA", "NY", "EU", "UK", "TX"]
const PENALTY_ESTIMATES: Record<string, number> = {
  CA: 2500,
  NY: 1000,
  TX: 1500,
  EU: 10000,
  UK: 5000,
}

function getMarketsFromDistribution(distribution: ProjectDistribution): string[] {
  const states = distribution.us_states?.includes("ALL")
    ? ["CA", "NY", "TX"]
    : (distribution.us_states ?? []).filter((s) => ["CA", "NY", "TX"].includes(s))
  const countries = (distribution.countries ?? []).filter((c) => ["EU", "UK"].includes(c))
  return [...states, ...countries]
}

/**
 * Calculate distribution compliance risk for an asset against the project's distribution settings.
 * MVP checks: AI disclosure (CA, NY, EU, UK), NILP/talent consent for ads, simple platform policy placeholder.
 */
export function calculateAssetDistributionRisk(
  asset: AssetForDistributionRisk,
  distribution: ProjectDistribution
): AssetDistributionRiskResult {
  const markets = getMarketsFromDistribution(distribution)
  const isAIGenerated = asset.contentType === "ai_generated"
  const hasTalent = (asset.creatorIds?.length ?? 0) > 0
  const talentVerified = asset.talentRightsVerified === true
  const primaryUse = distribution.primary_use
  const isAdvertising = primaryUse === "advertising"

  const marketIssues: MarketIssue[] = []
  let totalPenaltyExposure = 0

  for (const market of markets) {
    const issues: string[] = []
    let riskLevel: MarketRiskLevel = "low"

    if (MARKETS_REQUIRING_AI_DISCLOSURE.includes(market) && isAIGenerated) {
      issues.push("AI disclosure required for this market")
      riskLevel = riskLevel === "low" ? "medium" : riskLevel
    }

    if (
      isAdvertising &&
      MARKETS_REQUIRING_NILP_FOR_ADS.includes(market) &&
      hasTalent &&
      !talentVerified
    ) {
      issues.push("NILP consent required when talent is featured in ads")
      riskLevel = "high"
    }

    if (distribution.platforms?.length && !asset.platformCompliance?.meta && distribution.platforms.some((p) => p.toLowerCase().includes("meta"))) {
      issues.push("Meta: AI content labeling may be required")
      if (riskLevel === "low") riskLevel = "medium"
    }

    if (issues.length > 0) {
      marketIssues.push({
        market,
        riskLevel,
        needed: issues.join("; "),
      })
      totalPenaltyExposure += PENALTY_ESTIMATES[market] ?? 0
    }
  }

  const hasBlocked = marketIssues.some((m) => m.riskLevel === "blocked")
  const hasNeedsReview = marketIssues.some((m) => m.riskLevel === "high" || m.riskLevel === "medium")
  const status: DistributionComplianceStatus = hasBlocked
    ? "blocked"
    : hasNeedsReview
      ? "needs_review"
      : "clear"

  return {
    status,
    marketIssues,
    totalPenaltyExposure,
  }
}
