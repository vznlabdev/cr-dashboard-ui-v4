"use client"

import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, Download, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  category: 'asset' | 'workflow' | 'compliance' | 'team' | 'system' | 'auth' | 'extension'
  target: string
  details: string
  severity: 'info' | 'warning' | 'critical'
  ip?: string
}

const now = Date.now()
const MOCK_AUDIT_LOGS: AuditEntry[] = [
  { id: 'log-1', timestamp: new Date(now - 1000 * 60 * 5).toISOString(), actor: 'Sarah Chen', action: 'asset.upload', category: 'asset', target: 'hero-banner-summer-v3.png', details: 'Uploaded output from Midjourney workflow step', severity: 'info' },
  { id: 'log-2', timestamp: new Date(now - 1000 * 60 * 12).toISOString(), actor: 'System', action: 'compliance.copyright_check', category: 'compliance', target: 'Social Banner v2', details: 'Flagged with 62% similarity score', severity: 'warning' },
  { id: 'log-3', timestamp: new Date(now - 1000 * 60 * 25).toISOString(), actor: 'Emily Park', action: 'asset.approve', category: 'asset', target: 'Homepage Banner v3', details: 'Approved with quality score 9.2/10', severity: 'info' },
  { id: 'log-4', timestamp: new Date(now - 1000 * 60 * 45).toISOString(), actor: 'Mike Johnson', action: 'workflow.step_complete', category: 'workflow', target: 'Product Launch Video', details: 'Completed step 3 of 5: Script & Voice', severity: 'info' },
  { id: 'log-5', timestamp: new Date(now - 1000 * 60 * 60).toISOString(), actor: 'System', action: 'extension.session_start', category: 'extension', target: 'Midjourney', details: 'Browser extension started tracking session ext-sid-f83a', severity: 'info' },
  { id: 'log-6', timestamp: new Date(now - 1000 * 60 * 90).toISOString(), actor: 'Admin', action: 'team.role_change', category: 'team', target: 'James Wilson', details: 'Role changed from Creator to Senior Creator', severity: 'info' },
  { id: 'log-7', timestamp: new Date(now - 1000 * 60 * 120).toISOString(), actor: 'System', action: 'compliance.provenance_gap', category: 'compliance', target: 'email-header-design.png', details: 'Missing training data documentation', severity: 'warning' },
  { id: 'log-8', timestamp: new Date(now - 1000 * 60 * 180).toISOString(), actor: 'Sarah Chen', action: 'asset.reject', category: 'asset', target: 'Newsletter Template v1', details: 'Rejected — brand inconsistency in color palette', severity: 'warning' },
  { id: 'log-9', timestamp: new Date(now - 1000 * 60 * 240).toISOString(), actor: 'System', action: 'auth.login', category: 'auth', target: 'Mike Johnson', details: 'Login from 192.168.1.42 (Austin, TX)', severity: 'info', ip: '192.168.1.42' },
  { id: 'log-10', timestamp: new Date(now - 1000 * 60 * 300).toISOString(), actor: 'System', action: 'compliance.aclar_update', category: 'compliance', target: 'Acme Corporation', details: "ACLAR Liability score dropped to 88% — 3 assets need consent records", severity: 'critical' },
  { id: 'log-11', timestamp: new Date(now - 1000 * 60 * 360).toISOString(), actor: 'Emily Park', action: 'workflow.start', category: 'workflow', target: 'Instagram Story Pack', details: 'Started Social Media Image Pack workflow', severity: 'info' },
  { id: 'log-12', timestamp: new Date(now - 1000 * 60 * 420).toISOString(), actor: 'System', action: 'extension.capture_miss', category: 'extension', target: 'Stable Diffusion', details: '3 generations not captured — unsupported UI change', severity: 'warning' },
  { id: 'log-13', timestamp: new Date(now - 1000 * 60 * 500).toISOString(), actor: 'Admin', action: 'system.settings_change', category: 'system', target: 'Approval Workflow', details: 'Changed minimum review score from 7.0 to 7.5', severity: 'info' },
  { id: 'log-14', timestamp: new Date(now - 1000 * 60 * 600).toISOString(), actor: 'James Wilson', action: 'asset.version_create', category: 'asset', target: 'Podcast Cover Art', details: 'Created version 3 from Midjourney generation', severity: 'info' },
  { id: 'log-15', timestamp: new Date(now - 1000 * 60 * 720).toISOString(), actor: 'System', action: 'compliance.evidence_export', category: 'compliance', target: 'Summer Campaign 2024', details: "Evidence package exported for Lloyd's Syndicate 1234", severity: 'info' },
  { id: 'log-16', timestamp: new Date(now - 1000 * 60 * 840).toISOString(), actor: 'Mike Johnson', action: 'asset.upload', category: 'asset', target: 'product-launch-intro.mp4', details: 'Uploaded from Runway workflow step', severity: 'info' },
  { id: 'log-17', timestamp: new Date(now - 1000 * 60 * 960).toISOString(), actor: 'System', action: 'auth.login_failed', category: 'auth', target: 'unknown@example.com', details: 'Failed login attempt from 203.0.113.42', severity: 'critical', ip: '203.0.113.42' },
  { id: 'log-18', timestamp: new Date(now - 1000 * 60 * 1100).toISOString(), actor: 'Sarah Chen', action: 'workflow.step_complete', category: 'workflow', target: 'Holiday Sale Banner', details: 'Completed step 1 of 3: Character Design', severity: 'info' },
  { id: 'log-19', timestamp: new Date(now - 1000 * 60 * 1300).toISOString(), actor: 'Admin', action: 'team.invite', category: 'team', target: 'newuser@acme.com', details: 'Invited as Creator role', severity: 'info' },
  { id: 'log-20', timestamp: new Date(now - 1000 * 60 * 1500).toISOString(), actor: 'System', action: 'system.backup', category: 'system', target: 'Platform', details: 'Automated daily backup completed — 4.2GB', severity: 'info' },
  { id: 'log-21', timestamp: new Date(now - 1000 * 60 * 1650).toISOString(), actor: 'James Wilson', action: 'asset.delete', category: 'asset', target: 'old-draft-v1.png', details: 'Deleted unused draft asset', severity: 'info' },
  { id: 'log-22', timestamp: new Date(now - 1000 * 60 * 1900).toISOString(), actor: 'Mike Johnson', action: 'workflow.abandon', category: 'workflow', target: 'Abandoned Video Draft', details: 'Workflow paused — no activity 7 days', severity: 'warning' },
  { id: 'log-23', timestamp: new Date(now - 1000 * 60 * 2100).toISOString(), actor: 'System', action: 'system.extension_update', category: 'system', target: 'Browser Extension', details: 'Updated to v2.4.1 — improved Midjourney capture', severity: 'info' },
  { id: 'log-24', timestamp: new Date(now - 1000 * 60 * 2400).toISOString(), actor: 'Emily Park', action: 'auth.password_change', category: 'auth', target: 'Emily Park', details: 'Password changed successfully', severity: 'info' },
  { id: 'log-25', timestamp: new Date(now - 1000 * 60 * 2700).toISOString(), actor: 'Sarah Chen', action: 'asset.version_create', category: 'asset', target: 'Landing Page Hero', details: 'Created version 2 from Runway output', severity: 'info' },
  { id: 'log-26', timestamp: new Date(now - 1000 * 60 * 3000).toISOString(), actor: 'System', action: 'compliance.disclosure_check', category: 'compliance', target: '12 assets', details: 'Batch disclosure label check — 2 missing', severity: 'warning' },
  { id: 'log-27', timestamp: new Date(now - 1000 * 60 * 3500).toISOString(), actor: 'Admin', action: 'team.remove', category: 'team', target: 'contractor@old.com', details: 'Removed from workspace — contract ended', severity: 'info' },
  { id: 'log-28', timestamp: new Date(now - 1000 * 60 * 4000).toISOString(), actor: 'System', action: 'extension.session_end', category: 'extension', target: 'ChatGPT', details: 'Session ext-sid-b92c ended — 34 min, 12 prompts', severity: 'info' },
  { id: 'log-29', timestamp: new Date(now - 1000 * 60 * 4500).toISOString(), actor: 'James Wilson', action: 'workflow.start', category: 'workflow', target: 'Podcast Episode #13', details: 'Started Podcast Episode workflow', severity: 'info' },
  { id: 'log-30', timestamp: new Date(now - 1000 * 60 * 5000).toISOString(), actor: 'System', action: 'compliance.copyright_check', category: 'compliance', target: 'Product Hero Image', details: 'Flagged with 89% similarity — high risk', severity: 'critical' },
  { id: 'log-31', timestamp: new Date(now - 1000 * 60 * 5500).toISOString(), actor: 'Mike Johnson', action: 'asset.approve', category: 'asset', target: 'Email Header v2', details: 'Approved with quality score 8.8/10', severity: 'info' },
  { id: 'log-32', timestamp: new Date(now - 1000 * 60 * 6000).toISOString(), actor: 'Admin', action: 'system.settings_change', category: 'system', target: 'Compliance', details: 'Enabled mandatory disclosure for US campaigns', severity: 'info' },
]

const CATEGORIES = ['asset', 'workflow', 'compliance', 'team', 'system', 'auth', 'extension'] as const
const SEVERITIES = ['info', 'warning', 'critical'] as const

function formatAuditTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `${diffMin}m ago`
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatAction(action: string): string {
  return action
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const PAGE_SIZE = 20

export default function AnalyticsAuditPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [page, setPage] = useState(0)

  const filteredLogs = useMemo(() => {
    let list = MOCK_AUDIT_LOGS
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        e =>
          e.actor.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q)
      )
    }
    if (categoryFilter !== 'all') list = list.filter(e => e.category === categoryFilter)
    if (severityFilter !== 'all') list = list.filter(e => e.severity === severityFilter)
    return list
  }, [searchQuery, categoryFilter, severityFilter])

  const stats = useMemo(() => {
    const warnings = filteredLogs.filter(e => e.severity === 'warning').length
    const critical = filteredLogs.filter(e => e.severity === 'critical').length
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const last24h = filteredLogs.filter(e => new Date(e.timestamp).getTime() >= cutoff).length
    return { total: filteredLogs.length, warnings, critical, last24h }
  }, [filteredLogs])

  const paginatedLogs = useMemo(() => {
    const start = page * PAGE_SIZE
    return filteredLogs.slice(start, start + PAGE_SIZE)
  }, [filteredLogs, page])

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Platform activity for compliance and insurance</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Export coming soon')}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actor, action, target..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  categoryFilter === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize',
                    categoryFilter === cat ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSeverityFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  severityFilter === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                All
              </button>
              {SEVERITIES.map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize',
                    severityFilter === sev ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-muted-foreground">
            <span>Total events: <span className="font-medium text-foreground">{stats.total}</span></span>
            <span className="text-amber-600 dark:text-amber-400">Warnings: {stats.warnings}</span>
            <span className="text-red-600 dark:text-red-400">Critical: {stats.critical}</span>
            <span>Last 24h: <span className="font-medium text-foreground">{stats.last24h}</span></span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-2 px-3 font-medium w-32">Timestamp</th>
                <th className="text-left py-2 px-3 font-medium w-8"></th>
                <th className="text-left py-2 px-3 font-medium w-28">Actor</th>
                <th className="text-left py-2 px-3 font-medium w-36">Action</th>
                <th className="text-left py-2 px-3 font-medium w-40">Target</th>
                <th className="text-left py-2 px-3 font-medium min-w-[180px]">Details</th>
                <th className="text-left py-2 px-3 font-medium w-24">Category</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map(entry => (
                <tr
                  key={entry.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors even:bg-muted/10"
                >
                  <td className="py-2 px-3 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {formatAuditTime(entry.timestamp)}
                  </td>
                  <td className="py-2 px-3">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        entry.severity === 'critical' ? 'bg-red-500' : entry.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <span className={cn(entry.actor === 'System' || entry.actor === 'Admin' ? 'text-muted-foreground' : '')}>
                      {entry.actor}
                    </span>
                  </td>
                  <td className="py-2 px-3">{formatAction(entry.action)}</td>
                  <td className="py-2 px-3 font-medium truncate max-w-[160px]" title={entry.target}>
                    {entry.target}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground truncate max-w-[240px]" title={entry.details}>
                    {entry.details}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-[9px] font-normal capitalize">
                      {entry.category}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Showing {filteredLogs.length === 0 ? 0 : page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} events
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page <= 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page >= totalPages - 1 || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
