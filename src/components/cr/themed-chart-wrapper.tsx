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
    }
  }

  const isDark = resolvedTheme === "dark"

  return {
    textColor: isDark ? "#d1d5db" : "#6b7280", // Light gray in dark, medium gray in light
    gridColor: isDark ? "#374151" : "#e5e7eb", // Visible grid in both
    tooltipBg: isDark ? "#1f2937" : "#ffffff",
    tooltipBorder: isDark ? "#374151" : "#e5e7eb",
    tooltipText: isDark ? "#f9fafb" : "#111827",
  }
}

