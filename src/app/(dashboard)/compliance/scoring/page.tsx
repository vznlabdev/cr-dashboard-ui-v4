"use client"

import { Suspense, useState, useEffect, useMemo, Fragment } from "react"
import { useSearchParams } from "next/navigation"
import { ComplianceLayout } from "@/components/compliance/ComplianceLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { getModelRiskScores, getModelRiskExplainability, calculatePremium } from "@/lib/compliance/api"
import type { ModelRiskScore, RemediationItem, RiskFactor, PremiumCalculation } from "@/types/compliance"
import { toast } from "sonner"
import Link from "next/link"

const riskClassColors: Record<string, string> = {
  Low: "#10b981", Moderate: "#f59e0b", Guarded: "#f97316",
  Elevated: "#ef4444", Severe: "#e11d48", Critical: "#1e293b",
}

const categoryColors: Record<string, string> = {
  CONSENT: "text-purple-600 bg-purple-500/10",
  PROVENANCE: "text-blue-600 bg-blue-500/10",
  REGULATORY: "text-orange-600 bg-orange-500/10",
  TECHNICAL: "text-slate-600 bg-slate-500/10",
  OPERATIONAL: "text-emerald-600 bg-emerald-500/10",
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  PASS: CheckCircle2, WARNING: AlertTriangle, FAIL: XCircle,
}

export default function ScoringPage() {
  return (
    <Suspense fallback={<ComplianceLayout title="Scoring"><div className="h-64 flex items-center justify-center text-sm text-muted-foreground">Loading...</div></ComplianceLayout>}>
      <ScoringPageContent />
    </Suspense>
  )
}

function ScoringPageContent() {
  const searchParams = useSearchParams()
  const [allModels, setAllModels] = useState<ModelRiskScore[]>([])
  const [selectedModel, setSelectedModel] = useState<ModelRiskScore | null>(null)
  const [remediation, setRemediation] = useState<RemediationItem[]>([])
  const [projectedMRS, setProjectedMRS] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)

  // Premium calc state
  const [premLimit, setPremLimit] = useState(1000000)
  const [premRate, setPremRate] = useState(2)
  const [premJurisdiction, setPremJurisdiction] = useState("NY")
  const [premResult, setPremResult] = useState<PremiumCalculation | null>(null)

  useEffect(() => {
    getModelRiskScores().then((models) => {
      setAllModels(models)
      const modelParam = searchParams.get("model")
      if (modelParam) {
        const found = models.find((m) => m.modelId === modelParam)
        if (found) selectModel(found)
      } else if (models.length > 0) {
        selectModel(models[0])
      }
    })
  }, [searchParams])

  async function selectModel(model: ModelRiskScore) {
    setSelectedModel(model)
    const result = await getModelRiskExplainability(model.modelId)
    if (result) {
      setRemediation(result.remediationRoadmap)
      setProjectedMRS(result.projectedMRS)
    }
  }

  async function runPremiumCalc() {
    if (!selectedModel) return
    const result = await calculatePremium(premLimit, premRate, premJurisdiction, selectedModel.finalMRS)
    setPremResult(result)
  }

  const filteredModels = useMemo(() => {
    if (!searchQuery) return allModels
    const q = searchQuery.toLowerCase()
    return allModels.filter((m) => m.modelName.toLowerCase().includes(q) || m.modelId.toLowerCase().includes(q))
  }, [allModels, searchQuery])

  const waterfallData = useMemo(() => {
    if (!selectedModel) return []
    const factors = selectedModel.riskFactors
      .filter((f) => f.scoreImpact < 0)
      .sort((a, b) => a.scoreImpact - b.scoreImpact)

    let running = 100
    const data = [{ name: "Base", value: 100, fill: "#10b981", delta: 0 }]
    factors.forEach((f) => {
      data.push({ name: f.name.length > 18 ? f.name.slice(0, 18) + "..." : f.name, value: running + f.scoreImpact, fill: "#ef4444", delta: f.scoreImpact })
      running += f.scoreImpact
    })
    data.push({ name: "Final MRS", value: selectedModel.finalMRS, fill: riskClassColors[selectedModel.riskClass] || "#64748b", delta: 0 })
    return data
  }, [selectedModel])

  const sortedBest = useMemo(() => [...allModels].sort((a, b) => b.finalMRS - a.finalMRS).slice(0, 10), [allModels])
  const sortedWorst = useMemo(() => [...allModels].sort((a, b) => a.finalMRS - b.finalMRS).slice(0, 10), [allModels])

  return (
    <ComplianceLayout title="Scoring">
      {/* Search + Model list */}
      <div className="flex gap-4">
        <div className="w-56 shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Find model or asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border/60 pl-7 pr-3 py-1.5 text-[12px] bg-background placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
            {filteredModels.map((m) => (
              <button
                key={m.modelId}
                type="button"
                onClick={() => selectModel(m)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-md text-[12px] transition-colors flex items-center justify-between",
                  selectedModel?.modelId === m.modelId ? "bg-muted font-medium" : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <span className="truncate">{m.modelName}</span>
                <span className="font-mono text-[11px] ml-2" style={{ color: riskClassColors[m.riskClass] }}>{m.finalMRS}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-4 min-w-0">
          {selectedModel ? (
            <>
              {/* Split Panel: Provenance + MRS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Provenance Score placeholder (linked to asset) */}
                <div className="rounded-md border border-border/40 p-3">
                  <div className="text-[13px] font-medium mb-2">Provenance Score</div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative h-16 w-16">
                      <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke={riskClassColors[selectedModel.riskClass]} strokeWidth="3" strokeDasharray={`${(selectedModel.baseScore / 100) * 94.2} 94.2`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold">{selectedModel.baseScore}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      <div>Lineage Fidelity: <span className="font-mono text-foreground">{60 + Math.floor(selectedModel.baseScore * 0.3)}</span></div>
                      <div>Consent Compliance: <span className="font-mono text-foreground">{50 + Math.floor(selectedModel.baseScore * 0.4)}</span></div>
                      <div>Regulatory Compatibility: <span className="font-mono text-foreground">{55 + Math.floor(selectedModel.baseScore * 0.3)}</span></div>
                      <div>Metadata Quality: <span className="font-mono text-foreground">{45 + Math.floor(selectedModel.baseScore * 0.4)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right: MRS */}
                <div className="rounded-md border border-border/40 p-3">
                  <div className="text-[13px] font-medium mb-2">Model Risk Score (MRS)</div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl font-mono font-bold" style={{ color: riskClassColors[selectedModel.riskClass] }}>
                      {selectedModel.finalMRS}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ color: riskClassColors[selectedModel.riskClass], backgroundColor: `${riskClassColors[selectedModel.riskClass]}15` }}
                    >
                      {selectedModel.riskClass}
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1 text-muted-foreground">
                    <div>Base Score: <span className="font-mono text-foreground">{selectedModel.baseScore}</span> | NY Adjustment: <span className="font-mono text-foreground">{selectedModel.nyAdjustment}</span></div>
                    <div className="flex gap-4 mt-1">
                      <span>Premium: <span className="font-mono font-medium text-foreground">{selectedModel.premiumMultiplier}x</span></span>
                      <span>Deductible: <span className="font-mono font-medium text-foreground">{selectedModel.deductiblePct !== null ? `${selectedModel.deductiblePct}%` : "N/A"}</span></span>
                      <span>Max Capacity: <span className="font-mono font-medium text-foreground">{selectedModel.maxCapacityPct}%</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factor Audit Table */}
              <div className="rounded-md border border-border/40">
                <div className="px-3 py-2 border-b border-border/30 text-[13px] font-medium">Risk Factor Audit</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-muted-foreground text-left border-b border-border/20">
                        <th className="px-3 py-1.5 font-medium">Risk Factor</th>
                        <th className="px-3 py-1.5 font-medium">Category</th>
                        <th className="px-3 py-1.5 font-medium text-right">Weight</th>
                        <th className="px-3 py-1.5 font-medium text-right">Impact</th>
                        <th className="px-3 py-1.5 font-medium">Status</th>
                        <th className="px-3 py-1.5 font-medium">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedModel.riskFactors.sort((a, b) => a.scoreImpact - b.scoreImpact).map((factor) => {
                        const StatusIcon = statusIcons[factor.status]
                        const isExpanded = expandedFactor === factor.id
                        return (
                          <Fragment key={factor.id}>
                            <tr
                              className="border-b border-border/10 hover:bg-muted/30 transition-colors cursor-pointer h-8"
                              onClick={() => setExpandedFactor(isExpanded ? null : factor.id)}
                            >
                              <td className="px-3 py-1 font-medium">{factor.name}</td>
                              <td className="px-3 py-1">
                                <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", categoryColors[factor.category])}>
                                  {factor.category}
                                </span>
                              </td>
                              <td className="px-3 py-1 text-right font-mono text-[11px] text-muted-foreground">{(factor.weight * 100).toFixed(0)}%</td>
                              <td className="px-3 py-1 text-right font-mono text-[11px] font-medium">
                                <span className={factor.scoreImpact < 0 ? "text-red-500" : factor.scoreImpact > 0 ? "text-emerald-500" : "text-muted-foreground"}>
                                  {factor.scoreImpact > 0 ? "+" : ""}{factor.scoreImpact}
                                </span>
                              </td>
                              <td className="px-3 py-1">
                                <StatusIcon className={cn("h-3.5 w-3.5", factor.status === "PASS" ? "text-emerald-500" : factor.status === "WARNING" ? "text-amber-500" : "text-red-500")} />
                              </td>
                              <td className="px-3 py-1 text-muted-foreground truncate max-w-[200px]">{factor.detail}</td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-muted/10">
                                <td colSpan={6} className="px-6 py-2 text-[11px]">
                                  <div className="space-y-1">
                                    <div><span className="text-muted-foreground">Remediation:</span> {factor.remediationAction}</div>
                                    <div><span className="text-muted-foreground">Est. improvement:</span> <span className="font-mono text-emerald-500">+{factor.estimatedImprovement} pts</span></div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Score Waterfall Chart */}
              <div className="rounded-md border border-border/40 p-3">
                <div className="text-[13px] font-medium mb-2">Score Waterfall</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={waterfallData} barSize={18}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-muted-foreground, #64748b)" }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={50} />
                    <YAxis domain={[0, 105]} hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--color-background, #fff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "6px", fontSize: "11px" }}
                      formatter={(value: number, _name: string, props: { payload?: { delta?: number } }) => {
                        const delta = props.payload?.delta ?? 0
                        return [delta !== 0 ? `${delta}` : `${value}`, "Score"]
                      }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {waterfallData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Jurisdiction Impact Breakdown */}
              <div className="rounded-md border border-border/40">
                <div className="px-3 py-2 border-b border-border/30 text-[13px] font-medium">Jurisdiction Impact</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-muted-foreground text-left border-b border-border/20">
                        <th className="px-3 py-1.5 font-medium">Jurisdiction</th>
                        <th className="px-3 py-1.5 font-medium">Law Type</th>
                        <th className="px-3 py-1.5 font-medium">Compliance</th>
                        <th className="px-3 py-1.5 font-medium text-right">Score Penalty</th>
                        <th className="px-3 py-1.5 font-medium text-right">Multiplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedModel.jurisdictionImpacts.map((ji, i) => (
                        <tr key={i} className="border-b border-border/10 hover:bg-muted/30 transition-colors h-8">
                          <td className="px-3 py-1 font-mono font-medium">{ji.jurisdiction}</td>
                          <td className="px-3 py-1 text-muted-foreground">{ji.lawType}</td>
                          <td className="px-3 py-1">
                            <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                              ji.complianceStatus === "compliant" ? "text-emerald-600 bg-emerald-500/10" :
                                ji.complianceStatus === "partial" ? "text-amber-600 bg-amber-500/10" :
                                  "text-red-600 bg-red-500/10"
                            )}>
                              {ji.complianceStatus}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-right font-mono text-[11px]">
                            <span className={ji.scorePenalty < 0 ? "text-red-500" : "text-muted-foreground"}>
                              {ji.scorePenalty}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-right font-mono text-[11px]">{ji.multiplierImpact}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remediation Roadmap */}
              {remediation.length > 0 && (
                <div className="rounded-md border border-border/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-medium">Remediation Roadmap</span>
                    <div className="text-[11px] text-muted-foreground">
                      Projected MRS: <span className="font-mono font-semibold text-emerald-500">{projectedMRS}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {remediation.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-[12px]">
                        <span className="font-mono text-[10px] text-muted-foreground w-4 shrink-0">#{item.priority}</span>
                        <span className="flex-1">{item.action}</span>
                        <span className="font-mono text-emerald-500 text-[11px]">+{item.estimatedImprovement} pts</span>
                        <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                          item.effort === "Low" ? "text-emerald-600 bg-emerald-500/10" :
                            item.effort === "Medium" ? "text-amber-600 bg-amber-500/10" :
                              "text-red-600 bg-red-500/10"
                        )}>{item.effort}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="h-6 text-[10px] mt-3" onClick={() => toast.success(`Projected MRS: ${projectedMRS} (${selectedModel.riskClass} → ${projectedMRS >= 90 ? "Low" : projectedMRS >= 80 ? "Moderate" : "Guarded"})`)}>
                    Apply All Remediations
                  </Button>
                </div>
              )}

              {/* Score History */}
              <div className="rounded-md border border-border/40">
                <div className="px-3 py-2 border-b border-border/30 text-[13px] font-medium">Score History</div>
                <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
                  <table className="w-full text-[11px]">
                    <thead className="sticky top-0 bg-background">
                      <tr className="text-muted-foreground text-left border-b border-border/20">
                        <th className="px-3 py-1 font-medium">Date</th>
                        <th className="px-3 py-1 font-medium text-right">Old</th>
                        <th className="px-3 py-1 font-medium"></th>
                        <th className="px-3 py-1 font-medium text-right">New</th>
                        <th className="px-3 py-1 font-medium">Reason</th>
                        <th className="px-3 py-1 font-medium">Triggered By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedModel.scoreHistory.map((change, i) => (
                        <tr key={i} className="border-b border-border/10 hover:bg-muted/20">
                          <td className="px-3 py-1 font-mono">{change.date}</td>
                          <td className="px-3 py-1 text-right font-mono">{change.oldScore}</td>
                          <td className="px-3 py-1 text-center"><ArrowRight className="h-3 w-3 text-muted-foreground inline" /></td>
                          <td className="px-3 py-1 text-right font-mono font-medium">{change.newScore}</td>
                          <td className="px-3 py-1 text-muted-foreground">{change.reason}</td>
                          <td className="px-3 py-1 text-muted-foreground">{change.triggeredBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Premium Calculator */}
              <div className="rounded-md border border-border/40 p-3">
                <div className="text-[13px] font-medium mb-2">Premium Calculator</div>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Policy Limit ($)</label>
                    <input type="number" value={premLimit} onChange={(e) => setPremLimit(Number(e.target.value))} className="w-32 rounded-md border border-border/60 px-2 py-1 text-[12px] font-mono bg-background block mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Base Rate (%)</label>
                    <input type="number" value={premRate} step={0.1} onChange={(e) => setPremRate(Number(e.target.value))} className="w-20 rounded-md border border-border/60 px-2 py-1 text-[12px] font-mono bg-background block mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Jurisdiction</label>
                    <select value={premJurisdiction} onChange={(e) => setPremJurisdiction(e.target.value)} className="rounded-md border border-border/60 px-2 py-1 text-[12px] bg-background block mt-0.5">
                      {["NY", "CA", "TX", "FL", "IL", "MA", "TN", "WA"].map((j) => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">MRS</label>
                    <input type="number" value={selectedModel.finalMRS} readOnly className="w-16 rounded-md border border-border/60 px-2 py-1 text-[12px] font-mono bg-muted/50 block mt-0.5" />
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={runPremiumCalc}>Generate Quote</Button>
                </div>
                {premResult && (
                  <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-4 text-[12px]">
                    <div><span className="text-muted-foreground">Premium:</span> <span className="font-mono font-semibold">${premResult.premium.toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Deductible:</span> <span className="font-mono font-semibold">{premResult.deductible !== null ? `$${premResult.deductible.toLocaleString()}` : "N/A"}</span></div>
                    <div><span className="text-muted-foreground">Max Capacity:</span> <span className="font-mono font-semibold">${premResult.maxCapacity.toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Risk Class:</span> <span className="font-medium" style={{ color: riskClassColors[premResult.riskClass] }}>{premResult.riskClass}</span></div>
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground mt-2 font-mono">
                  Premium = Limit x BaseRate x RiskMultiplier({selectedModel.premiumMultiplier}x) x JurisdictionMultiplier
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
              Select a model from the list to view scores
            </div>
          )}
        </div>
      </div>

      {/* Score Leaderboard (collapsible) */}
      <details className="rounded-md border border-border/40">
        <summary className="px-3 py-2 text-[13px] font-medium cursor-pointer hover:bg-muted/30 transition-colors">
          Score Leaderboard
        </summary>
        <div className="border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
          <div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Top 10 Best Scored</div>
            <table className="w-full text-[11px]">
              <tbody>
                {sortedBest.map((m) => (
                  <tr key={m.modelId} className="border-b border-border/10 hover:bg-muted/20 cursor-pointer" onClick={() => selectModel(m)}>
                    <td className="py-1 pr-2">{m.modelName}</td>
                    <td className="py-1 pr-2 text-right font-mono font-medium">{m.finalMRS}</td>
                    <td className="py-1"><span className="inline-flex items-center rounded-full px-1 py-0.5 text-[9px] font-medium" style={{ color: riskClassColors[m.riskClass], backgroundColor: `${riskClassColors[m.riskClass]}15` }}>{m.riskClass}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Top 10 Worst Scored</div>
            <table className="w-full text-[11px]">
              <tbody>
                {sortedWorst.map((m) => (
                  <tr key={m.modelId} className="border-b border-border/10 hover:bg-muted/20 cursor-pointer" onClick={() => selectModel(m)}>
                    <td className="py-1 pr-2">{m.modelName}</td>
                    <td className="py-1 pr-2 text-right font-mono font-medium">{m.finalMRS}</td>
                    <td className="py-1"><span className="inline-flex items-center rounded-full px-1 py-0.5 text-[9px] font-medium" style={{ color: riskClassColors[m.riskClass], backgroundColor: `${riskClassColors[m.riskClass]}15` }}>{m.riskClass}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </ComplianceLayout>
  )
}
