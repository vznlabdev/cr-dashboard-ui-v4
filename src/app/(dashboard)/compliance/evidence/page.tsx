"use client"

import { useState, useEffect, useMemo } from "react"
import { ComplianceLayout } from "@/components/compliance/ComplianceLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Search, Download, Clock, Eye,
  Fingerprint, Globe, Database, Zap, ShieldCheck, MessageSquare, Cpu, FileText,
  CheckCircle2, AlertTriangle, XCircle,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { getEvidenceRecords, getEvidenceRecord } from "@/lib/compliance/api"
import type { EvidenceRecord, EvidenceCategoryKey, EvidenceCategoryData } from "@/types/compliance"
import { toast } from "sonner"
import Link from "next/link"

const categoryMeta: Record<EvidenceCategoryKey, { label: string; icon: typeof Fingerprint; short: string }> = {
  identity_posture: { label: "Identity & Device Posture", icon: Fingerprint, short: "Identity" },
  application_url: { label: "Application & URL Accessed", icon: Globe, short: "App/URL" },
  data_classification: { label: "Data Classification Context", icon: Database, short: "Data Class." },
  action_taken: { label: "Action Taken", icon: Zap, short: "Action" },
  policy_decision: { label: "Policy Decision Triggered", icon: ShieldCheck, short: "Policy" },
  prompt_metadata: { label: "Prompt Text + Output Metadata", icon: MessageSquare, short: "Prompt" },
  model_versioning: { label: "Model/Software Versioning", icon: Cpu, short: "Model Ver." },
  trace_logs: { label: "Retention & Trace Logs", icon: FileText, short: "Traces" },
}

const statusColors = { captured: "text-emerald-600", partial: "text-amber-600", missing: "text-red-500" }
const statusIcons = { captured: CheckCircle2, partial: AlertTriangle, missing: XCircle }

const incidentStatusColors: Record<string, string> = {
  open: "text-amber-600 bg-amber-500/10",
  resolved: "text-emerald-600 bg-emerald-500/10",
  escalated: "text-red-600 bg-red-500/10",
}

export default function EvidencePage() {
  const [records, setRecords] = useState<EvidenceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setLoading(true)
    getEvidenceRecords({ search: searchQuery || undefined })
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [searchQuery])

  const completenessChart = useMemo(() => {
    return records.map((r) => ({
      name: r.incidentId.split("-").pop(),
      completeness: r.completeness,
      fill: r.completeness >= 7 ? "#10b981" : r.completeness >= 5 ? "#f59e0b" : "#ef4444",
    }))
  }, [records])

  async function selectIncident(id: string) {
    const record = await getEvidenceRecord(id)
    if (record) setSelectedRecord(record)
  }

  const allCategories: EvidenceCategoryKey[] = [
    "identity_posture", "application_url", "data_classification", "action_taken",
    "policy_decision", "prompt_metadata", "model_versioning", "trace_logs",
  ]

  return (
    <ComplianceLayout title="Evidence">
      <div className="flex gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border/60 pl-7 pr-3 py-1.5 text-[12px] bg-background placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Incidents Table */}
          <div className="rounded-md border border-border/40">
            <div className="px-3 py-2 border-b border-border/30 text-[13px] font-medium">Incidents</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-muted-foreground text-left border-b border-border/20">
                    <th className="px-3 py-1.5 font-medium">Incident ID</th>
                    <th className="px-3 py-1.5 font-medium">Date</th>
                    <th className="px-3 py-1.5 font-medium">Asset / Model</th>
                    <th className="px-3 py-1.5 font-medium">Type</th>
                    <th className="px-3 py-1.5 font-medium">Completeness</th>
                    <th className="px-3 py-1.5 font-medium">Status</th>
                    <th className="px-3 py-1.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="px-3 py-2"><div className="h-4 bg-muted/50 rounded animate-pulse" /></td></tr>
                    ))
                  ) : records.map((record) => (
                    <tr
                      key={record.id}
                      className={cn("border-b border-border/10 hover:bg-muted/30 transition-colors cursor-pointer h-8", selectedRecord?.id === record.id && "bg-muted/20")}
                      onClick={() => selectIncident(record.id)}
                    >
                      <td className="px-3 py-1 font-mono text-[11px] font-medium">{record.incidentId}</td>
                      <td className="px-3 py-1 font-mono text-[11px] text-muted-foreground">
                        {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-3 py-1 truncate max-w-[140px]">{record.assetName || record.modelName || "—"}</td>
                      <td className="px-3 py-1 text-muted-foreground">{record.type}</td>
                      <td className="px-3 py-1">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${record.completenessPercent}%`, backgroundColor: record.completeness >= 7 ? "#10b981" : record.completeness >= 5 ? "#f59e0b" : "#ef4444" }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{record.completeness}/8</span>
                        </div>
                      </td>
                      <td className="px-3 py-1">
                        <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", incidentStatusColors[record.status])}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-3 py-1 text-right">
                        <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evidence Detail View */}
          {selectedRecord && (
            <>
              {/* View mode toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">Evidence: {selectedRecord.incidentId}</span>
                <div className="flex items-center gap-1 rounded-md border border-border/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn("px-2 py-0.5 rounded text-[11px] transition-colors", viewMode === "grid" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("timeline")}
                    className={cn("px-2 py-0.5 rounded text-[11px] transition-colors", viewMode === "timeline" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}
                  >
                    Timeline
                  </button>
                </div>
              </div>

              {viewMode === "grid" ? (
                /* 8-Category Evidence Grid */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {allCategories.map((cat) => {
                    const meta = categoryMeta[cat]
                    const data = selectedRecord.categories[cat]
                    const StatusIcon = statusIcons[data.status]
                    const Icon = meta.icon

                    return (
                      <details key={cat} className="rounded-md border border-border/40 group">
                        <summary className="px-2.5 py-2 cursor-pointer hover:bg-muted/30 transition-colors list-none">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-[11px] font-medium flex-1 truncate">{meta.short}</span>
                            <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", statusColors[data.status])} />
                          </div>
                          <div className={cn("text-[10px] mt-1", statusColors[data.status])}>
                            {data.status}
                          </div>
                        </summary>
                        <div className="px-2.5 pb-2 border-t border-border/20 pt-2 text-[10px] space-y-1">
                          {data.status === "missing" ? (
                            <span className="text-muted-foreground">No data captured for this category</span>
                          ) : (
                            Object.entries(data.data).map(([key, val]) => (
                              <div key={key} className="flex justify-between gap-2">
                                <span className="text-muted-foreground truncate">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                                <span className="font-mono text-foreground truncate max-w-[120px] text-right">{String(val)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>
              ) : (
                /* Timeline View */
                <div className="rounded-md border border-border/40 p-3">
                  <div className="space-y-3">
                    {selectedRecord.timeline.map((event) => {
                      const meta = event.category !== "general" ? categoryMeta[event.category as EvidenceCategoryKey] : null
                      return (
                        <div key={event.id} className="flex gap-3 text-[11px]">
                          <div className="w-2 flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-foreground/30 mt-1" />
                            <div className="flex-1 w-px bg-border/40" />
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                              {meta && (
                                <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground">
                                  {meta.short}
                                </span>
                              )}
                            </div>
                            <div className="font-medium mt-0.5">{event.action}</div>
                            <div className="text-muted-foreground">{event.detail}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Export Panel */}
              <div className="rounded-md border border-border/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium">Export Dispute Package</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedRecord.incidentId} &middot; {selectedRecord.completeness}/8 categories captured &middot; {selectedRecord.completenessPercent}% complete
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast.success("PDF report generated")}>
                      <Download className="h-3.5 w-3.5 mr-1" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast.success("JSON exported")}>
                      <Download className="h-3.5 w-3.5 mr-1" /> JSON
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast.success("CSV exported")}>
                      <Download className="h-3.5 w-3.5 mr-1" /> CSV
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right sidebar: Completeness Dashboard */}
        <div className="w-52 shrink-0 space-y-3 hidden lg:block">
          <div className="rounded-md border border-border/40 p-3">
            <div className="text-[12px] font-medium mb-2">Completeness Overview</div>
            {selectedRecord ? (
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-2xl font-mono font-bold">{selectedRecord.completeness}/8</span>
                  <div className="text-[10px] text-muted-foreground">{selectedRecord.completenessPercent}% complete</div>
                </div>
                <div className="space-y-1">
                  {allCategories.map((cat) => {
                    const meta = categoryMeta[cat]
                    const data = selectedRecord.categories[cat]
                    const StatusIcon = statusIcons[data.status]
                    return (
                      <div key={cat} className="flex items-center gap-1.5 text-[10px]">
                        <StatusIcon className={cn("h-3 w-3 shrink-0", statusColors[data.status])} />
                        <span className="truncate">{meta.short}</span>
                      </div>
                    )
                  })}
                </div>
                {selectedRecord.completeness < 8 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <div className="text-[10px] font-medium text-amber-600 mb-1">Missing Evidence</div>
                    {allCategories.filter((c) => selectedRecord.categories[c].status === "missing").map((cat) => (
                      <div key={cat} className="text-[10px] text-muted-foreground">- {categoryMeta[cat].label}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground">Select an incident</div>
            )}
          </div>

          {/* Cross-incident comparison */}
          <div className="rounded-md border border-border/40 p-3">
            <div className="text-[12px] font-medium mb-2">Comparison</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={completenessChart} barSize={12}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-muted-foreground, #64748b)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 8]} hide />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-background, #fff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "6px", fontSize: "11px" }} formatter={(v: number) => [`${v}/8`, "Evidence"]} />
                <Bar dataKey="completeness" radius={[2, 2, 0, 0]}>
                  {completenessChart.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ComplianceLayout>
  )
}
