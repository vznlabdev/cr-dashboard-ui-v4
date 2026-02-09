"use client"

import { useMemo, useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ComplianceLayout } from "@/components/compliance/ComplianceLayout"
import { useData } from "@/contexts/data-context"
import { calculateAssetDistributionRisk, type AssetDistributionRiskResult } from "@/lib/distribution-compliance"
import type { ProjectDistribution } from "@/types"
import type { Asset } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MapPin, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

const US_STATES_IN_SCOPE = ["CA", "NY", "TX"] as const
const INTL_MARKETS = ["EU", "UK"] as const
const MARKET_LABELS: Record<string, string> = {
  CA: "California",
  NY: "New York",
  TX: "Texas",
  EU: "European Union",
  UK: "United Kingdom",
}

function getUsStatesFromDistribution(distribution: ProjectDistribution): string[] {
  if (distribution.us_states?.includes("ALL")) return [...US_STATES_IN_SCOPE]
  return (distribution.us_states ?? []).filter((s) => US_STATES_IN_SCOPE.includes(s as typeof US_STATES_IN_SCOPE[number]))
}

function getIntlFromDistribution(distribution: ProjectDistribution): string[] {
  return (distribution.countries ?? []).filter((c) => INTL_MARKETS.includes(c as typeof INTL_MARKETS[number]))
}

function assetToRiskInput(asset: Asset): { contentType?: string; creatorIds?: string[]; talentRightsVerified?: boolean; platformCompliance?: Record<string, boolean> } {
  const aiMethod = (asset as { aiMethod?: string }).aiMethod
  return {
    contentType: aiMethod === "AI Generative" ? "ai_generated" : undefined,
    creatorIds: asset.creatorIds ?? [],
    talentRightsVerified: (asset as { talentRightsVerified?: boolean }).talentRightsVerified ?? false,
    platformCompliance: (asset as { platformCompliance?: Record<string, boolean> }).platformCompliance,
  }
}

type StateRiskLevel = "green" | "yellow" | "red"

function getStateRiskLevel(marketIssuesByState: Map<string, { count: number; hasHigh: boolean }>, state: string): StateRiskLevel {
  const info = marketIssuesByState.get(state)
  if (!info || info.count === 0) return "green"
  if (info.hasHigh || info.count >= 2) return "red"
  return "yellow"
}

function DistributionRiskContent() {
  const searchParams = useSearchParams()
  const projectIdFromUrl = searchParams.get("project") ?? undefined
  const { projects, getProjectById, getProjectAssets } = useData()

  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  useEffect(() => {
    if (projectIdFromUrl && getProjectById(projectIdFromUrl)) {
      setSelectedProjectId(projectIdFromUrl)
    } else if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projectIdFromUrl, projects, getProjectById, selectedProjectId])

  const project = selectedProjectId ? getProjectById(selectedProjectId) : undefined
  const distribution = project?.distribution ?? null
  const assets = selectedProjectId ? getProjectAssets(selectedProjectId) : []

  const assetRisks = useMemo(() => {
    if (!distribution) return new Map<string, AssetDistributionRiskResult>()
    const map = new Map<string, AssetDistributionRiskResult>()
    for (const asset of assets) {
      const input = assetToRiskInput(asset)
      map.set(asset.id, calculateAssetDistributionRisk(input, distribution))
    }
    return map
  }, [distribution, assets])

  const summary = useMemo(() => {
    let totalProjects = 1
    let highRiskAssets = 0
    const marketsWithIssuesSet = new Set<string>()
    let totalPenaltyExposure = 0
    for (const [, result] of assetRisks) {
      if (result.status === "blocked" || result.status === "needs_review") highRiskAssets++
      for (const m of result.marketIssues) {
        marketsWithIssuesSet.add(m.market)
        totalPenaltyExposure += result.totalPenaltyExposure
      }
    }
    totalPenaltyExposure = Array.from(assetRisks.values()).reduce((sum, r) => sum + r.totalPenaltyExposure, 0)
    return {
      totalProjects,
      highRiskAssets,
      marketsWithIssues: marketsWithIssuesSet.size,
      totalPenaltyExposure,
    }
  }, [assetRisks])

  const usStatesInDistribution = distribution ? getUsStatesFromDistribution(distribution) : []
  const intlInDistribution = distribution ? getIntlFromDistribution(distribution) : []

  const marketIssuesByState = useMemo(() => {
    const map = new Map<string, { count: number; hasHigh: boolean }>()
    for (const state of US_STATES_IN_SCOPE) {
      map.set(state, { count: 0, hasHigh: false })
    }
    for (const [, result] of assetRisks) {
      for (const mi of result.marketIssues) {
        if (!US_STATES_IN_SCOPE.includes(mi.market as typeof US_STATES_IN_SCOPE[number])) continue
        const cur = map.get(mi.market) ?? { count: 0, hasHigh: false }
        map.set(mi.market, {
          count: cur.count + 1,
          hasHigh: cur.hasHigh || mi.riskLevel === "high" || mi.riskLevel === "blocked",
        })
      }
    }
    return map
  }, [assetRisks])

  const assetsByState = useMemo(() => {
    const map = new Map<string, { asset: Asset; result: AssetDistributionRiskResult }[]>()
    for (const state of US_STATES_IN_SCOPE) {
      map.set(state, [])
    }
    assets.forEach((asset) => {
      const result = assetRisks.get(asset.id)
      if (!result) return
      for (const mi of result.marketIssues) {
        if (!US_STATES_IN_SCOPE.includes(mi.market as typeof US_STATES_IN_SCOPE[number])) continue
        const list = map.get(mi.market) ?? []
        list.push({ asset, result })
        map.set(mi.market, list)
      }
    })
    return map
  }, [assets, assetRisks])

  const internationalRows = useMemo(() => {
    return intlInDistribution.map((country) => {
      let riskLevel: string = "Low"
      const issues: string[] = []
      let affectedCount = 0
      assets.forEach((asset) => {
        const result = assetRisks.get(asset.id)
        if (!result) return
        const mi = result.marketIssues.find((m) => m.market === country)
        if (!mi) return
        affectedCount++
        if (mi.riskLevel === "high" || mi.riskLevel === "blocked") riskLevel = "High"
        else if (mi.riskLevel === "medium" && riskLevel !== "High") riskLevel = "Medium"
        if (mi.needed) issues.push(mi.needed)
      })
      const uniqueIssues = Array.from(new Set(issues))
      return {
        country,
        riskLevel,
        issues: uniqueIssues.join("; ") || "—",
        affectedAssets: affectedCount,
      }
    })
  }, [intlInDistribution, assets, assetRisks])

  const assetRiskRows = useMemo(() => {
    return assets
      .map((asset) => {
        const result = assetRisks.get(asset.id)
        if (!result) return null
        const hasIssues = result.marketIssues.length > 0
        if (!hasIssues) return null
        const markets = result.marketIssues.map((m) => m.market).join(", ")
        const topIssue = result.marketIssues[0]?.needed ?? "—"
        return {
          asset,
          result,
          markets,
          status: result.status,
          topIssue,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [assets, assetRisks])

  const [clickedState, setClickedState] = useState<string | null>(null)

  if (!distribution) {
    return (
      <ComplianceLayout title="Distribution Risk">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Project</span>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No distribution configured for this project. Set distribution in project settings to see risk analysis.
            </CardContent>
          </Card>
        </div>
      </ComplianceLayout>
    )
  }

  return (
    <ComplianceLayout title="Distribution Risk">
      <div className="flex flex-col gap-6">
        {/* Project filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Project</span>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">{summary.totalProjects}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">{summary.highRiskAssets}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Markets with Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">{summary.marketsWithIssues}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Penalty Exposure</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">${summary.totalPenaltyExposure.toLocaleString()}</span>
            </CardContent>
          </Card>
        </div>

        {/* US states */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              US Markets
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Green: no issues. Yellow: disclosure needed. Red: multiple or high-severity violations. Click a state to see affected assets.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {usStatesInDistribution.length === 0 ? (
                <span className="text-sm text-muted-foreground">No US states in distribution.</span>
              ) : (
                usStatesInDistribution.map((state) => {
                  const level = getStateRiskLevel(marketIssuesByState, state)
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => setClickedState(clickedState === state ? null : state)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                        level === "green" && "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                        level === "yellow" && "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
                        level === "red" && "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                      )}
                    >
                      {state} – {MARKET_LABELS[state] ?? state}
                    </button>
                  )
                })
              )}
            </div>
            {clickedState && assetsByState.get(clickedState) && (
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="mb-2 text-sm font-medium">Assets with issues in {clickedState}</p>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {(assetsByState.get(clickedState) ?? []).map(({ asset }) => (
                    <li key={asset.id}>
                      <Link
                        href={`/creative/assets/${asset.id}`}
                        className="text-primary hover:underline"
                      >
                        {asset.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* International markets table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">International Markets</CardTitle>
            <p className="text-sm text-muted-foreground">Risk by country for the selected project.</p>
          </CardHeader>
          <CardContent>
            {internationalRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No international markets in distribution.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead className="text-right">Affected Assets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internationalRows.map((row) => (
                    <TableRow key={row.country}>
                      <TableCell className="font-medium">{MARKET_LABELS[row.country] ?? row.country}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            row.riskLevel === "High" && "bg-red-500/10 text-red-700",
                            row.riskLevel === "Medium" && "bg-amber-500/10 text-amber-700",
                            row.riskLevel === "Low" && "bg-emerald-500/10 text-emerald-700"
                          )}
                        >
                          {row.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{row.issues}</TableCell>
                      <TableCell className="text-right">{row.affectedAssets}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Asset risk table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset Risk</CardTitle>
            <p className="text-sm text-muted-foreground">Assets with distribution compliance issues.</p>
          </CardHeader>
          <CardContent>
            {assetRiskRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assets with issues for this project.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Markets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Top Issue</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetRiskRows.map(({ asset, result, markets, status, topIssue }) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{markets}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            status === "blocked" && "bg-red-500/10 text-red-700",
                            status === "needs_review" && "bg-amber-500/10 text-amber-700",
                            status === "clear" && "bg-emerald-500/10 text-emerald-700"
                          )}
                        >
                          {status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{topIssue}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/creative/assets/${asset.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ComplianceLayout>
  )
}

export default function DistributionRiskPage() {
  return (
    <Suspense
      fallback={
        <ComplianceLayout title="Distribution Risk">
          <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
        </ComplianceLayout>
      }
    >
      <DistributionRiskContent />
    </Suspense>
  )
}
