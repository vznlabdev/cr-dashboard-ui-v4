"use client"

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Shield, Download, AlertTriangle, CheckCircle2, ExternalLink,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const COMPLIANCE_TREND = [
  { date: 'Week 1', score: 87, flagged: 12 },
  { date: 'Week 2', score: 89, flagged: 9 },
  { date: 'Week 3', score: 91, flagged: 8 },
  { date: 'Week 4', score: 92, flagged: 7 },
  { date: 'Week 5', score: 93, flagged: 6 },
  { date: 'Week 6', score: 94, flagged: 6 },
]

const PROVENANCE_CHAIN = [
  { step: 'Creator Identified', complete: 98, total: 1247 },
  { step: 'Tool Captured', complete: 97, total: 1247 },
  { step: 'Model Recorded', complete: 96, total: 1247 },
  { step: 'Training Data Noted', complete: 89, total: 1247 },
  { step: 'Prompt Logged', complete: 95, total: 1247 },
  { step: 'Output Tracked', complete: 97, total: 1247 },
  { step: 'Copyright Checked', complete: 78, total: 1247 },
]

const RISK_BREAKDOWN = [
  { level: 'Low Risk', count: 1089, percent: 87.3, color: '#10b981' },
  { level: 'Medium Risk', count: 128, percent: 10.3, color: '#f59e0b' },
  { level: 'High Risk', count: 24, percent: 1.9, color: '#ef4444' },
  { level: 'Unchecked', count: 6, percent: 0.5, color: '#a1a1aa' },
]

const FLAGGED_ASSETS = [
  { id: 'vg-3', name: 'Product Hero Image', risk: 'high' as const, similarity: 89, project: 'Summer Campaign', tool: 'Midjourney' },
  { id: 'vg-7', name: 'Social Banner v2', risk: 'medium' as const, similarity: 62, project: 'TechStart Rebrand', tool: 'DALL-E' },
  { id: 'vg-12', name: 'Podcast Cover Art', risk: 'medium' as const, similarity: 58, project: 'Summer Campaign', tool: 'Midjourney' },
  { id: 'vg-15', name: 'Email Header', risk: 'high' as const, similarity: 84, project: 'TechStart Rebrand', tool: 'Midjourney' },
  { id: 'vg-18', name: 'Landing Page Hero', risk: 'medium' as const, similarity: 55, project: 'Summer Campaign', tool: 'Stable Diffusion' },
]

const SCORE_GAUGE_DATA = [{ name: 'Score', value: 94, fill: '#10b981' }]

function provenanceColor(pct: number) {
  if (pct >= 95) return 'bg-emerald-500'
  if (pct >= 80) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function ComplianceScorecardPage() {
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
              <h1 className="text-xl font-bold">Compliance Scorecard</h1>
              <p className="text-xs text-muted-foreground">Overall compliance posture across all assets</p>
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

        {/* Top row — 4 KPI cards */}
        <div className="grid grid-cols-4 gap-3">
          {/* Overall Score — radial gauge */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-medium text-muted-foreground">Overall Score</span>
            </div>
            <div className="h-24 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={96}>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={SCORE_GAUGE_DATA}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={4} background />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-2xl font-bold text-center -mt-14">94%</p>
          </Card>

          {/* Assets Checked */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-medium text-muted-foreground">Assets Checked</span>
            </div>
            <p className="text-2xl font-bold">1,241</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">/ 1,247 (99.5%)</p>
          </Card>

          {/* Flagged Assets */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-medium text-muted-foreground">Flagged Assets</span>
            </div>
            <p className="text-2xl font-bold">24</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">1.9% of total</p>
          </Card>

          {/* Avg Similarity */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-medium text-muted-foreground">Avg Similarity</span>
            </div>
            <p className="text-2xl font-bold">23%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">low risk</p>
          </Card>
        </div>

        {/* Two-column: Compliance Trend + Risk Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Compliance Trend</h3>
              <p className="text-[10px] text-muted-foreground">Score over time</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={COMPLIANCE_TREND}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Risk Distribution</h3>
              <p className="text-[10px] text-muted-foreground">By risk level</p>
            </div>
            <div className="space-y-2">
              {RISK_BREAKDOWN.map(row => (
                <div key={row.level} className="flex items-center gap-3">
                  <span className="text-xs w-24 shrink-0">{row.level}</span>
                  <div className="flex-1 h-6 rounded overflow-hidden bg-muted flex">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${row.percent}%`, backgroundColor: row.color }}
                    />
                  </div>
                  <span className="text-[10px] font-medium w-12 text-right">{row.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 7-Point Provenance Chain */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">7-Point Provenance Chain</h3>
            <p className="text-[10px] text-muted-foreground">Completion % per step</p>
          </div>
          <div className="space-y-3">
            {PROVENANCE_CHAIN.map(row => {
              const pct = row.total > 0 ? Math.round((row.complete / row.total) * 100) : 0
              return (
                <div key={row.step} className="flex items-center gap-3">
                  <span className="text-xs w-40 shrink-0">{row.step}</span>
                  <div className="flex-1 max-w-md h-2 rounded-full overflow-hidden bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", provenanceColor(pct))}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-16 text-right">
                    {row.complete} / {row.total} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Flagged Assets table */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Flagged Assets</h3>
            <p className="text-[10px] text-muted-foreground">Assets requiring review</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Asset</th>
                  <th className="text-left py-2 font-medium">Risk</th>
                  <th className="text-right py-2 font-medium">Similarity</th>
                  <th className="text-left py-2 font-medium">Project</th>
                  <th className="text-left py-2 font-medium">Tool</th>
                  <th className="text-right py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {FLAGGED_ASSETS.map(asset => (
                  <tr key={asset.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{asset.name}</td>
                    <td className="py-2.5">
                      <Badge
                        className={cn(
                          "text-[9px]",
                          asset.risk === 'high'
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}
                      >
                        {asset.risk}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right">{asset.similarity}%</td>
                    <td className="py-2.5 text-muted-foreground">{asset.project}</td>
                    <td className="py-2.5 text-muted-foreground">{asset.tool}</td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/creative/assets/${asset.id}/review`}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Review <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
