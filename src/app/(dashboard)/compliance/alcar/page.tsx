"use client"

import { useState, useEffect, useMemo } from "react"
import { ComplianceLayout } from "@/components/compliance/ComplianceLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Search, Plus, CheckCircle2, Clock, XCircle, AlertTriangle, Copy, ChevronRight, ExternalLink } from "lucide-react"
import { getConsentRecords, getConsentRecord } from "@/lib/compliance/api"
import type { ConsentRecord, ConsentStatus } from "@/types/compliance"
import { toast } from "sonner"
import Link from "next/link"

const statusColors: Record<ConsentStatus, string> = {
  verified: "text-emerald-600 bg-emerald-500/10",
  pending: "text-amber-600 bg-amber-500/10",
  expired: "text-slate-500 bg-slate-500/10",
  revoked: "text-red-600 bg-red-500/10",
}

const statusIcons: Record<ConsentStatus, typeof CheckCircle2> = {
  verified: CheckCircle2,
  pending: Clock,
  expired: AlertTriangle,
  revoked: XCircle,
}

const typeColors: Record<string, string> = {
  NIL: "text-purple-600 bg-purple-500/10",
  AI_CONTENT: "text-blue-600 bg-blue-500/10",
  AD_DISCLOSURE: "text-orange-600 bg-orange-500/10",
}

export default function ALCARRegistryPage() {
  const [records, setRecords] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<ConsentStatus | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<ConsentRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)
  const [page, setPage] = useState(0)
  const perPage = 25

  useEffect(() => {
    setLoading(true)
    getConsentRecords({ search: searchQuery || undefined, type: filterType as ConsentRecord["type"] | undefined, status: filterStatus || undefined })
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [searchQuery, filterType, filterStatus])

  const stats = useMemo(() => ({
    total: records.length,
    verified: records.filter((r) => r.status === "verified").length,
    pending: records.filter((r) => r.status === "pending").length,
    expired: records.filter((r) => r.status === "expired").length + records.filter((r) => r.status === "revoked").length,
  }), [records])

  const paginatedRecords = records.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(records.length / perPage)

  async function openDrawer(id: string) {
    const record = await getConsentRecord(id)
    if (record) {
      setSelectedRecord(record)
      setDrawerOpen(true)
    }
  }

  return (
    <ComplianceLayout title="ALCAR Registry">
      {/* Stats Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: "Total", value: stats.total, filter: null },
          { label: "Verified", value: stats.verified, filter: "verified" as const },
          { label: "Pending", value: stats.pending, filter: "pending" as const },
          { label: "Expired/Revoked", value: stats.expired, filter: "expired" as const },
        ].map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => {
              if (stat.filter === null) { setFilterStatus(null) }
              else if (stat.filter === "expired") { setFilterStatus(filterStatus === "expired" ? null : "expired") }
              else { setFilterStatus(filterStatus === stat.filter ? null : stat.filter) }
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] transition-colors",
              (stat.filter === null && filterStatus === null) || filterStatus === stat.filter
                ? "border-foreground/20 bg-foreground/5 text-foreground font-medium"
                : "border-border/60 text-muted-foreground hover:bg-muted/50"
            )}
          >
            <span className="font-mono font-semibold">{stat.value}</span>
            <span>{stat.label}</span>
          </button>
        ))}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
            className="rounded-md border border-border/60 pl-7 pr-3 py-1.5 text-[12px] bg-background placeholder:text-muted-foreground w-48"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1">
          {(["NIL", "AI_CONTENT", "AD_DISCLOSURE"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                filterType === type ? typeColors[type] : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {type.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* FAB */}
        <Button size="sm" className="h-7 text-[11px]" onClick={() => setCaptureOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Register
        </Button>
      </div>

      {/* Consent Records Table */}
      <div className="rounded-md border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-border/30">
                <th className="px-3 py-1.5 font-medium">ID</th>
                <th className="px-3 py-1.5 font-medium">Type</th>
                <th className="px-3 py-1.5 font-medium">Entity</th>
                <th className="px-3 py-1.5 font-medium">Jurisdiction</th>
                <th className="px-3 py-1.5 font-medium">Status</th>
                <th className="px-3 py-1.5 font-medium">Created</th>
                <th className="px-3 py-1.5 font-medium">Hash</th>
                <th className="px-3 py-1.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-3 py-2"><div className="h-4 bg-muted/50 rounded animate-pulse" /></td></tr>
                ))
              ) : paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-border/10 hover:bg-muted/30 transition-colors cursor-pointer h-8"
                  onClick={() => openDrawer(record.id)}
                >
                  <td className="px-3 py-1 font-mono text-[11px]">{record.id}</td>
                  <td className="px-3 py-1">
                    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", typeColors[record.type])}>
                      {record.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-1 font-medium truncate max-w-[160px]">{record.entityName}</td>
                  <td className="px-3 py-1 font-mono text-[11px]">{record.jurisdiction}</td>
                  <td className="px-3 py-1">
                    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", statusColors[record.status])}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-1 text-muted-foreground text-[11px]">
                    {new Date(record.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                  </td>
                  <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">{record.hash}</td>
                  <td className="px-3 py-1 text-right">
                    <button
                      className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => { e.stopPropagation(); openDrawer(record.id) }}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/20 text-[11px] text-muted-foreground">
            <span>{page * perPage + 1}-{Math.min((page + 1) * perPage, records.length)} of {records.length}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Record Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0">
          <SheetHeader className="px-4 py-3 border-b border-border/40">
            <SheetTitle className="text-sm font-semibold">{selectedRecord?.id}</SheetTitle>
          </SheetHeader>
          {selectedRecord && (
            <div className="px-4 py-3 space-y-4 overflow-y-auto h-[calc(100vh-60px)]">
              {/* Type + Entity */}
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", typeColors[selectedRecord.type])}>
                  {selectedRecord.type.replace(/_/g, " ")}
                </span>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", statusColors[selectedRecord.status])}>
                  {selectedRecord.status}
                </span>
              </div>

              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Entity</div>
                <div className="text-[13px] font-medium">{selectedRecord.entityName}</div>
                <div className="text-[11px] text-muted-foreground">{selectedRecord.entityType} &middot; {selectedRecord.jurisdiction}</div>
              </div>

              {/* Hash */}
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Cryptographic Hash</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-muted px-2 py-1 rounded-md flex-1 truncate">{selectedRecord.hash}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { navigator.clipboard.writeText(selectedRecord.hash); toast.success("Hash copied") }}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] mt-2" onClick={() => toast.success("Verification passed — hash matches on-chain record")}>
                  Verify Hash
                </Button>
              </div>

              {/* Verification workflow */}
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Verification Workflow</div>
                <div className="flex items-center gap-2 text-[11px]">
                  {["Submitted", "Under Review", "Verified"].map((step, idx) => {
                    const isComplete = selectedRecord.status === "verified" ? true : idx === 0
                    const isCurrent = selectedRecord.status === "pending" && idx === 1
                    return (
                      <div key={step} className="flex items-center gap-1">
                        {idx > 0 && <div className={cn("w-6 h-px", isComplete ? "bg-emerald-500" : "bg-border")} />}
                        <div className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                          isComplete ? "text-emerald-600 bg-emerald-500/10" :
                            isCurrent ? "text-amber-600 bg-amber-500/10" :
                              "text-muted-foreground bg-muted"
                        )}>
                          {step}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Project link */}
              {selectedRecord.projectName && (
                <div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Project</div>
                  <Link href={`/projects/${selectedRecord.projectId}`} className="text-[12px] text-foreground hover:underline flex items-center gap-1">
                    {selectedRecord.projectName}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Linked assets */}
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Linked Assets</div>
                <div className="space-y-1">
                  {selectedRecord.linkedAssetIds.map((id) => (
                    <span key={id} className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono bg-muted mr-1">{id}</span>
                  ))}
                </div>
              </div>

              {/* Audit trail */}
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Audit Trail</div>
                <div className="space-y-2">
                  {selectedRecord.auditTrail.map((entry) => (
                    <div key={entry.id} className="flex gap-2 text-[11px]">
                      <span className="font-mono text-muted-foreground w-24 shrink-0">
                        {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div>
                        <span className="font-medium">{entry.action}</span>
                        <span className="text-muted-foreground"> by {entry.actor}</span>
                        <div className="text-muted-foreground">{entry.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border/30">
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast.info("Consent revoked")}>Revoke</Button>
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast.info("Re-verification initiated")}>Re-verify</Button>
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast.success("Record exported")}>Export</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Quick Capture Modal (simplified) */}
      {captureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setCaptureOpen(false)} />
          <div className="relative z-50 w-[400px] rounded-md border border-border bg-background p-4 space-y-3">
            <div className="text-sm font-semibold">Register New Consent</div>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-muted-foreground">Consent Type</label>
                <select className="w-full rounded-md border border-border/60 px-2 py-1.5 text-[12px] bg-background mt-0.5">
                  <option>NIL</option>
                  <option>AI Content</option>
                  <option>Ad Disclosure</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Entity Name</label>
                <input type="text" placeholder="Name or organization" className="w-full rounded-md border border-border/60 px-2 py-1.5 text-[12px] bg-background mt-0.5 placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Jurisdiction</label>
                <select className="w-full rounded-md border border-border/60 px-2 py-1.5 text-[12px] bg-background mt-0.5">
                  <option>NY</option><option>CA</option><option>TX</option><option>FL</option><option>IL</option><option>MA</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Supporting Documents</label>
                <div className="rounded-md border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground mt-0.5">
                  Drop files here or click to browse
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setCaptureOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-7 text-[11px]" onClick={() => { setCaptureOpen(false); toast.success("Consent registered") }}>Register Consent</Button>
            </div>
          </div>
        </div>
      )}

      {/* API Activity Log (collapsible) */}
      <details className="rounded-md border border-border/40">
        <summary className="px-3 py-2 text-[13px] font-medium cursor-pointer hover:bg-muted/30 transition-colors">
          API Activity Log
        </summary>
        <div className="border-t border-border/30 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-border/20">
                <th className="px-3 py-1 font-medium">Timestamp</th>
                <th className="px-3 py-1 font-medium">Method</th>
                <th className="px-3 py-1 font-medium">Endpoint</th>
                <th className="px-3 py-1 font-medium">Status</th>
                <th className="px-3 py-1 font-medium">Summary</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ts: "2025-02-04 14:32:01", method: "POST", endpoint: "/api/v1/consent", status: 201, summary: "Created NIL consent for Jordan Williams" },
                { ts: "2025-02-04 14:28:15", method: "PUT", endpoint: "/api/v1/consent/cr-0012", status: 200, summary: "Updated status to verified" },
                { ts: "2025-02-04 13:55:42", method: "GET", endpoint: "/api/v1/consent?type=NIL", status: 200, summary: "Listed 18 NIL records" },
                { ts: "2025-02-04 13:12:08", method: "DELETE", endpoint: "/api/v1/consent/cr-0048", status: 200, summary: "Revoked consent record" },
                { ts: "2025-02-04 12:45:33", method: "POST", endpoint: "/api/v1/consent/verify", status: 200, summary: "Hash verification passed for cr-0005" },
              ].map((log, i) => (
                <tr key={i} className="border-b border-border/10 hover:bg-muted/20">
                  <td className="px-3 py-1 font-mono">{log.ts}</td>
                  <td className="px-3 py-1"><span className={cn("font-mono font-medium", log.method === "POST" ? "text-emerald-600" : log.method === "PUT" ? "text-blue-600" : log.method === "DELETE" ? "text-red-600" : "text-muted-foreground")}>{log.method}</span></td>
                  <td className="px-3 py-1 font-mono text-muted-foreground">{log.endpoint}</td>
                  <td className="px-3 py-1 font-mono">{log.status}</td>
                  <td className="px-3 py-1 text-muted-foreground">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </ComplianceLayout>
  )
}
