"use client"

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Bot, Eye, Zap, Clock, ArrowUpRight, ArrowDownRight, Download,
  Users, Activity, ChevronRight, BarChart3, Shield, Image,
  FileText, GitBranch, AlertTriangle, Monitor, Wifi,
  HardDrive, TrendingUp, Gauge, Server, Smartphone, Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

const PLATFORM_KPIS = [
  { label: 'Active Users', value: '12', sub: 'of 14 seats', change: '+2', up: true, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Sessions', value: '1,158', sub: 'total this period', change: '+12%', up: true, icon: Monitor, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Events Captured', value: '14,892', sub: 'prompts + generations + downloads', change: '+22%', up: true, icon: Eye, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Assets Created', value: '247', sub: 'across all projects', change: '+18%', up: true, icon: Image, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10' },
  { label: 'Workflows Run', value: '89', sub: '67 completed, 13 active', change: '+31%', up: true, icon: GitBranch, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Avg Session', value: '34m', sub: 'per user per day', change: '-8%', up: false, icon: Clock, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
] as const

const TOOL_ROWS = [
  { name: 'Midjourney', icon: '🎨', cat: 'Image', sessions: 312, prompts: 1847, gens: 4231, downloads: 892, users: 8, capture: 98.2, trend: '+12%', trendUp: true },
  { name: 'ChatGPT', icon: '💬', cat: 'Text', sessions: 489, prompts: 3421, gens: 3421, downloads: 1204, users: 11, capture: 97.1, trend: '+8%', trendUp: true },
  { name: 'ElevenLabs', icon: '🎙️', cat: 'Audio', sessions: 156, prompts: 423, gens: 423, downloads: 312, users: 4, capture: 96.8, trend: '+22%', trendUp: true },
  { name: 'Runway', icon: '🎬', cat: 'Video', sessions: 89, prompts: 234, gens: 178, downloads: 134, users: 3, capture: 95.4, trend: '+15%', trendUp: true },
  { name: 'Suno AI', icon: '🎵', cat: 'Audio', sessions: 67, prompts: 189, gens: 189, downloads: 87, users: 2, capture: 94.1, trend: '+31%', trendUp: true },
  { name: 'DALL-E', icon: '🖼️', cat: 'Image', sessions: 45, prompts: 312, gens: 624, downloads: 198, users: 5, capture: 97.5, trend: '-3%', trendUp: false },
  { name: 'Stable Diffusion', icon: '🌀', cat: 'Image', sessions: 28, prompts: 187, gens: 412, downloads: 89, users: 3, capture: 89.2, trend: '+5%', trendUp: true },
  { name: 'Claude', icon: '🤖', cat: 'Text', sessions: 34, prompts: 156, gens: 156, downloads: 42, users: 4, capture: 99.1, trend: '+45%', trendUp: true },
] as const

const CAPTURE_BREAKDOWN = [
  { label: 'Prompt Capture', rate: 98.1, captured: 6641, total: 6769 },
  { label: 'Generation Tracking', rate: 97.8, captured: 9422, total: 9634 },
  { label: 'Download Logging', rate: 96.2, captured: 2846, total: 2958 },
  { label: 'Session Binding', rate: 99.1, captured: 1209, total: 1220 },
] as const

const COVERAGE_GAPS = [
  { tool: 'Stable Diffusion', missed: 187, reason: 'Unsupported interface change in v3.1', severity: 'high' as const },
  { tool: 'Custom API Calls', missed: 134, reason: 'Direct API usage not trackable via extension', severity: 'medium' as const },
  { tool: 'Midjourney', missed: 52, reason: 'Extension paused by users during sessions', severity: 'low' as const },
  { tool: 'DALL-E', missed: 28, reason: 'Rate limiting caused missed webhook events', severity: 'low' as const },
  { tool: 'Local Models', missed: 12, reason: 'Localhost not supported by extension', severity: 'medium' as const },
] as const

const EXTENSION_STATUS = [
  { label: 'Version', value: 'v2.4.1' },
  { label: 'Connected Devices', value: '14' },
  { label: 'Last Heartbeat', value: '12s ago' },
  { label: 'Uptime', value: '99.97%' },
  { label: 'Queue Depth', value: '3 events' },
  { label: 'Avg Latency', value: '142ms' },
] as const

const TEAM_ROWS = [
  { name: 'Sarah Chen', role: 'Senior Creator', avatar: 'SC', color: 'bg-blue-500', sessions: 198, prompts: 1243, assets: 87, reviews: 34, capture: 98.7, workflows: 23, lastActive: '12 min ago', status: 'online' as const },
  { name: 'Michael Roberts', role: 'Creator', avatar: 'MR', color: 'bg-purple-500', sessions: 156, prompts: 987, assets: 62, reviews: 28, capture: 97.2, workflows: 18, lastActive: '1h ago', status: 'online' as const },
  { name: 'Emily Park', role: 'Reviewer', avatar: 'EP', color: 'bg-emerald-500', sessions: 134, prompts: 654, assets: 54, reviews: 41, capture: 99.1, workflows: 12, lastActive: '25 min ago', status: 'online' as const },
  { name: 'James Wilson', role: 'Creator', avatar: 'JW', color: 'bg-amber-500', sessions: 112, prompts: 723, assets: 44, reviews: 22, capture: 96.1, workflows: 15, lastActive: '3h ago', status: 'away' as const },
  { name: 'Alex Kim', role: 'Creator', avatar: 'AK', color: 'bg-pink-500', sessions: 98, prompts: 534, assets: 38, reviews: 12, capture: 97.8, workflows: 11, lastActive: '45 min ago', status: 'online' as const },
  { name: 'Lisa Thompson', role: 'Creator', avatar: 'LT', color: 'bg-cyan-500', sessions: 87, prompts: 412, assets: 31, reviews: 8, capture: 95.4, workflows: 8, lastActive: '2h ago', status: 'away' as const },
  { name: 'David Chen', role: 'Admin', avatar: 'DC', color: 'bg-indigo-500', sessions: 67, prompts: 198, assets: 12, reviews: 45, capture: 99.4, workflows: 4, lastActive: '5 min ago', status: 'online' as const },
  { name: 'Maria Santos', role: 'Creator', avatar: 'MS', color: 'bg-rose-500', sessions: 56, prompts: 345, assets: 28, reviews: 6, capture: 96.8, workflows: 7, lastActive: '1d ago', status: 'offline' as const },
  { name: 'Ryan Park', role: 'Creator', avatar: 'RP', color: 'bg-orange-500', sessions: 45, prompts: 287, assets: 22, reviews: 4, capture: 94.2, workflows: 5, lastActive: '6h ago', status: 'offline' as const },
  { name: 'Jessica Liu', role: 'Reviewer', avatar: 'JL', color: 'bg-teal-500', sessions: 34, prompts: 123, assets: 8, reviews: 38, capture: 98.9, workflows: 2, lastActive: '30 min ago', status: 'online' as const },
] as const

const QUOTA_CARDS = [
  { label: 'Team Seats', used: 12, limit: 25, unit: 'seats', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Monthly Assets', used: 247, limit: 2500, unit: 'assets', icon: Image, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10' },
  { label: 'AI Generations', used: 9634, limit: 50000, unit: 'generations', icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Storage', used: 12.4, limit: 100, unit: 'GB', icon: HardDrive, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
] as const

const RATE_LIMITS = [
  { label: 'API Requests', rate: '2,847/min', limit: '10,000/min', pct: 28, status: 'normal' },
  { label: 'Extension Events', rate: '412/min', limit: '5,000/min', pct: 8, status: 'normal' },
  { label: 'Concurrent Sessions', rate: '8', limit: '50', pct: 16, status: 'normal' },
] as const

const ACTIONS_BY_TYPE = [
  { action: 'Asset uploads', count: 247, pct: 28 },
  { action: 'Workflow steps completed', count: 412, pct: 46 },
  { action: 'Reviews submitted', count: 134, pct: 15 },
  { action: 'Comments posted', count: 89, pct: 10 },
  { action: 'Settings changes', count: 12, pct: 1 },
] as const

const PEAK_HOURS = [
  { hour: '9–10 AM', bar: 85, sessions: 89 },
  { hour: '10–11 AM', bar: 100, sessions: 104 },
  { hour: '11–12 PM', bar: 72, sessions: 75 },
  { hour: '1–2 PM', bar: 92, sessions: 96 },
  { hour: '2–3 PM', bar: 95, sessions: 99 },
  { hour: '3–4 PM', bar: 78, sessions: 81 },
  { hour: '4–5 PM', bar: 55, sessions: 57 },
] as const

const BROWSERS = [
  { name: 'Chrome', pct: 72 },
  { name: 'Firefox', pct: 18 },
  { name: 'Safari', pct: 8 },
  { name: 'Edge', pct: 2 },
] as const

const DEVICES = [
  { name: 'Desktop', pct: 89, icon: Monitor },
  { name: 'Mobile', pct: 8, icon: Smartphone },
  { name: 'Tablet', pct: 3, icon: Monitor },
] as const

export default function AnalyticsUsagePage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d')

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Usage</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Platform consumption, tool activity, and system health</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              {(['24h', '7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-all',
                    timeRange === range ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {range === '24h' ? '24h' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Export coming soon')}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {PLATFORM_KPIS.map((kpi, i) => {
            const KpiIcon = kpi.icon
            return (
              <Card key={i} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', kpi.bg)}>
                    <KpiIcon className={cn('h-3.5 w-3.5', kpi.color)} />
                  </div>
                  <div className={cn('flex items-center gap-0.5 text-[9px] font-medium', kpi.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                    {kpi.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.label}</p>
                <p className="text-[8px] text-muted-foreground">{kpi.sub}</p>
              </Card>
            )
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">AI Tool Consumption</h2>
            </div>
            <Link href="/reports/tool-adoption" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Full report <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.8fr] gap-2 px-4 py-2 bg-muted/30 border-b text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Tool</span>
              <span className="text-right">Sessions</span>
              <span className="text-right">Prompts</span>
              <span className="text-right">Generations</span>
              <span className="text-right">Downloads</span>
              <span className="text-right">Users</span>
              <span>Capture Rate</span>
              <span className="text-right">Trend</span>
            </div>
            {TOOL_ROWS.map((tool, i) => (
              <div
                key={tool.name}
                className={cn(
                  'grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.8fr] gap-2 px-4 py-2.5 items-center text-xs',
                  i % 2 === 0 ? '' : 'bg-muted/10'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{tool.icon}</span>
                  <div>
                    <p className="font-medium text-xs">{tool.name}</p>
                    <p className="text-[9px] text-muted-foreground">{tool.cat}</p>
                  </div>
                </div>
                <span className="text-right tabular-nums">{tool.sessions.toLocaleString()}</span>
                <span className="text-right tabular-nums">{tool.prompts.toLocaleString()}</span>
                <span className="text-right tabular-nums">{tool.gens.toLocaleString()}</span>
                <span className="text-right tabular-nums">{tool.downloads.toLocaleString()}</span>
                <span className="text-right tabular-nums">{tool.users}</span>
                <div className="flex items-center gap-2">
                  <Progress value={tool.capture} className="h-1.5 flex-1" />
                  <span
                    className={cn(
                      'text-[10px] font-medium w-10 text-right tabular-nums',
                      tool.capture >= 97 ? 'text-emerald-600 dark:text-emerald-400' : tool.capture >= 94 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {tool.capture}%
                  </span>
                </div>
                <div
                  className={cn(
                    'flex items-center justify-end gap-0.5 text-[10px] font-medium',
                    tool.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  )}
                >
                  {tool.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {tool.trend}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.8fr] gap-2 px-4 py-2.5 border-t bg-muted/20 text-xs font-semibold">
              <span>Total (8 tools)</span>
              <span className="text-right tabular-nums">1,220</span>
              <span className="text-right tabular-nums">6,769</span>
              <span className="text-right tabular-nums">9,634</span>
              <span className="text-right tabular-nums">2,958</span>
              <span className="text-right tabular-nums">12</span>
              <div className="flex items-center gap-2">
                <Progress value={97.3} className="h-1.5 flex-1" />
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] w-10 text-right">97.3%</span>
              </div>
              <span />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Extension Capture Performance</h2>
            </div>
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="8" strokeDasharray={`${97.3 * 2.51} ${251.2}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">97.3%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium">Overall Capture Rate</p>
                  <p className="text-[10px] text-muted-foreground">14,892 of 15,305 events captured successfully</p>
                  <p className="text-[10px] text-muted-foreground">413 events missed (2.7%)</p>
                </div>
              </div>
              <div className="space-y-2">
                {CAPTURE_BREAKDOWN.map(m => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span>{m.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {m.captured.toLocaleString()}/{m.total.toLocaleString()}
                        </span>
                        <span
                          className={cn(
                            'font-medium',
                            m.rate >= 97 ? 'text-emerald-600 dark:text-emerald-400' : m.rate >= 94 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {m.rate}%
                        </span>
                      </span>
                    </div>
                    <Progress value={m.rate} className="h-1" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Coverage Gaps</h2>
              </div>
              <Card className="p-4 space-y-2">
                {COVERAGE_GAPS.map(gap => (
                  <div key={gap.tool} className="flex items-center gap-2 text-[10px] py-1">
                    <div
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        gap.severity === 'high' ? 'bg-red-500' : gap.severity === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                      )}
                    />
                    <span className="font-medium w-28 shrink-0">{gap.tool}</span>
                    <span className="flex-1 text-muted-foreground truncate">{gap.reason}</span>
                    <Badge variant="outline" className="text-[8px] h-4 shrink-0">{gap.missed} missed</Badge>
                  </div>
                ))}
              </Card>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Extension Status</h2>
              </div>
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {EXTENSION_STATUS.map(s => (
                    <div key={s.label} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Team Activity</h2>
          </div>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr_0.8fr_1fr] gap-2 px-4 py-2 bg-muted/30 border-b text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Team Member</span>
              <span className="text-right">Sessions</span>
              <span className="text-right">Prompts</span>
              <span className="text-right">Assets</span>
              <span className="text-right">Reviews</span>
              <span>Capture Rate</span>
              <span className="text-right">Workflows</span>
              <span>Last Active</span>
            </div>
            {TEAM_ROWS.map((member, i) => (
              <div
                key={member.name}
                className={cn(
                  'grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr_0.8fr_1fr] gap-2 px-4 py-2 items-center text-xs',
                  i % 2 === 0 ? '' : 'bg-muted/10'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0', member.color)}>
                      {member.avatar}
                    </div>
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-gray-900',
                        member.status === 'online' ? 'bg-emerald-500' : member.status === 'away' ? 'bg-amber-500' : 'bg-gray-400'
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-xs">{member.name}</p>
                    <p className="text-[9px] text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <span className="text-right tabular-nums">{member.sessions}</span>
                <span className="text-right tabular-nums">{member.prompts.toLocaleString()}</span>
                <span className="text-right tabular-nums">{member.assets}</span>
                <span className="text-right tabular-nums">{member.reviews}</span>
                <div className="flex items-center gap-2">
                  <Progress value={member.capture} className="h-1 flex-1" />
                  <span
                    className={cn(
                      'text-[10px] font-medium w-10 text-right tabular-nums',
                      member.capture >= 97 ? 'text-emerald-600 dark:text-emerald-400' : member.capture >= 94 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {member.capture}%
                  </span>
                </div>
                <span className="text-right tabular-nums">{member.workflows}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      member.status === 'online' ? 'bg-emerald-500' : member.status === 'away' ? 'bg-amber-500' : 'bg-gray-400'
                    )}
                  />
                  <span className="text-[10px] text-muted-foreground">{member.lastActive}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Quotas & Limits</h2>
            <Badge variant="outline" className="text-[9px]">Enterprise Plan</Badge>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {QUOTA_CARDS.map(q => {
              const pct = Math.round((q.used / q.limit) * 100)
              const QuotaIcon = q.icon
              return (
                <Card key={q.label} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', q.bg)}>
                      <QuotaIcon className={cn('h-3.5 w-3.5', q.color)} />
                    </div>
                    <span className="text-xs font-medium">{q.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">
                      {typeof q.used === 'number' && q.used > 999 ? q.used.toLocaleString() : q.used}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {typeof q.limit === 'number' && q.limit > 999 ? q.limit.toLocaleString() : q.limit} {q.unit}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5 mt-2" />
                  <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted-foreground">
                    <span>{pct}% used</span>
                    <span>
                      {typeof q.limit === 'number' && typeof q.used === 'number'
                        ? (q.limit - q.used).toLocaleString()
                        : Number(q.limit) - Number(q.used)}
                      {' '}
                      remaining
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {RATE_LIMITS.map(rl => (
              <Card key={rl.label} className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-medium">{rl.label}</span>
                    <Badge className="text-[8px] h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      {rl.status}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-bold">{rl.rate}</span>
                    <span className="text-[9px] text-muted-foreground">of {rl.limit}</span>
                  </div>
                  <Progress value={rl.pct} className="h-1 mt-1.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Actions by Type</p>
            <div className="space-y-2">
              {ACTIONS_BY_TYPE.map(a => (
                <div key={a.action} className="flex items-center gap-2 text-[10px]">
                  <span className="flex-1 truncate">{a.action}</span>
                  <span className="font-medium tabular-nums w-8 text-right">{a.count}</span>
                  <span className="text-muted-foreground w-8 text-right">{a.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Peak Activity Hours</p>
            <div className="space-y-1">
              {PEAK_HOURS.map(h => (
                <div key={h.hour} className="flex items-center gap-2 text-[10px]">
                  <span className="w-16 text-muted-foreground shrink-0">{h.hour}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${h.bar}%` }} />
                  </div>
                  <span className="w-6 text-right tabular-nums">{h.sessions}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Platforms & Devices</p>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-muted-foreground mb-1.5">Browser</p>
                <div className="space-y-1">
                  {BROWSERS.map(b => (
                    <div key={b.name} className="flex items-center gap-2 text-[10px]">
                      <span className="w-14">{b.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-[9px] text-muted-foreground mb-1.5">Device</p>
                <div className="space-y-1">
                  {DEVICES.map(d => {
                    const DeviceIcon = d.icon
                    return (
                      <div key={d.name} className="flex items-center gap-2 text-[10px]">
                        <DeviceIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="w-14">{d.name}</span>
                        <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{d.pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
