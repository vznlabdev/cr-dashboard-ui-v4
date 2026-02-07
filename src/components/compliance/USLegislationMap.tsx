"use client"

import { useState, useMemo } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { cn } from "@/lib/utils"
import type { JurisdictionProfile } from "@/types/compliance"

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

// FIPS to state code mapping
const fipsToState: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE",
  "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM",
  "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY",
}

interface USLegislationMapProps {
  jurisdictions: JurisdictionProfile[]
  onStateClick?: (stateCode: string) => void
  selectedState?: string | null
  height?: number
  showLegend?: boolean
  showCounters?: boolean
}

function getStateColor(profile: JurisdictionProfile | undefined): string {
  if (!profile || profile.legislationStatus === "NONE") return "var(--color-muted, #f1f5f9)"
  if (profile.legislationStatus === "ENACTED") {
    if (profile.enforcementIntensity === "Very High" || profile.enforcementIntensity === "High") return "#ea580c"
    return "#f97316"
  }
  if (profile.legislationStatus === "PROPOSED" || profile.legislationStatus === "IN_COMMITTEE") return "#eab308"
  return "var(--color-muted, #f1f5f9)"
}

export function USLegislationMap({
  jurisdictions,
  onStateClick,
  selectedState,
  height = 420,
  showLegend = true,
  showCounters = true,
}: USLegislationMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  const profileMap = useMemo(() => {
    const map = new Map<string, JurisdictionProfile>()
    jurisdictions.forEach((j) => map.set(j.stateCode, j))
    return map
  }, [jurisdictions])

  const counts = useMemo(() => {
    const enacted = jurisdictions.filter((j) => j.legislationStatus === "ENACTED").length
    const pending = jurisdictions.filter((j) => j.legislationStatus === "PROPOSED" || j.legislationStatus === "IN_COMMITTEE").length
    const none = jurisdictions.filter((j) => j.legislationStatus === "NONE").length
    return { enacted, pending, none }
  }, [jurisdictions])

  const hoveredProfile = hoveredState ? profileMap.get(hoveredState) : null

  return (
    <div className="relative w-full rounded-md border border-border/40 bg-background overflow-hidden" style={{ height }}>
      {/* Counter badges */}
      {showCounters && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600">
            {counts.enacted} enacted
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-[11px] font-medium text-yellow-600">
            {counts.pending} pending
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {counts.none} none
          </span>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredProfile && (
        <div className="absolute top-3 left-3 z-10 rounded-md border border-border/60 bg-background/95 backdrop-blur-sm px-3 py-2 shadow-sm max-w-[220px]">
          <div className="text-[12px] font-semibold">{hoveredProfile.state} ({hoveredProfile.stateCode})</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {hoveredProfile.lawCategories.length} active law{hoveredProfile.lawCategories.length !== 1 ? "s" : ""}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Multiplier: <span className="font-mono font-medium text-foreground">{hoveredProfile.multiplier}x</span>
          </div>
        </div>
      )}

      {/* Map */}
      <ComposableMap
        projection="geoAlbersUsa"
        width={960}
        height={height - 10}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = geo.id as string
              const stateCode = fipsToState[fips]
              const profile = stateCode ? profileMap.get(stateCode) : undefined
              const fill = getStateColor(profile)
              const isHovered = stateCode === hoveredState
              const isSelected = stateCode === selectedState

              return (
                <Geography
                  key={geo.rpiKey}
                  geography={geo}
                  fill={fill}
                  stroke="var(--color-border, #e2e8f0)"
                  strokeWidth={isHovered || isSelected ? 1.5 : 0.5}
                  style={{
                    default: { outline: "none", opacity: isSelected ? 1 : 0.9 },
                    hover: { outline: "none", opacity: 1, cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={() => stateCode && setHoveredState(stateCode)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => stateCode && onStateClick?.(stateCode)}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#ea580c" }} /> Enacted (high enforcement)</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#f97316" }} /> Enacted (moderate)</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#eab308" }} /> Proposed/Pending</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted border border-border/40" /> No legislation</span>
        </div>
      )}
    </div>
  )
}
