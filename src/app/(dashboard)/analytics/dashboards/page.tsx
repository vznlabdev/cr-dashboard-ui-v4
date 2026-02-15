"use client"

import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3, Shield, Image, GitBranch, Scale, Briefcase, Settings2,
  TrendingUp, Clock, Users, Zap, Eye, AlertTriangle, CheckCircle2,
  FileText, ArrowUpRight, ArrowDownRight, Activity, Palette, Bot,
  Layers, Target, Globe, FileCheck, DollarSign, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type DashboardView = 'operations' | 'compliance' | 'creative' | 'insurance' | 'executive'

interface Widget {
  id: string
  title: string
  size: 'sm' | 'md' | 'lg' | 'full'
  render: () => React.ReactNode
}

const VIEWS: { id: DashboardView; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'operations', label: 'Operations', icon: Activity, description: 'Task pipeline and team workload' },
  { id: 'compliance', label: 'Compliance', icon: Shield, description: 'Risk posture and provenance' },
  { id: 'creative', label: 'Creative', icon: Palette, description: 'Asset production and approvals' },
  { id: 'insurance', label: 'Insurance', icon: Scale, description: 'Policy readiness and exposure' },
  { id: 'executive', label: 'Executive', icon: Briefcase, description: 'High-level KPIs and trends' },
]

const operationsWidgets: Widget[] = [
  {
    id: 'ops-pipeline',
    title: 'Task Pipeline',
    size: 'full',
    render: () => (
      <div className="flex items-center divide-x">
        {[
          { label: 'Submitted', count: 3, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Compliance', count: 2, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Assigned', count: 2, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Production', count: 5, color: 'text-orange-600 dark:text-orange-400' },
          { label: 'QA Review', count: 2, color: 'text-cyan-600 dark:text-cyan-400' },
          { label: 'Delivered', count: 8, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map(stage => (
          <div key={stage.label} className="flex-1 text-center px-3 py-2">
            <p className={cn("text-2xl font-bold", stage.color)}>{stage.count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stage.label}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'ops-active-workflows',
    title: 'Active Workflows',
    size: 'sm',
    render: () => (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold">13</p>
          <Badge variant="outline" className="text-[9px] text-emerald-600 dark:text-emerald-400">+4 this week</Badge>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Holiday Sale Banner', progress: 66, template: 'Social Media' },
            { name: 'Product Launch Video', progress: 40, template: 'Video Prod' },
            { name: 'Q2 Campaign Kit', progress: 0, template: 'Campaign Bundle' },
          ].map(wf => (
            <div key={wf.name}>
              <div className="flex items-center justify-between text-[10px]">
                <span className="truncate font-medium">{wf.name}</span>
                <span className="text-muted-foreground shrink-0 ml-2">{wf.progress}%</span>
              </div>
              <Progress value={wf.progress} className="h-1 mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'ops-overdue',
    title: 'Overdue Tasks',
    size: 'sm',
    render: () => (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">3</p>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Email Header Design', days: 2, assignee: 'SC' },
            { name: 'Social Pack v3', days: 1, assignee: 'MR' },
            { name: 'Podcast Cover', days: 3, assignee: 'JW' },
          ].map(task => (
            <div key={task.name} className="flex items-center gap-2 text-[10px]">
              <div className="h-4 w-4 rounded-full bg-red-500/10 flex items-center justify-center text-[8px] font-bold text-red-600 dark:text-red-400 shrink-0">{task.assignee}</div>
              <span className="truncate">{task.name}</span>
              <span className="text-red-500 shrink-0 ml-auto">{task.days}d late</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'ops-team-workload',
    title: 'Team Workload',
    size: 'sm',
    render: () => (
      <div className="space-y-2">
        {[
          { name: 'Sarah Chen', tasks: 5, capacity: 80, color: 'bg-red-500' },
          { name: 'Mike Johnson', tasks: 3, capacity: 50, color: 'bg-amber-500' },
          { name: 'Emily Park', tasks: 3, capacity: 50, color: 'bg-emerald-500' },
          { name: 'James Wilson', tasks: 2, capacity: 30, color: 'bg-emerald-500' },
        ].map(m => (
          <div key={m.name} className="flex items-center gap-2">
            <span className="text-[10px] w-20 truncate">{m.name}</span>
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.capacity}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground w-6 text-right">{m.tasks}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'ops-pending-approvals',
    title: 'Pending Approvals',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold mb-2">8</p>
        <div className="space-y-1.5">
          {[
            { type: 'Asset Review', count: 4 },
            { type: 'Client Approval', count: 2 },
            { type: 'Compliance Sign-off', count: 2 },
          ].map(a => (
            <div key={a.type} className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{a.type}</span>
              <Badge variant="outline" className="text-[9px] h-4">{a.count}</Badge>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'ops-recent-activity',
    title: 'Recent Activity',
    size: 'md',
    render: () => (
      <div className="space-y-2">
        {[
          { action: 'Sarah Chen completed step 2 of Holiday Sale Banner', time: '25m ago', icon: '✅' },
          { action: 'Mike Johnson uploaded output to Product Launch Video', time: '1h ago', icon: '📤' },
          { action: 'Emily Park approved Homepage Banner v3', time: '2h ago', icon: '👍' },
          { action: 'Copyright check flagged Social Banner v2 (62% similarity)', time: '3h ago', icon: '⚠️' },
          { action: 'James Wilson started Podcast Episode #12 workflow', time: '4h ago', icon: '▶️' },
        ].map((event, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px]">
            <span className="shrink-0 mt-0.5">{event.icon}</span>
            <span className="flex-1 leading-relaxed">{event.action}</span>
            <span className="text-muted-foreground shrink-0">{event.time}</span>
          </div>
        ))}
      </div>
    ),
  },
]

const complianceWidgets: Widget[] = [
  {
    id: 'comp-score',
    title: 'Compliance Score',
    size: 'sm',
    render: () => (
      <div>
        <div className="flex items-end gap-2">
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">94%</p>
          <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">
            <ArrowUpRight className="h-3 w-3" /> +2.1%
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Across 1,247 assets</p>
        <Progress value={94} className="h-2 mt-2" />
      </div>
    ),
  },
  {
    id: 'comp-flagged',
    title: 'Flagged Assets',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">24</p>
        <div className="flex items-center gap-3 mt-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> 6 high</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 18 medium</span>
        </div>
        <Link href="/reports/compliance-scorecard" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">View details →</Link>
      </div>
    ),
  },
  {
    id: 'comp-provenance',
    title: 'Provenance Coverage',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold">97.3%</p>
        <p className="text-[10px] text-muted-foreground mt-1">Full chain captured</p>
        <div className="grid grid-cols-2 gap-1 mt-2">
          {[
            { label: 'Creator', pct: 98 },
            { label: 'Tool', pct: 97 },
            { label: 'Prompt', pct: 95 },
            { label: 'Copyright', pct: 78 },
          ].map(p => (
            <div key={p.label} className="text-[9px]">
              <div className="flex justify-between"><span>{p.label}</span><span className={p.pct < 90 ? 'text-amber-600 dark:text-amber-400' : ''}>{p.pct}%</span></div>
              <Progress value={p.pct} className="h-0.5 mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'comp-copyright-queue',
    title: 'Copyright Queue',
    size: 'sm',
    render: () => (
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div>
            <p className="text-3xl font-bold">6</p>
            <p className="text-[10px] text-muted-foreground">Pending checks</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">1,241</p>
            <p className="text-[10px] text-muted-foreground">Checked</p>
          </div>
        </div>
        <Progress value={99.5} className="h-1.5" />
      </div>
    ),
  },
  {
    id: 'comp-jurisdiction',
    title: 'Jurisdiction Exposure',
    size: 'md',
    render: () => (
      <div className="space-y-1.5">
        {[
          { state: 'California', risk: 'high' as const, assets: 87, law: 'AB 2655' },
          { state: 'New York', risk: 'high' as const, assets: 64, law: 'S.B. 8208' },
          { state: 'Illinois', risk: 'high' as const, assets: 42, law: 'AI Video Act' },
          { state: 'Texas', risk: 'medium' as const, assets: 38, law: 'HB 1709' },
          { state: 'Washington', risk: 'medium' as const, assets: 29, law: 'SB 5838' },
        ].map(j => (
          <div key={j.state} className="flex items-center gap-2 text-[10px]">
            <Badge variant="outline" className={cn("text-[8px] h-4 w-14 justify-center", j.risk === 'high' ? 'border-red-300 text-red-600 dark:text-red-400' : 'border-amber-300 text-amber-600 dark:text-amber-400')}>{j.risk}</Badge>
            <span className="font-medium w-24">{j.state}</span>
            <span className="text-muted-foreground flex-1 truncate">{j.law}</span>
            <span className="text-muted-foreground">{j.assets} assets</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'comp-aclar',
    title: 'ACLAR Status',
    size: 'md',
    render: () => (
      <div className="space-y-1.5">
        {[
          { letter: 'A', label: 'Accountability', score: 96, status: 'pass' as const },
          { letter: 'C', label: 'Consent', score: 91, status: 'pass' as const },
          { letter: 'L', label: 'Liability', score: 88, status: 'warn' as const },
          { letter: 'A', label: 'Audit', score: 94, status: 'pass' as const },
          { letter: 'R', label: 'Rights', score: 82, status: 'warn' as const },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <div className="h-5 w-5 rounded bg-blue-500/10 flex items-center justify-center text-[9px] font-bold text-blue-600 dark:text-blue-400">{item.letter}</div>
            <span className="w-24">{item.label}</span>
            <div className="flex-1"><Progress value={item.score} className="h-1" /></div>
            <span className={item.status === 'pass' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{item.score}%</span>
          </div>
        ))}
      </div>
    ),
  },
]

const creativeWidgets: Widget[] = [
  {
    id: 'cr-assets-week',
    title: 'Assets This Week',
    size: 'sm',
    render: () => (
      <div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold">57</p>
          <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5"><ArrowUpRight className="h-3 w-3" /> +18%</div>
        </div>
        <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
          <span>🖼 34 images</span>
          <span>🎬 12 video</span>
          <span>🎙 11 audio</span>
        </div>
      </div>
    ),
  },
  {
    id: 'cr-approval-pipeline',
    title: 'Approval Pipeline',
    size: 'sm',
    render: () => (
      <div className="space-y-1.5">
        {[
          { stage: 'Draft', count: 14, color: 'bg-gray-400' },
          { stage: 'In Review', count: 8, color: 'bg-amber-500' },
          { stage: 'Client Review', count: 4, color: 'bg-blue-500' },
          { stage: 'Approved', count: 31, color: 'bg-emerald-500' },
        ].map(s => (
          <div key={s.stage} className="flex items-center gap-2 text-[10px]">
            <div className={cn("h-1.5 w-1.5 rounded-full", s.color)} />
            <span className="w-20">{s.stage}</span>
            <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
              <div className={cn("h-full rounded-full", s.color)} style={{ width: `${(s.count / 57) * 100}%` }} />
            </div>
            <span className="font-medium w-6 text-right">{s.count}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'cr-quality-avg',
    title: 'Avg Quality Score',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold">8.4<span className="text-lg text-muted-foreground">/10</span></p>
        <div className="grid grid-cols-3 gap-1 mt-2 text-[9px]">
          {[
            { label: 'Copyright', score: 9.1 },
            { label: 'Quality', score: 8.2 },
            { label: 'Brand', score: 8.6 },
            { label: 'Prompt', score: 7.8 },
            { label: 'Output', score: 8.4 },
            { label: 'Metadata', score: 8.3 },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-bold">{s.score}</p>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'cr-tool-usage',
    title: 'Tool Usage',
    size: 'sm',
    render: () => (
      <div className="space-y-1.5">
        {[
          { name: 'Midjourney', count: 187, emoji: '🎨' },
          { name: 'ChatGPT', count: 243, emoji: '💬' },
          { name: 'ElevenLabs', count: 89, emoji: '🎙️' },
          { name: 'Runway', count: 56, emoji: '🎬' },
        ].map(t => (
          <div key={t.name} className="flex items-center gap-2 text-[10px]">
            <span>{t.emoji}</span>
            <span className="flex-1">{t.name}</span>
            <span className="font-medium">{t.count}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'cr-brand-split',
    title: 'Brand Workload',
    size: 'md',
    render: () => (
      <div className="space-y-2">
        {[
          { name: 'Acme Corporation', assets: 45, pct: 39, color: 'bg-blue-500' },
          { name: 'TechStart Inc', assets: 34, pct: 30, color: 'bg-purple-500' },
          { name: 'NatureFresh Foods', assets: 22, pct: 19, color: 'bg-emerald-500' },
          { name: 'Urban Style Co', assets: 14, pct: 12, color: 'bg-amber-500' },
        ].map(b => (
          <div key={b.name} className="flex items-center gap-2 text-[10px]">
            <span className="w-28 truncate font-medium">{b.name}</span>
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className={cn("h-full rounded-full", b.color)} style={{ width: `${b.pct}%` }} />
            </div>
            <span className="text-muted-foreground w-14 text-right">{b.assets} ({b.pct}%)</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'cr-recent-uploads',
    title: 'Recent Uploads',
    size: 'md',
    render: () => (
      <div className="space-y-2">
        {[
          { name: 'hero-banner-summer-v3.png', type: 'Image', tool: 'Midjourney', time: '25m ago' },
          { name: 'product-launch-intro.mp4', type: 'Video', tool: 'Runway', time: '1h ago' },
          { name: 'podcast-ep12-narration.mp3', type: 'Audio', tool: 'ElevenLabs', time: '2h ago' },
          { name: 'social-story-pack.zip', type: 'Bundle', tool: 'Multiple', time: '3h ago' },
        ].map(u => (
          <div key={u.name} className="flex items-center gap-2 text-[10px]">
            <span className="truncate flex-1 font-medium">{u.name}</span>
            <Badge variant="outline" className="text-[8px] h-4">{u.type}</Badge>
            <span className="text-muted-foreground">{u.tool}</span>
            <span className="text-muted-foreground w-12 text-right">{u.time}</span>
          </div>
        ))}
      </div>
    ),
  },
]

const insuranceWidgets: Widget[] = [
  {
    id: 'ins-readiness',
    title: 'Insurance Readiness',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">87%</p>
        <p className="text-[10px] text-muted-foreground mt-1">Portfolio coverage score</p>
        <div className="grid grid-cols-2 gap-1 mt-2 text-[9px]">
          <div><p className="font-bold text-emerald-600 dark:text-emerald-400">1,089</p><p className="text-muted-foreground">Fully covered</p></div>
          <div><p className="font-bold text-amber-600 dark:text-amber-400">158</p><p className="text-muted-foreground">Gaps found</p></div>
        </div>
      </div>
    ),
  },
  {
    id: 'ins-evidence',
    title: 'Evidence Packages',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold">24</p>
        <p className="text-[10px] text-muted-foreground mt-1">Ready for underwriters</p>
        <div className="space-y-1 mt-2 text-[10px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Complete</span><span className="text-emerald-600 dark:text-emerald-400 font-medium">18</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">In Progress</span><span className="text-amber-600 dark:text-amber-400 font-medium">4</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Not Started</span><span className="text-red-600 dark:text-red-400 font-medium">2</span></div>
        </div>
      </div>
    ),
  },
  {
    id: 'ins-exposure',
    title: 'Claims Exposure',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">$2.4M</p>
        <p className="text-[10px] text-muted-foreground mt-1">Estimated max exposure</p>
        <div className="space-y-1 mt-2 text-[10px]">
          <div className="flex justify-between"><span>Copyright claims</span><span className="font-medium">$1.8M</span></div>
          <div className="flex justify-between"><span>Right of publicity</span><span className="font-medium">$420K</span></div>
          <div className="flex justify-between"><span>Disclosure violations</span><span className="font-medium">$180K</span></div>
        </div>
      </div>
    ),
  },
  {
    id: 'ins-talent-rights',
    title: 'Talent Rights',
    size: 'sm',
    render: () => (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-3xl font-bold">47</p>
          <span className="text-[10px] text-muted-foreground">active contracts</span>
        </div>
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span>3 expiring within 30 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>7 missing consent documentation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>37 fully compliant</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ins-risk-dist',
    title: 'Risk Distribution',
    size: 'md',
    render: () => (
      <div>
        <div className="flex h-6 rounded-lg overflow-hidden mb-3">
          <div className="bg-emerald-500" style={{ width: '87.3%' }} />
          <div className="bg-amber-500" style={{ width: '10.3%' }} />
          <div className="bg-red-500" style={{ width: '1.9%' }} />
          <div className="bg-gray-300 dark:bg-gray-600" style={{ width: '0.5%' }} />
        </div>
        <div className="grid grid-cols-4 gap-2 text-[9px] text-center">
          <div><p className="font-bold text-emerald-600 dark:text-emerald-400">1,089</p><p className="text-muted-foreground">Low</p></div>
          <div><p className="font-bold text-amber-600 dark:text-amber-400">128</p><p className="text-muted-foreground">Medium</p></div>
          <div><p className="font-bold text-red-600 dark:text-red-400">24</p><p className="text-muted-foreground">High</p></div>
          <div><p className="font-bold text-gray-400">6</p><p className="text-muted-foreground">Unchecked</p></div>
        </div>
      </div>
    ),
  },
  {
    id: 'ins-policy-gaps',
    title: 'Policy Documentation Gaps',
    size: 'md',
    render: () => (
      <div className="space-y-1.5">
        {[
          { doc: 'Provenance certificates', complete: 94, icon: FileCheck },
          { doc: 'Copyright clearance', complete: 78, icon: Shield },
          { doc: 'Consent records', complete: 85, icon: Users },
          { doc: 'Disclosure compliance', complete: 91, icon: Eye },
          { doc: 'Audit trails', complete: 97, icon: FileText },
        ].map(d => {
          const DocIcon = d.icon
          return (
            <div key={d.doc} className="flex items-center gap-2 text-[10px]">
              <DocIcon className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="w-36 truncate">{d.doc}</span>
              <div className="flex-1"><Progress value={d.complete} className="h-1" /></div>
              <span className={cn("w-8 text-right font-medium", d.complete < 85 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>{d.complete}%</span>
            </div>
          )
        })}
      </div>
    ),
  },
]

const executiveWidgets: Widget[] = [
  {
    id: 'exec-kpi-1',
    title: 'Total Assets',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold">1,247</p>
        <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mt-1"><ArrowUpRight className="h-3 w-3" /> +18% vs last month</div>
        <p className="text-[9px] text-muted-foreground mt-0.5">247 created this month</p>
      </div>
    ),
  },
  {
    id: 'exec-kpi-2',
    title: 'Compliance',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">94%</p>
        <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mt-1"><ArrowUpRight className="h-3 w-3" /> +2.1% improvement</div>
        <p className="text-[9px] text-muted-foreground mt-0.5">6 assets need attention</p>
      </div>
    ),
  },
  {
    id: 'exec-kpi-3',
    title: 'Avg Delivery',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold">4.2h</p>
        <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mt-1"><ArrowUpRight className="h-3 w-3" /> 12% faster</div>
        <p className="text-[9px] text-muted-foreground mt-0.5">Submission to delivery</p>
      </div>
    ),
  },
  {
    id: 'exec-kpi-4',
    title: 'Extension Capture',
    size: 'sm',
    render: () => (
      <div>
        <p className="text-3xl font-bold">97.3%</p>
        <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mt-1"><ArrowUpRight className="h-3 w-3" /> +0.8%</div>
        <p className="text-[9px] text-muted-foreground mt-0.5">14,892 events captured</p>
      </div>
    ),
  },
  {
    id: 'exec-team-output',
    title: 'Team Output',
    size: 'md',
    render: () => (
      <div className="space-y-2">
        {[
          { name: 'Sarah Chen', assets: 87, trend: '+12%' },
          { name: 'Michael Roberts', assets: 62, trend: '+8%' },
          { name: 'Emily Park', assets: 54, trend: '+22%' },
          { name: 'James Wilson', assets: 44, trend: '-3%' },
        ].map((m, i) => (
          <div key={m.name} className="flex items-center gap-2 text-[10px]">
            <span className="text-muted-foreground w-3">{i + 1}.</span>
            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-[8px] font-bold text-blue-600 dark:text-blue-400">{m.name.charAt(0)}</div>
            <span className="flex-1 font-medium">{m.name}</span>
            <span className="font-bold">{m.assets}</span>
            <span className={cn("text-[9px]", m.trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>{m.trend}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'exec-alerts',
    title: 'Alerts',
    size: 'md',
    render: () => (
      <div className="space-y-2">
        {[
          { msg: '3 overdue tasks need reassignment', level: 'error' as const },
          { msg: '6 assets pending copyright check >24h', level: 'warning' as const },
          { msg: '2 talent contracts expire in 14 days', level: 'warning' as const },
          { msg: 'Browser extension update available', level: 'info' as const },
        ].map((alert, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                alert.level === 'error' ? 'bg-red-500' : alert.level === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              )}
            />
            <span className="flex-1">{alert.msg}</span>
          </div>
        ))}
      </div>
    ),
  },
]

const WIDGET_MAP: Record<DashboardView, Widget[]> = {
  operations: operationsWidgets,
  compliance: complianceWidgets,
  creative: creativeWidgets,
  insurance: insuranceWidgets,
  executive: executiveWidgets,
}

export default function AnalyticsDashboardsPage() {
  const [activeView, setActiveView] = useState<DashboardView>('operations')
  const [showCustomize, setShowCustomize] = useState(false)
  const [hiddenWidgets, setHiddenWidgets] = useState<Record<string, string[]>>({
    operations: [],
    compliance: [],
    creative: [],
    insurance: [],
    executive: [],
  })

  const toggleWidget = (widgetId: string) => {
    setHiddenWidgets(prev => {
      const current = prev[activeView] || []
      const updated = current.includes(widgetId)
        ? current.filter(id => id !== widgetId)
        : [...current, widgetId]
      return { ...prev, [activeView]: updated }
    })
  }

  const currentWidgets = useMemo(
    () => WIDGET_MAP[activeView].filter(w => !(hiddenWidgets[activeView] || []).includes(w.id)),
    [activeView, hiddenWidgets]
  )
  const allWidgets = WIDGET_MAP[activeView]

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboards</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configurable views across your platform</p>
          </div>
          <Button
            variant={showCustomize ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setShowCustomize(!showCustomize)}
          >
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            {showCustomize ? 'Done' : 'Customize'}
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          {VIEWS.map(view => {
            const ViewIcon = view.icon
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeView === view.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <ViewIcon className="h-3 w-3" />
                {view.label}
              </button>
            )
          })}
        </div>

        {showCustomize && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold">Customize {VIEWS.find(v => v.id === activeView)?.label} View</p>
                <p className="text-[10px] text-muted-foreground">Toggle widgets on or off</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setHiddenWidgets(prev => ({ ...prev, [activeView]: [] }))}>
                Reset All
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {allWidgets.map(widget => {
                const isHidden = (hiddenWidgets[activeView] || []).includes(widget.id)
                return (
                  <div key={widget.id} className="flex items-center justify-between p-2 rounded-md border">
                    <span className="text-xs">{widget.title}</span>
                    <Switch
                      checked={!isHidden}
                      onCheckedChange={() => toggleWidget(widget.id)}
                      className="scale-75"
                    />
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-3">
          {currentWidgets.map(widget => (
            <Card
              key={widget.id}
              className={cn(
                "p-4 overflow-hidden",
                widget.size === 'sm' && 'col-span-1',
                widget.size === 'md' && 'col-span-2',
                widget.size === 'lg' && 'col-span-3',
                widget.size === 'full' && 'col-span-4',
              )}
            >
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">{widget.title}</p>
              {widget.render()}
            </Card>
          ))}
        </div>

        {currentWidgets.length === 0 && (
          <div className="text-center py-16">
            <Settings2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">All widgets hidden</p>
            <p className="text-xs text-muted-foreground mt-1">Click Customize to enable widgets</p>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
