"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useChartTheme() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      textColor: "#9ca3af",
      gridColor: "#374151",
      tooltipBg: "#1f2937",
      tooltipBorder: "#374151",
      tooltipText: "#f9fafb",
      chart1: "oklch(0.55 0.15 260)",
      chart2: "oklch(0.60 0.18 280)",
      chart3: "oklch(0.65 0.16 240)",
      chart4: "oklch(0.62 0.14 300)",
      chart5: "oklch(0.68 0.12 200)",
    }
  }

  const isDark = resolvedTheme === "dark"

  // Use new blue-purple color system
  const chart1 = isDark ? "oklch(0.65 0.18 270)" : "oklch(0.55 0.15 260)"
  const chart2 = isDark ? "oklch(0.70 0.20 280)" : "oklch(0.60 0.18 280)"
  const chart3 = isDark ? "oklch(0.68 0.17 240)" : "oklch(0.65 0.16 240)"
  const chart4 = isDark ? "oklch(0.72 0.16 300)" : "oklch(0.62 0.14 300)"
  const chart5 = isDark ? "oklch(0.75 0.14 200)" : "oklch(0.68 0.12 200)"

  return {
    textColor: isDark ? "#d1d5db" : "#6b7280",
    gridColor: isDark ? "#374151" : "#e5e7eb",
    tooltipBg: isDark ? "rgba(30, 30, 45, 0.95)" : "rgba(255, 255, 255, 0.95)", // Glassmorphism ready
    tooltipBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    tooltipText: isDark ? "#f9fafb" : "#111827",
    chart1,
    chart2,
    chart3,
    chart4,
    chart5,
  }
}

