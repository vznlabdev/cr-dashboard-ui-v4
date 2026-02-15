"use client"

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Download, Bot, MessageSquare, Eye, Zap, ArrowUpRight, ArrowDownRight,
  Wifi, Clock, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { RadialBarChart, RadialBar } from 'recharts'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TOOL_DETAILS = [
  { name: 'Midjourney', icon: '🎨', category: 'Image', sessions: 312, prompts: 1847, generations: 4231, downloads: 892, users: 8, avgPerUser: 39, captureRate: 98.2, trend: '+12%', trendUp: true },
  { name: 'ChatGPT', icon: '💬', category: 'Text', sessions: 489, prompts: 3421, generations: 3421, downloads: 1204, users: 11, avgPerUser: 44, captureRate: 97.1, trend: '+8%', trendUp: true },
  { name: 'ElevenLabs', icon: '🎙️', category: 'Audio', sessions: 156, prompts: 423, generations: 423, downloads: 312, users: 4, avgPerUser: 39, captureRate: 96.8, trend: '+22%', trendUp: true },
  { name: 'Runway', icon: '🎬', category: 'Video', sessions: 89, prompts: 234, generations: 178, downloads: 134, users: 3, avgPerUser: 30, captureRate: 95.4, trend: '+15%', trendUp: true },
  { name: 'Suno AI', icon: '🎵', category: 'Audio', sessions: 67, prompts: 189, generations: 189, downloads: 87, users: 2, avgPerUser: 34, captureRate: 94.1, trend: '+31%', trendUp: true },
  { name: 'DALL-E', icon: '🖼️', category: 'Image', sessions: 45, prompts: 312, generations: 624, downloads: 198, users: 5, avgPerUser: 9, captureRate: 97.5, trend: '-3%', trendUp: false },
] as const

const DAILY_SESSIONS = [
  { day: 'Mon', sessions: 42 },
  { day: 'Tue', sessions: 56 },
  { day: 'Wed', sessions: 61 },
  { day: 'Thu', sessions: 48 },
  { day: 'Fri', sessions: 38 },
  { day: 'Sat', sessions: 8 },
  { day: 'Sun', sessions: 4 },
] as const

const KPI_CARDS = [
  { label: 'Total Sessions', value: '1,158', icon: Bot, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Total Prompts Captured', value: '6,426', icon: MessageSquare, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'Capture Rate', value: '97.3%', icon: Eye, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Active Tools', value: '6', icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
] as const

const EXTENSION_GAUGE_DATA = [{ name: 'Capture', value: 97.3, fill: '#10b981' }]

function captureRateColor(rate: number) {
  if (rate > 97) return 'bg-emerald-500'
  if (rate >= 94) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function ToolAdoptionPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

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
              <h1 className="text-xl font-bold">Tool Adoption</h1>
              <p className="text-xs text-muted-foreground">AI tool usage and extension capture performance</p>
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

        {/* Top KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {KPI_CARDS.map((kpi, i) => {
            const KpiIcon = kpi.icon
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", kpi.bg)}>
                    <KpiIcon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </Card>
            )
          })}
        </div>

        {/* Daily Sessions bar chart */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Daily Sessions</h3>
            <p className="text-[10px] text-muted-foreground">Extension sessions by day of week</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[...DAILY_SESSIONS]}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tool detail table — centerpiece */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Tool Details</h3>
            <p className="text-[10px] text-muted-foreground">Per-tool usage and capture rate</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2.5 font-medium">Tool</th>
                  <th className="text-left py-2.5 font-medium">Category</th>
                  <th className="text-right py-2.5 font-medium">Sessions</th>
                  <th className="text-right py-2.5 font-medium">Prompts</th>
                  <th className="text-right py-2.5 font-medium">Generations</th>
                  <th className="text-right py-2.5 font-medium">Downloads</th>
                  <th className="text-right py-2.5 font-medium">Users</th>
                  <th className="text-right py-2.5 font-medium">Capture Rate</th>
                  <th className="text-right py-2.5 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {TOOL_DETAILS.map(tool => (
                  <tr key={tool.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tool.icon}</span>
                        <span className="font-medium">{tool.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="text-[9px] font-normal">{tool.category}</Badge>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{tool.sessions.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">{tool.prompts.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">{tool.generations.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">{tool.downloads.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">{tool.users}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden bg-muted">
                          <div
                            className={cn("h-full rounded-full", captureRateColor(tool.captureRate))}
                            style={{ width: `${Math.min(tool.captureRate, 100)}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "w-10 text-right font-medium tabular-nums",
                            tool.captureRate > 97
                              ? "text-emerald-600 dark:text-emerald-400"
                              : tool.captureRate >= 94
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {tool.captureRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 font-medium",
                          tool.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {tool.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {tool.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Extension health panel */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Extension Health</h3>
            <p className="text-[10px] text-muted-foreground">Browser extension status and capture metrics</p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={EXTENSION_GAUGE_DATA}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={4} background />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-lg font-bold">97.3%</p>
                <p className="text-[10px] text-muted-foreground">Capture rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-lg font-bold">42</p>
                <p className="text-[10px] text-muted-foreground">Missed captures</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">2 min ago</p>
                <p className="text-[10px] text-muted-foreground">Last session</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
              <Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium">Connected</p>
                <p className="text-[10px] text-muted-foreground">Extension active</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
