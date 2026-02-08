"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import { ComplianceLayout } from "@/components/compliance/ComplianceLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Tag, ExternalLink, ScanSearch } from "lucide-react"
import { getAssetProfiles } from "@/lib/compliance/api"
import type { AssetProfile, AssetOrigin } from "@/types/compliance"
import { toast } from "sonner"
import Link from "next/link"

const originColors: Record<AssetOrigin, string> = {
  HUMAN: "text-emerald-600 bg-emerald-500/10",
  AI: "text-purple-600 bg-purple-500/10",
  HYBRID: "text-blue-600 bg-blue-500/10",
}

const riskColors: Record<string, string> = {
  Low: "text-emerald-600 bg-emerald-500/10",
  Medium: "text-amber-600 bg-amber-500/10",
  High: "text-orange-600 bg-orange-500/10",
  Critical: "text-red-600 bg-red-500/10",
}

export default function KYAProfilerPage() {
  const [profiles, setProfiles] = useState<AssetProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOrigin, setFilterOrigin] = useState<AssetOrigin | null>(null)
  const [filterRisk, setFilterRisk] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [queueOpen, setQueueOpen] = useState(true)
  const [page, setPage] = useState(0)
  const perPage = 25

  useEffect(() => {
    setLoading(true)
    getAssetProfiles({
      search: searchQuery || undefined,
      origin: filterOrigin || undefined,
      riskLevel: filterRisk as AssetProfile["riskLevel"] | undefined,
    })
      .then(setProfiles)
      .finally(() => setLoading(false))
  }, [searchQuery, filterOrigin, filterRisk])

  const pendingAssets = useMemo(() => profiles.filter((p) => p.status === "pending"), [profiles])
  const classifiedProfiles = useMemo(() => profiles.filter((p) => p.status !== "pending"), [profiles])
  const paginatedProfiles = classifiedProfiles.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(classifiedProfiles.length / perPage)

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === paginatedProfiles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedProfiles.map((p) => p.id)))
    }
  }

  return (
    <ComplianceLayout title="KYA Asset Profiler">
      {/* Classification Queue */}
      {pendingAssets.length > 0 && (
        <div className="rounded-md border border-border/40">
          <button
            type="button"
            onClick={() => setQueueOpen(!queueOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ScanSearch className="h-3.5 w-3.5" />
              Classification Queue
              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-600">{pendingAssets.length}</span>
            </span>
            {queueOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {queueOpen && (
            <div className="border-t border-border/30 p-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pendingAssets.map((asset) => (
                  <div key={asset.id} className="shrink-0 w-48 rounded-md border border-border/40 p-2.5">
                    <div className="h-16 rounded bg-muted/50 flex items-center justify-center text-[10px] text-muted-foreground mb-2">
                      {asset.contentType}
                    </div>
                    <div className="text-[12px] font-medium truncate">{asset.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(asset.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    <div className="flex gap-1 mt-2">
                      <Button variant="outline" size="sm" className="h-5 px-1.5 text-[9px] flex-1" onClick={() => toast.success(`${asset.name} classified`)}>
                        Classify
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px]" onClick={() => toast.info("Skipped")}>
                        Skip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
            className="rounded-md border border-border/60 pl-7 pr-3 py-1.5 text-[12px] bg-background placeholder:text-muted-foreground w-48"
          />
        </div>

        {/* Origin filters */}
        {(["HUMAN", "AI", "HYBRID"] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setFilterOrigin(filterOrigin === o ? null : o)}
            className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors", filterOrigin === o ? originColors[o] : "text-muted-foreground hover:bg-muted/50")}
          >
            {o}
          </button>
        ))}

        <div className="w-px h-4 bg-border/40" />

        {/* Risk filters */}
        {(["Low", "Medium", "High", "Critical"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFilterRisk(filterRisk === r ? null : r)}
            className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors", filterRisk === r ? riskColors[r] : "text-muted-foreground hover:bg-muted/50")}
          >
            {r}
          </button>
        ))}

        {selectedIds.size > 0 && (
          <>
            <div className="flex-1" />
            <span className="text-[11px] text-muted-foreground">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => toast.success(`Reclassified ${selectedIds.size} assets`)}>Reclassify</Button>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => toast.info(`Flagged ${selectedIds.size} assets`)}>Flag</Button>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => toast.success("Exported")}>Export</Button>
          </>
        )}
      </div>

      {/* Asset Library Table */}
      <div className="rounded-md border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-border/30">
                <th className="px-3 py-1.5 font-medium w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedProfiles.length && paginatedProfiles.length > 0}
                    onChange={selectAll}
                    className="h-3 w-3 rounded"
                  />
                </th>
                <th className="px-3 py-1.5 font-medium">Asset ID</th>
                <th className="px-3 py-1.5 font-medium">Name</th>
                <th className="px-3 py-1.5 font-medium">Origin</th>
                <th className="px-3 py-1.5 font-medium text-right">Confidence</th>
                <th className="px-3 py-1.5 font-medium">Intended Use</th>
                <th className="px-3 py-1.5 font-medium">Jurisdictions</th>
                <th className="px-3 py-1.5 font-medium">Risk</th>
                <th className="px-3 py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-3 py-2"><div className="h-4 bg-muted/50 rounded animate-pulse" /></td></tr>
                ))
              ) : paginatedProfiles.map((profile) => (
                <Fragment key={profile.id}>
                  <tr
                    className={cn("border-b border-border/10 hover:bg-muted/30 transition-colors cursor-pointer h-8", expandedRow === profile.id && "bg-muted/20")}
                    onClick={() => setExpandedRow(expandedRow === profile.id ? null : profile.id)}
                  >
                    <td className="px-3 py-1" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(profile.id)} onChange={() => toggleSelect(profile.id)} className="h-3 w-3 rounded" />
                    </td>
                    <td className="px-3 py-1 font-mono text-[11px]">{profile.assetId}</td>
                    <td className="px-3 py-1 font-medium truncate max-w-[160px]">{profile.name}</td>
                    <td className="px-3 py-1">
                      <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", originColors[profile.origin])}>{profile.origin}</span>
                    </td>
                    <td className="px-3 py-1 text-right font-mono text-[11px]">{profile.classificationConfidence}%</td>
                    <td className="px-3 py-1 text-muted-foreground truncate max-w-[100px]">{profile.intendedUse}</td>
                    <td className="px-3 py-1">
                      <div className="flex gap-0.5">
                        {profile.jurisdictions.map((j) => (
                          <span key={j} className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">{j}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-1">
                      <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", riskColors[profile.riskLevel])}>{profile.riskLevel}</span>
                    </td>
                    <td className="px-3 py-1">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        profile.status === "classified" ? "text-emerald-600 bg-emerald-500/10" :
                          profile.status === "flagged" ? "text-orange-600 bg-orange-500/10" :
                            profile.status === "rejected" ? "text-red-600 bg-red-500/10" :
                              "text-amber-600 bg-amber-500/10"
                      )}>
                        {profile.status}
                      </span>
                    </td>
                  </tr>
                  {/* Expanded detail */}
                  {expandedRow === profile.id && (
                    <tr className="bg-muted/10">
                      <td colSpan={9} className="px-6 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                          <div>
                            <div className="text-muted-foreground uppercase tracking-wider mb-1 text-[10px]">Classification</div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", originColors[profile.origin])}>{profile.origin}</span>
                              <span className="font-mono">{profile.classificationConfidence}% confidence</span>
                            </div>
                            {profile.aiTool && <div className="text-muted-foreground">Tool: <span className="text-foreground">{profile.aiTool}</span></div>}
                            {profile.modelUsed && <div className="text-muted-foreground">Model: <span className="text-foreground">{profile.modelUsed}</span></div>}
                            <div className="text-muted-foreground">Audience: <span className="text-foreground">{profile.audience}</span></div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase tracking-wider mb-1 text-[10px]">Jurisdictional Risk</div>
                            {profile.jurisdictions.map((j) => (
                              <div key={j} className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-medium">{j}</span>
                                <span className="text-muted-foreground">—</span>
                                <Link href={`/compliance/jurisdictions`} className="hover:underline text-foreground">{j === "NY" ? "High enforcement" : j === "CA" ? "Very high enforcement" : "Moderate"}</Link>
                              </div>
                            ))}
                            <div className="mt-2">
                              <Link href={`/compliance/alcar`} className="text-foreground hover:underline flex items-center gap-1">
                                <Tag className="h-3 w-3" /> ALCAR: {profile.linkedConsentIds.length} consent records
                              </Link>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase tracking-wider mb-1 text-[10px]">Context</div>
                            {profile.projectName && (
                              <Link href={`/projects/${profile.projectId}`} className="text-foreground hover:underline flex items-center gap-1 mb-1">
                                <ExternalLink className="h-3 w-3" /> {profile.projectName}
                              </Link>
                            )}
                            {profile.provenanceScoreId && (
                              <Link href={`/compliance/scoring`} className="text-foreground hover:underline flex items-center gap-1">
                                Provenance Score &rarr;
                              </Link>
                            )}
                            {profile.alerts.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {profile.alerts.map((a) => (
                                  <div key={a.id} className="flex items-center gap-1.5 text-[10px]">
                                    <AlertTriangle className={cn("h-3 w-3", a.severity === "critical" ? "text-red-500" : "text-orange-500")} />
                                    <span className="text-muted-foreground">{a.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/20 text-[11px] text-muted-foreground">
            <span>{page * perPage + 1}-{Math.min((page + 1) * perPage, classifiedProfiles.length)} of {classifiedProfiles.length}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Alerts Stream */}
      <div className="rounded-md border border-border/40 p-3">
        <div className="text-[13px] font-medium mb-2">Real-Time Compliance Alerts</div>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {profiles.flatMap((p) => p.alerts).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10).map((alert) => (
            <div key={alert.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors text-[11px]">
              <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0", alert.severity === "critical" ? "text-red-500" : alert.severity === "high" ? "text-orange-500" : "text-amber-500")} />
              <span className="flex-1 text-muted-foreground">{alert.message}</span>
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                {new Date(alert.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ComplianceLayout>
  )
}
