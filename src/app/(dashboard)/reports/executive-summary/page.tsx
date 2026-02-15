"use client"

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, Shield, Image, Clock, Eye, Users,
  GitBranch, Download,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ASSET_TREND = [
  { date: 'Jan 1', assets: 32, compliance: 89 },
  { date: 'Jan 8', assets: 45, compliance: 91 },
  { date: 'Jan 15', assets: 38, compliance: 90 },
  { date: 'Jan 22', assets: 52, compliance: 92 },
  { date: 'Jan 29', assets: 61, compliance: 93 },
  { date: 'Feb 5', assets: 48, compliance: 94 },
  { date: 'Feb 12', assets: 57, compliance: 94 },
]

const TOOL_USAGE = [
  { name: 'Midjourney', count: 187, color: '#3b82f6' },
  { name: 'ChatGPT', count: 243, color: '#8b5cf6' },
  { name: 'ElevenLabs', count: 89, color: '#10b981' },
  { name: 'Runway', count: 56, color: '#f59e0b' },
  { name: 'Suno AI', count: 34, color: '#ec4899' },
]

const WORKFLOW_STATS = [
  { name: 'Social Media Image', completed: 42, active: 3 },
  { name: 'Video Production', completed: 18, active: 2 },
  { name: 'Podcast Episode', completed: 12, active: 1 },
  { name: 'Campaign Bundle', completed: 8, active: 2 },
  { name: 'Quick Image', completed: 67, active: 5 },
]

const TEAM_OUTPUT = [
  { name: 'Sarah Chen', assets: 87, reviews: 34, score: 96 },
  { name: 'Michael Roberts', assets: 62, reviews: 28, score: 92 },
  { name: 'Emily Park', assets: 54, reviews: 41, score: 98 },
  { name: 'James Wilson', assets: 44, reviews: 22, score: 89 },
]

const KPI_CARDS = [
  { label: 'Total Assets', value: '1,247', change: '+18%', up: true, icon: Image, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', sub: '247 this month' },
  { label: 'Compliance Score', value: '94%', change: '+2.1%', up: true, icon: Shield, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', sub: '6 assets flagged' },
  { label: 'Active Workflows', value: '13', change: '+4', up: true, icon: GitBranch, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', sub: '147 completed total' },
  { label: 'Avg Review Time', value: '4.2h', change: '-12%', up: true, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', sub: 'Down from 4.8h' },
  { label: 'Extension Capture', value: '97.3%', change: '+0.8%', up: true, icon: Eye, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', sub: '14,892 events tracked' },
  { label: 'Team Members', value: '12', change: '+2', up: true, icon: Users, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10', sub: '4 active reviewers' },
] as const

const QUICK_STATS = [
  { label: 'Pending Approvals', value: '8', status: 'warning' as const },
  { label: 'Overdue Tasks', value: '3', status: 'error' as const },
  { label: 'Copyright Flags', value: '6', status: 'warning' as const },
  { label: 'Extension Sessions Today', value: '24', status: 'success' as const },
] as const

export default function ExecutiveSummaryPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const maxToolCount = Math.max(...TOOL_USAGE.map(t => t.count))

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/reports" className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Executive Summary</h1>
              <p className="text-xs text-muted-foreground">Key platform metrics at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              {(['7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-all",
                    timeRange === range
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards — 6 cards, 2 rows of 3 */}
        <div className="grid grid-cols-3 gap-3">
          {KPI_CARDS.map((kpi, i) => {
            const KpiIcon = kpi.icon
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", kpi.bg)}>
                    <KpiIcon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                  <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", kpi.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                <p className="text-[9px] text-muted-foreground mt-1">{kpi.sub}</p>
              </Card>
            )
          })}
        </div>

        {/* Charts Row 1 — Asset Trend + Tool Usage */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="col-span-3 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Asset Production</h3>
                <p className="text-[10px] text-muted-foreground">Weekly assets created & compliance score</p>
              </div>
              <Badge variant="outline" className="text-[9px]">
                Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ASSET_TREND}>
                <defs>
                  <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="assets" stroke="#3b82f6" fill="url(#colorAssets)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="col-span-2 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">AI Tool Usage</h3>
              <p className="text-[10px] text-muted-foreground">Tasks by tool this period</p>
            </div>
            <div className="space-y-3">
              {TOOL_USAGE.map(tool => (
                <div key={tool.name} className="flex items-center gap-3">
                  <span className="text-xs w-20 truncate">{tool.name}</span>
                  <div className="flex-1">
                    <Progress value={maxToolCount > 0 ? (tool.count / maxToolCount) * 100 : 0} className="h-2" />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{tool.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts Row 2 — Workflow Performance + Team Leaderboard */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Workflow Performance</h3>
                <p className="text-[10px] text-muted-foreground">Completed vs active by template</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={WORKFLOW_STATS} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} stroke="#a1a1aa" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="completed" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Completed" />
                <Bar dataKey="active" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Active" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Team Output</h3>
                <p className="text-[10px] text-muted-foreground">Top contributors this period</p>
              </div>
            </div>
            <div className="space-y-3">
              {TEAM_OUTPUT.map((member, i) => (
                <div key={member.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{member.name}</p>
                    <p className="text-[9px] text-muted-foreground">{member.assets} assets · {member.reviews} reviews</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{member.score}</p>
                    <p className="text-[8px] text-muted-foreground">quality</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Row — Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          {QUICK_STATS.map((stat, i) => (
            <Card key={i} className="p-3 flex items-center gap-3">
              <div
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  stat.status === 'success' ? 'bg-emerald-500' : stat.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                )}
              />
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
