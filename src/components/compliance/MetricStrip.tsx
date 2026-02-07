"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricItem {
  label: string
  value: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

interface MetricStripProps {
  metrics: MetricItem[]
}

export function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <div className="flex items-center w-full rounded-md border border-border/40 bg-background divide-x divide-border/40 overflow-x-auto">
      {metrics.map((metric, i) => (
        <div key={i} className="flex-1 min-w-[120px] flex flex-col items-center justify-center py-2 px-3">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold font-mono tracking-tight">{metric.value}</span>
            {metric.trend && metric.trend !== "neutral" && (
              <span className={cn("flex items-center text-[10px]", metric.trend === "up" ? "text-emerald-500" : "text-red-500")}>
                {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {metric.trendValue && <span className="ml-0.5">{metric.trendValue}</span>}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">{metric.label}</span>
        </div>
      ))}
    </div>
  )
}
