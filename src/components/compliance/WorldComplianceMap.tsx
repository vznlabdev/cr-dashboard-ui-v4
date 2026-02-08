"use client"

import { useState, useMemo } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import type { CountryJurisdictionProfile } from "@/types/compliance"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// ISO 3166-1 numeric → alpha-2 mapping for countries we track
const numericToAlpha2: Record<string, string> = {
  // Europe
  "040": "AT", "056": "BE", "100": "BG", "191": "HR", "196": "CY", "203": "CZ",
  "208": "DK", "233": "EE", "246": "FI", "250": "FR", "276": "DE", "300": "GR",
  "348": "HU", "372": "IE", "380": "IT", "428": "LV", "440": "LT", "442": "LU",
  "470": "MT", "528": "NL", "616": "PL", "620": "PT", "642": "RO", "703": "SK",
  "705": "SI", "724": "ES", "752": "SE", "826": "GB", "578": "NO", "756": "CH",
  // Asia-Pacific
  "156": "CN", "410": "KR", "392": "JP", "702": "SG", "356": "IN", "036": "AU",
  "554": "NZ", "158": "TW", "608": "PH", "764": "TH", "360": "ID", "458": "MY",
  "704": "VN",
  // Middle East
  "784": "AE", "682": "SA", "376": "IL", "792": "TR",
  // Americas
  "124": "CA", "076": "BR", "484": "MX", "152": "CL", "840": "US",
  "170": "CO", "032": "AR", "604": "PE",
  // Africa
  "710": "ZA", "566": "NG", "404": "KE",
}

// Map EU member state alpha-2 codes to "EU" for country profiles that use the EU code
const euMemberStates = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
])

// 5-tier color palette aligned with the app's design system
const MAP_COLORS = {
  enactedVeryHigh: "oklch(0.58 0.22 25)",   // red — matches --destructive
  enactedHigh:     "oklch(0.62 0.20 25)",    // warm red-orange
  enactedMedium:   "oklch(0.70 0.16 55)",    // amber — matches warning badges
  enactedLow:      "oklch(0.75 0.14 85)",    // soft gold
  proposed:        "oklch(0.65 0.16 240)",    // cyan-blue — matches --chart-3
  none:            "var(--color-muted, #f1f5f9)",
}

interface WorldComplianceMapProps {
  jurisdictions: CountryJurisdictionProfile[]
  onCountryClick?: (countryCode: string) => void
  selectedCountry?: string | null
  height?: number
  showLegend?: boolean
  showCounters?: boolean
}

function getCountryColor(profile: CountryJurisdictionProfile | undefined): string {
  if (!profile || profile.legislationStatus === "NONE") return MAP_COLORS.none
  if (profile.legislationStatus === "ENACTED") {
    if (profile.enforcementIntensity === "Very High") return MAP_COLORS.enactedVeryHigh
    if (profile.enforcementIntensity === "High") return MAP_COLORS.enactedHigh
    if (profile.enforcementIntensity === "Medium") return MAP_COLORS.enactedMedium
    return MAP_COLORS.enactedLow
  }
  if (profile.legislationStatus === "PROPOSED" || profile.legislationStatus === "IN_COMMITTEE") return MAP_COLORS.proposed
  return MAP_COLORS.none
}

export function WorldComplianceMap({
  jurisdictions,
  onCountryClick,
  selectedCountry,
  height = 420,
  showLegend = true,
  showCounters = true,
}: WorldComplianceMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const profileMap = useMemo(() => {
    const map = new Map<string, CountryJurisdictionProfile>()
    jurisdictions.forEach((j) => map.set(j.countryCode, j))
    return map
  }, [jurisdictions])

  const counts = useMemo(() => {
    const enacted = jurisdictions.filter((j) => j.legislationStatus === "ENACTED").length
    const pending = jurisdictions.filter((j) => j.legislationStatus === "PROPOSED" || j.legislationStatus === "IN_COMMITTEE").length
    const none = jurisdictions.filter((j) => j.legislationStatus === "NONE").length
    return { enacted, pending, none }
  }, [jurisdictions])

  // Resolve a country alpha-2 code to a profile, including EU fallback for member states
  function resolveProfile(alpha2: string): CountryJurisdictionProfile | undefined {
    const direct = profileMap.get(alpha2)
    if (direct) return direct
    if (euMemberStates.has(alpha2)) return profileMap.get("EU")
    return undefined
  }

  // Resolve which code to use for click/hover callbacks
  function resolveCode(alpha2: string): string {
    if (profileMap.has(alpha2)) return alpha2
    if (euMemberStates.has(alpha2) && profileMap.has("EU")) return "EU"
    return alpha2
  }

  const hoveredProfile = hoveredCountry ? resolveProfile(hoveredCountry) : null
  const hoveredDisplayCode = hoveredCountry ? resolveCode(hoveredCountry) : null

  return (
    <div className="relative w-full rounded-md border border-border/40 bg-background overflow-hidden" style={{ height }}>
      {/* Counter badges */}
      {showCounters && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
            {counts.enacted} enacted
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
            {counts.pending} pending
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {counts.none} none
          </span>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredProfile && (
        <div className="absolute top-3 left-3 z-10 rounded-md border border-border/60 bg-background/95 backdrop-blur-sm px-3 py-2 shadow-sm max-w-[260px]">
          <div className="text-[12px] font-semibold">{hoveredProfile.countryName} ({hoveredDisplayCode})</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{hoveredProfile.region}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {hoveredProfile.lawCategories.length} active law{hoveredProfile.lawCategories.length !== 1 ? "s" : ""}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Enforcement: <span className="font-medium text-foreground">{hoveredProfile.enforcementIntensity}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Multiplier: <span className="font-mono font-medium text-foreground">{hoveredProfile.multiplier}x</span>
          </div>
        </div>
      )}

      {/* Map */}
      <ComposableMap
        projection="geoEqualEarth"
        width={960}
        height={height - 10}
        projectionConfig={{ scale: 160 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[10, 20]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo, geoIndex) => {
                const numericId = geo.id as string
                const alpha2 = numericToAlpha2[numericId]
                const profile = alpha2 ? resolveProfile(alpha2) : undefined
                const code = alpha2 ? resolveCode(alpha2) : undefined
                const fill = getCountryColor(profile)
                const isHovered = code === (hoveredCountry ? resolveCode(hoveredCountry) : null)
                const isSelected = code === selectedCountry

                return (
                  <Geography
                    key={`${numericId}-${geoIndex}`}
                    geography={geo}
                    fill={fill}
                    stroke="var(--color-border, #e2e8f0)"
                    strokeWidth={isHovered || isSelected ? 1.2 : 0.3}
                    style={{
                      default: { outline: "none", opacity: isSelected ? 1 : 0.9 },
                      hover: { outline: "none", opacity: 1, cursor: alpha2 ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={() => alpha2 && setHoveredCountry(alpha2)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => code && onCountryClick?.(code)}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: MAP_COLORS.enactedVeryHigh }} /> Very High</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: MAP_COLORS.enactedHigh }} /> High</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: MAP_COLORS.enactedMedium }} /> Medium</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: MAP_COLORS.enactedLow }} /> Low</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: MAP_COLORS.proposed }} /> Proposed</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted border border-border/40" /> None</span>
        </div>
      )}
    </div>
  )
}
