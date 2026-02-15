"use client"

import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Search, BarChart3, TrendingUp, Shield, FileText, Users, Clock, Zap,
  AlertTriangle, DollarSign, Eye, GitBranch, Scale, Globe, Palette,
  Activity, CheckCircle2, XCircle, ArrowRight, Star, Download,
  ChevronRight, Filter, PieChart, Target, Layers, Bot, Image,
  FileCheck, Gauge, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Report {
  id: string
  title: string
  description: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
  tags: string[]
  isNew?: boolean
  isFeatured?: boolean
  isPremium?: boolean
}

const REPORT_CATEGORIES = [
  { id: 'overview', label: 'Overview', icon: BarChart3, description: 'High-level platform metrics' },
  { id: 'compliance', label: 'Compliance & Risk', icon: Shield, description: 'Regulatory and IP risk tracking' },
  { id: 'assets', label: 'Assets & Content', icon: Image, description: 'Content production and lifecycle' },
  { id: 'workflows', label: 'Workflows & Production', icon: GitBranch, description: 'Creative workflow performance' },
  { id: 'ai-tools', label: 'AI Tool Usage', icon: Bot, description: 'Tool adoption and provenance capture' },
  { id: 'team', label: 'Team & Productivity', icon: Users, description: 'Team output and capacity' },
  { id: 'financial', label: 'Financial & Billing', icon: DollarSign, description: 'Cost tracking and ROI' },
  { id: 'insurance', label: 'Legal', icon: Scale, description: 'Insurance policy coverage, claims, and legal compliance' },
]

const ALL_REPORTS: Report[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    description: 'Key platform metrics at a glance — assets created, compliance score, active workflows, team utilization',
    category: 'overview',
    icon: BarChart3,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    tags: ['KPIs', 'summary'],
    isFeatured: true,
  },
  {
    id: 'platform-health',
    title: 'Platform Health',
    description: 'System-wide health check — extension connectivity, tool availability, pending approvals, overdue tasks',
    category: 'overview',
    icon: Activity,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    tags: ['health', 'status'],
  },
  {
    id: 'weekly-digest',
    title: 'Weekly Digest',
    description: 'Week-over-week comparison of assets produced, compliance pass rates, and workflow throughput',
    category: 'overview',
    icon: TrendingUp,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-500/10',
    tags: ['weekly', 'trends'],
    isNew: true,
  },
  {
    id: 'compliance-scorecard',
    title: 'Compliance Scorecard',
    description: 'Overall compliance score across all assets — copyright risk, provenance completeness, disclosure status',
    category: 'compliance',
    icon: Shield,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    tags: ['compliance', 'score'],
    isFeatured: true,
  },
  {
    id: 'copyright-risk-analysis',
    title: 'Copyright Risk Analysis',
    description: 'Assets flagged for similarity, pending copyright checks, risk distribution by project',
    category: 'compliance',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-500/10',
    tags: ['copyright', 'risk'],
  },
  {
    id: 'provenance-completeness',
    title: 'Provenance Completeness',
    description: 'Percentage of assets with full provenance chain — tool capture, prompt logging, generation tracking',
    category: 'compliance',
    icon: GitBranch,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    tags: ['provenance', 'tracking'],
    isNew: true,
  },
  {
    id: 'jurisdiction-risk-map',
    title: 'Jurisdiction Risk Map',
    description: 'Distribution risk by state and country — AI advertising law exposure, high-risk jurisdictions, disclosure requirements',
    category: 'compliance',
    icon: Globe,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-500/10',
    tags: ['jurisdiction', 'advertising'],
  },
  {
    id: 'disclosure-compliance',
    title: 'Disclosure Compliance',
    description: 'AI disclosure status per asset — which assets need disclosure labels, which are missing them',
    category: 'compliance',
    icon: Eye,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-500/10',
    tags: ['disclosure', 'labels'],
  },
  {
    id: 'aclar-framework',
    title: 'ACLAR Framework Report',
    description: 'Full ACLAR compliance assessment — Accountability, Consent, Liability, Audit, Rights across all content',
    category: 'compliance',
    icon: FileCheck,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-500/10',
    tags: ['ACLAR', 'framework'],
  },
  {
    id: 'asset-production',
    title: 'Asset Production',
    description: 'Total assets created over time, by type (image, video, audio), by project, by team member',
    category: 'assets',
    icon: Image,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-500/10',
    tags: ['production', 'volume'],
    isFeatured: true,
  },
  {
    id: 'approval-pipeline',
    title: 'Approval Pipeline',
    description: 'Assets in each approval stage — draft, client review, admin approved. Bottleneck identification.',
    category: 'assets',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    tags: ['approvals', 'pipeline'],
  },
  {
    id: 'version-iteration',
    title: 'Version & Iteration',
    description: 'Average versions per asset, revision rates, time from first draft to final approval',
    category: 'assets',
    icon: Layers,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-500/10',
    tags: ['versions', 'iterations'],
  },
  {
    id: 'quality-scores',
    title: 'Quality Scores',
    description: 'Average review scores across 6 dimensions — copyright, quality, brand consistency, prompt quality, output fidelity, metadata',
    category: 'assets',
    icon: Star,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    tags: ['quality', 'review'],
  },
  {
    id: 'rejected-assets',
    title: 'Rejected Assets',
    description: 'Assets that failed review — rejection reasons, repeat offenders, common issues',
    category: 'assets',
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-500/10',
    tags: ['rejected', 'issues'],
  },
  {
    id: 'workflow-throughput',
    title: 'Workflow Throughput',
    description: 'Workflows completed per week, average completion time, step-level bottleneck analysis',
    category: 'workflows',
    icon: Zap,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    tags: ['throughput', 'speed'],
  },
  {
    id: 'template-usage',
    title: 'Template Usage',
    description: 'Which workflow templates are used most, custom vs system templates, template effectiveness',
    category: 'workflows',
    icon: GitBranch,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-500/10',
    tags: ['templates', 'adoption'],
  },
  {
    id: 'step-completion-rates',
    title: 'Step Completion Rates',
    description: 'Per-step completion and skip rates across all workflows — identify which steps slow teams down',
    category: 'workflows',
    icon: Target,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-500/10',
    tags: ['steps', 'completion'],
  },
  {
    id: 'workflow-abandonment',
    title: 'Workflow Abandonment',
    description: 'Workflows started but not finished — abandonment rate, where users drop off, paused workflows',
    category: 'workflows',
    icon: ArrowDownRight,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-500/10',
    tags: ['abandonment', 'drop-off'],
  },
  {
    id: 'tool-adoption',
    title: 'Tool Adoption',
    description: 'Which AI tools are being used, by whom, how often — Midjourney, ChatGPT, ElevenLabs, Runway, Suno',
    category: 'ai-tools',
    icon: Bot,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    tags: ['adoption', 'tools'],
    isFeatured: true,
  },
  {
    id: 'extension-capture',
    title: 'Extension Capture Rate',
    description: 'Browser extension performance — prompts captured vs estimated, session coverage, missed captures',
    category: 'ai-tools',
    icon: Eye,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    tags: ['extension', 'capture'],
    isNew: true,
  },
  {
    id: 'prompt-analytics',
    title: 'Prompt Analytics',
    description: 'Prompt patterns — average length, iteration count, most effective templates, prompt reuse rate',
    category: 'ai-tools',
    icon: FileText,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-500/10',
    tags: ['prompts', 'patterns'],
  },
  {
    id: 'generation-volume',
    title: 'Generation Volume',
    description: 'Total AI generations over time — images, videos, audio. Generation-to-asset conversion ratio.',
    category: 'ai-tools',
    icon: Zap,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-500/10',
    tags: ['generations', 'volume'],
  },
  {
    id: 'team-output',
    title: 'Team Output',
    description: 'Assets produced per team member, workflow completions, review turnaround time',
    category: 'team',
    icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    tags: ['team', 'output'],
  },
  {
    id: 'task-velocity',
    title: 'Task Velocity',
    description: 'Tasks completed per sprint/week, on-time delivery rate, overdue task trends',
    category: 'team',
    icon: TrendingUp,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    tags: ['velocity', 'tasks'],
  },
  {
    id: 'review-turnaround',
    title: 'Review Turnaround',
    description: 'Average time from submission to review completion, reviewer workload distribution',
    category: 'team',
    icon: Clock,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    tags: ['reviews', 'speed'],
  },
  {
    id: 'brand-workload',
    title: 'Brand Workload Distribution',
    description: 'Work split across brands — which brand consumes most resources, per-brand compliance rates',
    category: 'team',
    icon: Palette,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-500/10',
    tags: ['brands', 'workload'],
  },
  {
    id: 'ai-cost-tracking',
    title: 'AI Cost Tracking',
    description: 'Estimated AI tool costs per project, per team member — based on generation volume and tool pricing',
    category: 'financial',
    icon: DollarSign,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    tags: ['costs', 'AI'],
  },
  {
    id: 'project-profitability',
    title: 'Project Profitability',
    description: 'Hours tracked vs billed, AI costs vs client billing, per-project margin analysis',
    category: 'financial',
    icon: TrendingUp,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    tags: ['profitability', 'billing'],
    isPremium: true,
  },
  {
    id: 'billable-hours',
    title: 'Billable Hours',
    description: 'Time tracked per task, billable vs non-billable split, utilization rate by team member',
    category: 'financial',
    icon: Clock,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-500/10',
    tags: ['hours', 'billing'],
  },
  {
    id: 'insurance-readiness',
    title: 'Insurance Readiness',
    description: "Policy coverage assessment — assets covered, documentation completeness, evidence package status for Lloyd's syndicates",
    category: 'insurance',
    icon: Shield,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-500/10',
    tags: ['insurance', 'Lloyds'],
    isFeatured: true,
  },
  {
    id: 'talent-rights-status',
    title: 'Talent Rights Status',
    description: 'NIL contracts expiring, usage rights by talent, consent documentation gaps',
    category: 'insurance',
    icon: Users,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-500/10',
    tags: ['talent', 'NIL', 'rights'],
  },
  {
    id: 'claims-exposure',
    title: 'Claims Exposure',
    description: 'Estimated exposure by jurisdiction, asset risk classification, potential claim triggers',
    category: 'insurance',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-500/10',
    tags: ['claims', 'exposure'],
    isPremium: true,
  },
  {
    id: 'evidence-packages',
    title: 'Evidence Packages',
    description: 'Pre-built evidence packages for underwriters — provenance chains, compliance certificates, audit trails',
    category: 'insurance',
    icon: FileCheck,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    tags: ['evidence', 'underwriter'],
    isNew: true,
  },
]

const BUILT_REPORTS = ['executive-summary', 'compliance-scorecard', 'tool-adoption']

function ReportCard({ report }: { report: Report }) {
  const Icon = report.icon
  const isBuilt = BUILT_REPORTS.includes(report.id)

  return (
    <button
      type="button"
      onClick={() => {
        if (isBuilt) {
          window.location.href = `/reports/${report.id}`
        } else {
          toast.info(`${report.title} — full report coming soon`)
        }
      }}
      className="text-left p-4 rounded-xl border bg-card hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group relative w-full"
    >
      <div className="absolute top-3 right-3 flex items-center gap-1 flex-wrap justify-end">
        {isBuilt && (
          <Badge className="text-[8px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">Live</Badge>
        )}
        {report.isNew && (
          <Badge className="text-[8px] h-4 bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400">New</Badge>
        )}
        {report.isPremium && (
          <Badge className="text-[8px] h-4 bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">Pro</Badge>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", report.iconBg)}>
          <Icon className={cn("h-4.5 w-4.5", report.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{report.title}</h3>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{report.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        {report.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
        ))}
        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  )
}

const FEATURED_METRICS = [
  { label: 'Compliance Score', value: '94%', change: '+2.1%', up: true, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  { label: 'Assets This Month', value: '247', change: '+18%', up: true, icon: Image, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  { label: 'Avg Review Time', value: '4.2h', change: '-12%', up: true, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  { label: 'Extension Capture', value: '97.3%', change: '+0.8%', up: true, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-500/10' },
] as const

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredReports = useMemo(() => {
    let reports = ALL_REPORTS
    if (selectedCategory) {
      reports = reports.filter(r => r.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      reports = reports.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return reports
  }, [searchQuery, selectedCategory])

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{ALL_REPORTS.length} reports across {REPORT_CATEGORIES.length} categories</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Custom report builder coming soon')}>
              <PieChart className="mr-1.5 h-3.5 w-3.5" /> Custom Report
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Export coming soon')}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {FEATURED_METRICS.map((metric, i) => {
            const MetricIcon = metric.icon
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", metric.bg)}>
                    <MetricIcon className={cn("h-4 w-4", metric.color)} />
                  </div>
                  <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", metric.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {metric.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {metric.change}
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{metric.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{metric.label}</p>
              </Card>
            )
          })}
        </div>

        {/* Search + Filter Bar */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Category pills — own row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                !selectedCategory
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              All
            </button>
            {REPORT_CATEGORIES.map(cat => {
              const count = ALL_REPORTS.filter(r => r.category === cat.id).length
              const CatIcon = cat.icon
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                    selectedCategory === cat.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <CatIcon className="h-3 w-3" />
                  {cat.label}
                  <span className="text-[9px] opacity-60">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">No reports match your search</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different keyword or category</p>
          </div>
        ) : selectedCategory ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const cat = REPORT_CATEGORIES.find(c => c.id === selectedCategory)!
                const CatIcon = cat.icon
                return (
                  <>
                    <CatIcon className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">{cat.label}</h2>
                    <span className="text-xs text-muted-foreground">· {cat.description}</span>
                  </>
                )
              })()}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {filteredReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div>
            <p className="text-xs text-muted-foreground mb-3">{filteredReports.length} results for &quot;{searchQuery}&quot;</p>
            <div className="grid grid-cols-3 gap-3">
              {filteredReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {REPORT_CATEGORIES.map(cat => {
              const categoryReports = ALL_REPORTS.filter(r => r.category === cat.id)
              const CatIcon = cat.icon
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">
                      <CatIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <h2 className="text-sm font-semibold">{cat.label}</h2>
                    <span className="text-xs text-muted-foreground">· {categoryReports.length} reports</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {categoryReports.map(report => (
                      <ReportCard key={report.id} report={report} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
