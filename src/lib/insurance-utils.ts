/**
 * Insurance Dashboard Calculation Utilities
 * 
 * Based on cr_dashboard_feature_additions_dev_instructions.md
 * 
 * Provides functions for calculating:
 * - TIV (Total Insured Value)
 * - EAL (Expected Annual Loss)
 * - Liability Estimate
 * - Risk Scores
 * - Workflow Completion
 */

import type {
  PortfolioMixType,
  DistributionLevel,
  RiskLevel,
  WorkflowStep,
  RiskScores,
  AssetFinancialBreakdown,
} from "@/types";

// ==============================================
// Risk Multipliers
// ==============================================

export const PORTFOLIO_MIX_MULTIPLIERS: Record<PortfolioMixType, number> = {
  "Pure Human": 1.0,
  "AI-Assisted": 1.5,
  "Hybrid": 2.0,
  "AI-Generated": 3.0,
};

export const DISTRIBUTION_MULTIPLIERS: Record<DistributionLevel, number> = {
  Internal: 1.0,
  Regional: 1.5,
  National: 2.5,
  Global: 4.0,
};

// ==============================================
// Risk Score Calculations
// ==============================================

/**
 * Calculate Documentation Score
 * Formula: (Completed Steps ÷ 7) × 100
 * Target: >85
 */
export function calculateDocumentationScore(
  completedSteps: number,
  totalSteps: number = 7
): number {
  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Calculate Tool Safety Score
 * % of assets using approved tools
 * Penalties for blacklisted tools
 * Target: >90
 */
export function calculateToolSafetyScore(
  approvedToolCount: number,
  totalAssetCount: number,
  blacklistedToolCount: number = 0
): number {
  const baseScore = (approvedToolCount / totalAssetCount) * 100;
  const penalty = blacklistedToolCount * 10; // 10 points per blacklisted tool
  return Math.max(0, Math.round(baseScore - penalty));
}

/**
 * Calculate Copyright Check Score
 * Based on similarity scan pass rate
 * Threshold: <30% similarity = pass
 * Target: >95
 */
export function calculateCopyrightCheckScore(
  passedScans: number,
  totalScans: number
): number {
  if (totalScans === 0) return 0;
  return Math.round((passedScans / totalScans) * 100);
}

/**
 * Calculate AI Model Trust Score
 * Weighted average of model trust ratings
 * Target: >80
 */
export function calculateAIModelTrustScore(
  modelTrustRatings: number[] // Array of 0-100 trust ratings
): number {
  if (modelTrustRatings.length === 0) return 0;
  const sum = modelTrustRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round(sum / modelTrustRatings.length);
}

/**
 * Calculate Training Data Quality Score
 * Weighted licensed vs scraped data
 * Major deductions for unverified sources
 * Target: >75 (highest weight)
 */
export function calculateTrainingDataQualityScore(
  licensedDataPercentage: number,
  unverifiedSourcesCount: number
): number {
  const baseScore = licensedDataPercentage;
  const penalty = unverifiedSourcesCount * 15; // 15 points per unverified source
  return Math.max(0, Math.round(baseScore - penalty));
}

/**
 * Calculate overall Risk Score from 5 key metrics
 * Weighted average with Training Data Quality having highest weight
 */
export function calculateRiskScore(scores: RiskScores): number {
  const weights = {
    documentation: 0.15,
    toolSafety: 0.20,
    copyrightCheck: 0.25,
    aiModelTrust: 0.15,
    trainingDataQuality: 0.25, // Highest weight
  };

  return Math.round(
    scores.documentation * weights.documentation +
      scores.toolSafety * weights.toolSafety +
      scores.copyrightCheck * weights.copyrightCheck +
      scores.aiModelTrust * weights.aiModelTrust +
      scores.trainingDataQuality * weights.trainingDataQuality
  );
}

/**
 * Map Risk Score to Risk Grade (A-F)
 */
export function getRiskGrade(riskScore: number): "A" | "B" | "C" | "D" | "E" | "F" {
  if (riskScore >= 90) return "A";
  if (riskScore >= 80) return "B";
  if (riskScore >= 70) return "C";
  if (riskScore >= 60) return "D";
  if (riskScore >= 50) return "E";
  return "F";
}

/**
 * Map Workflow Completion to Risk Level
 * 7/7 → Low Risk
 * 5/7 → Medium Risk
 * 3/7 → High Risk
 */
export function getRiskLevelFromWorkflow(
  completedSteps: number,
  totalSteps: number = 7
): RiskLevel {
  const completionRate = completedSteps / totalSteps;
  if (completionRate >= 1.0) return "Low";
  if (completionRate >= 0.71) return "Low"; // 5/7 ≈ 0.71
  if (completionRate >= 0.43) return "Medium"; // 3/7 ≈ 0.43
  return "High";
}

// ==============================================
// Financial Calculations
// ==============================================

/**
 * Calculate Total Insured Value (TIV)
 * Formula: Asset Value × Risk Multiplier × Distribution Multiplier
 */
export function calculateTIV(
  assetValue: number,
  riskMultiplier: number,
  distributionMultiplier: number
): number {
  return assetValue * riskMultiplier * distributionMultiplier;
}

/**
 * Calculate Expected Annual Loss (EAL)
 * Formula: TIV × Base Probability × (1 − Documentation Score)
 * Base probability example: 0.5%
 */
export function calculateEAL(
  tiv: number,
  documentationScore: number,
  baseProbability: number = 0.005 // 0.5%
): number {
  return tiv * baseProbability * (1 - documentationScore / 100);
}

/**
 * Calculate Liability Estimate
 * Formula: EAL × Safety Buffer (default 1.5×)
 */
export function calculateLiability(
  eal: number,
  safetyBuffer: number = 1.5
): number {
  return eal * safetyBuffer;
}

/**
 * Calculate asset financial breakdown
 */
export function calculateAssetFinancialBreakdown(
  baseValue: number,
  riskMultiplier: number,
  distributionMultiplier: number
): AssetFinancialBreakdown {
  const finalInsuredValue = calculateTIV(
    baseValue,
    riskMultiplier,
    distributionMultiplier
  );

  return {
    baseValue,
    riskMultiplier,
    distributionMultiplier,
    finalInsuredValue,
  };
}

// ==============================================
// Portfolio Calculations
// ==============================================

/**
 * Calculate portfolio TIV from multiple assets
 */
export function calculatePortfolioTIV(
  assets: Array<{
    baseValue: number;
    riskMultiplier: number;
    distributionMultiplier: number;
  }>
): number {
  return assets.reduce((total, asset) => {
    return total + calculateTIV(
      asset.baseValue,
      asset.riskMultiplier,
      asset.distributionMultiplier
    );
  }, 0);
}

/**
 * Calculate AI usage percentage
 */
export function calculateAIUsagePercentage(
  portfolioMix: Array<{ type: PortfolioMixType; count: number }>
): number {
  const total = portfolioMix.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return 0;

  const aiCount = portfolioMix
    .filter(
      (item) =>
        item.type === "AI-Assisted" ||
        item.type === "Hybrid" ||
        item.type === "AI-Generated"
    )
    .reduce((sum, item) => sum + item.count, 0);

  return Math.round((aiCount / total) * 100);
}

/**
 * Check if AI usage exceeds threshold
 */
export function isAIUsageExcessive(
  aiUsagePercentage: number,
  threshold: number = 60
): boolean {
  return aiUsagePercentage > threshold;
}

// ==============================================
// Workflow Utilities
// ==============================================

/**
 * Calculate workflow completion rate
 */
export function calculateWorkflowCompletion(
  steps: WorkflowStep[]
): {
  completedSteps: number;
  totalSteps: number;
  completionRate: number;
  riskLevel: RiskLevel;
} {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const completionRate = calculateDocumentationScore(completedSteps, totalSteps);
  const riskLevel = getRiskLevelFromWorkflow(completedSteps, totalSteps);

  return {
    completedSteps,
    totalSteps,
    completionRate,
    riskLevel,
  };
}

// ==============================================
// Client Concentration Risk
// ==============================================

/**
 * Check if client concentration is excessive (>30%)
 */
export function isClientConcentrationExcessive(
  clientPercentage: number,
  threshold: number = 30
): boolean {
  return clientPercentage > threshold;
}

// ==============================================
// Formatting Utilities
// ==============================================

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format large currency values (K, M, B)
 */
export function formatLargeCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

