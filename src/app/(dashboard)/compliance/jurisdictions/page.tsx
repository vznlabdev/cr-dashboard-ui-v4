"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { ComplianceLayout } from "@/components/compliance/ComplianceLayout"
import { USLegislationMap } from "@/components/compliance/USLegislationMap"
import { WorldComplianceMap } from "@/components/compliance/WorldComplianceMap"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Search, Bell, FileText, Globe, Flag } from "lucide-react"
import { getJurisdictions, getLegislationNews, calculateMultiStateRisk, getCountryJurisdictions, getGlobalLegislationNews } from "@/lib/compliance/api"
import type { JurisdictionProfile, LegislationNewsItem, RiskClass, CountryJurisdictionProfile, GlobalLegislationNewsItem } from "@/types/compliance"

const enforcementColors: Record<string, string> = {
  "Very High": "text-red-600 bg-red-500/10",
  High: "text-orange-600 bg-orange-500/10",
  Medium: "text-amber-600 bg-amber-500/10",
  Low: "text-slate-600 bg-slate-500/10",
  None: "text-slate-400 bg-slate-200/50",
}

const newsCategories: Record<string, string> = {
  NEW_LAW: "text-emerald-600 bg-emerald-500/10",
  AMENDMENT: "text-blue-600 bg-blue-500/10",
  PROPOSED: "text-amber-600 bg-amber-500/10",
  ENFORCEMENT_ACTION: "text-red-600 bg-red-500/10",
}

type MapView = "world" | "us"

export default function JurisdictionsPage() {
  const [mapView, setMapView] = useState<MapView>("world")
  // US data
  const [jurisdictions, setJurisdictions] = useState<JurisdictionProfile[]>([])
  const [news, setNews] = useState<LegislationNewsItem[]>([])
  const [selectedState, setSelectedState] = useState<string | null>(null)
  // Global data
  const [countryJurisdictions, setCountryJurisdictions] = useState<CountryJurisdictionProfile[]>([])
  const [globalNews, setGlobalNews] = useState<GlobalLegislationNewsItem[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  // Shared UI state
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [newsFilter, setNewsFilter] = useState<string | null>(null)
  const [penaltyTableOpen, setPenaltyTableOpen] = useState(false)
  const [penaltySearch, setPenaltySearch] = useState("")
  // US calculator state
  const [calcStates, setCalcStates] = useState<string[]>([])
  const [calcContentType, setCalcContentType] = useState("AI-generated ad")
  const [calcResult, setCalcResult] = useState<{ combinedPenaltyExposure: string; recommendedMultiplier: number; riskLevel: RiskClass } | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    getJurisdictions().then(setJurisdictions)
    getLegislationNews().then(setNews)
    getCountryJurisdictions().then(setCountryJurisdictions)
    getGlobalLegislationNews().then(setGlobalNews)
  }, [])

  // US detailed states
  const detailedStates = useMemo(
    () => jurisdictions.filter((j) => j.legislationStatus !== "NONE" && j.lawCategories.length > 0),
    [jurisdictions]
  )

  // Global detailed countries
  const detailedCountries = useMemo(
    () => countryJurisdictions.filter((j) => j.legislationStatus !== "NONE" && j.lawCategories.length > 0),
    [countryJurisdictions]
  )

  // Filtered news (US or global based on view)
  const filteredNews = useMemo(() => {
    if (mapView === "us") {
      let result = [...news]
      if (newsFilter) result = result.filter((n) => n.category === newsFilter)
      return result
    } else {
      let result = [...globalNews]
      if (newsFilter) result = result.filter((n) => n.category === newsFilter)
      return result
    }
  }, [mapView, news, globalNews, newsFilter])

  // Filtered penalty table data
  const filteredPenaltyStates = useMemo(() => {
    if (!penaltySearch) return jurisdictions
    const q = penaltySearch.toLowerCase()
    return jurisdictions.filter((j) => j.state.toLowerCase().includes(q) || j.stateCode.toLowerCase().includes(q))
  }, [jurisdictions, penaltySearch])

  const filteredPenaltyCountries = useMemo(() => {
    if (!penaltySearch) return countryJurisdictions
    const q = penaltySearch.toLowerCase()
    return countryJurisdictions.filter((j) => j.countryName.toLowerCase().includes(q) || j.countryCode.toLowerCase().includes(q))
  }, [countryJurisdictions, penaltySearch])

  function handleMapStateClick(code: string) {
    setSelectedState(code)
    const el = cardRefs.current.get(code)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      setExpandedCards((prev) => new Set(prev).add(code))
    }
  }

  function handleMapCountryClick(code: string) {
    setSelectedCountry(code)
    const el = cardRefs.current.get(code)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      setExpandedCards((prev) => new Set(prev).add(code))
    }
  }

  async function runCalc() {
    if (calcStates.length === 0) return
    const result = await calculateMultiStateRisk(calcStates, calcContentType)
    setCalcResult({ combinedPenaltyExposure: result.combinedPenaltyExposure, recommendedMultiplier: result.recommendedMultiplier, riskLevel: result.riskLevel })
  }

  function toggleCalcState(code: string) {
    setCalcStates((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code])
  }

  return (
    <ComplianceLayout title="Jurisdictions">
      {/* Map View Toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/30 p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setMapView("world")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all",
            mapView === "world"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="h-3.5 w-3.5" />
          World
        </button>
        <button
          type="button"
          onClick={() => setMapView("us")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all",
            mapView === "us"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Flag className="h-3.5 w-3.5" />
          United States
        </button>
      </div>

      {/* Interactive Map */}
      {mapView === "world" ? (
        <WorldComplianceMap
          jurisdictions={countryJurisdictions}
          onCountryClick={handleMapCountryClick}
          selectedCountry={selectedCountry}
          height={400}
        />
      ) : (
        <USLegislationMap
          jurisdictions={jurisdictions}
          onStateClick={handleMapStateClick}
          selectedState={selectedState}
          height={400}
        />
      )}

      {/* Detail Cards */}
      {mapView === "us" ? (
        <div>
          <div className="text-[13px] font-medium mb-2">States with AI Content Legislation ({detailedStates.length})</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {detailedStates.map((j) => {
              const isExpanded = expandedCards.has(j.stateCode)
              return (
                <div
                  key={j.stateCode}
                  ref={(el) => { if (el) cardRefs.current.set(j.stateCode, el) }}
                  className={cn(
                    "rounded-md border border-border/40 p-3 transition-all",
                    selectedState === j.stateCode && "ring-1 ring-orange-500/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{j.state}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{j.stateCode}</span>
                    </div>
                    <span className="text-base font-mono font-semibold">{j.multiplier}x</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {j.lawCategories.map((cat) => (
                      <span key={cat} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground">
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", enforcementColors[j.enforcementIntensity])}>
                      {j.enforcementIntensity}
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      j.legislationStatus === "ENACTED" ? "text-emerald-600 bg-emerald-500/10" :
                        j.legislationStatus === "PROPOSED" ? "text-amber-600 bg-amber-500/10" :
                          "text-slate-500 bg-slate-500/10"
                    )}>
                      {j.legislationStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedCards((prev) => {
                      const next = new Set(prev)
                      next.has(j.stateCode) ? next.delete(j.stateCode) : next.add(j.stateCode)
                      return next
                    })}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isExpanded ? "Less" : "More details"}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-border/30 space-y-1.5 text-[11px]">
                      <div className="flex justify-between"><span className="text-muted-foreground">AI Ad Penalty</span><span className="font-mono text-right max-w-[180px]">{j.aiAdPenalty}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">NIL Penalty</span><span className="font-mono text-right max-w-[180px]">{j.nilPenalty}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Deepfake Penalty</span><span className="font-mono text-right max-w-[180px]">{j.deepfakePenalty}</span></div>
                      {j.effectiveDate && <div className="flex justify-between"><span className="text-muted-foreground">Effective Date</span><span>{j.effectiveDate}</span></div>}
                      {j.statuteReference && <div className="flex justify-between"><span className="text-muted-foreground">Statute</span><span className="font-mono text-right max-w-[180px]">{j.statuteReference}</span></div>}
                      {j.summary && <p className="text-muted-foreground mt-1 leading-relaxed">{j.summary}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-[13px] font-medium mb-2">Countries with AI Content Legislation ({detailedCountries.length})</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {detailedCountries.map((j) => {
              const isExpanded = expandedCards.has(j.countryCode)
              return (
                <div
                  key={j.countryCode}
                  ref={(el) => { if (el) cardRefs.current.set(j.countryCode, el) }}
                  className={cn(
                    "rounded-md border border-border/40 p-3 transition-all",
                    selectedCountry === j.countryCode && "ring-1 ring-orange-500/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{j.countryName}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{j.countryCode}</span>
                    </div>
                    <span className="text-base font-mono font-semibold">{j.multiplier}x</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1.5">{j.region}</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {j.lawCategories.map((cat) => (
                      <span key={cat} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground">
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", enforcementColors[j.enforcementIntensity])}>
                      {j.enforcementIntensity}
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      j.legislationStatus === "ENACTED" ? "text-emerald-600 bg-emerald-500/10" :
                        j.legislationStatus === "PROPOSED" ? "text-amber-600 bg-amber-500/10" :
                          "text-slate-500 bg-slate-500/10"
                    )}>
                      {j.legislationStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedCards((prev) => {
                      const next = new Set(prev)
                      next.has(j.countryCode) ? next.delete(j.countryCode) : next.add(j.countryCode)
                      return next
                    })}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isExpanded ? "Less" : "More details"}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-border/30 space-y-1.5 text-[11px]">
                      <div className="flex justify-between"><span className="text-muted-foreground">AI Ad Penalty</span><span className="font-mono text-right max-w-[180px]">{j.aiAdPenalty}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">NIL Penalty</span><span className="font-mono text-right max-w-[180px]">{j.nilPenalty}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Deepfake Penalty</span><span className="font-mono text-right max-w-[180px]">{j.deepfakePenalty}</span></div>
                      {j.effectiveDate && <div className="flex justify-between"><span className="text-muted-foreground">Effective Date</span><span>{j.effectiveDate}</span></div>}
                      {j.statuteReference && <div className="flex justify-between"><span className="text-muted-foreground">Statute</span><span className="font-mono text-right max-w-[180px]">{j.statuteReference}</span></div>}
                      {j.summary && <p className="text-muted-foreground mt-1 leading-relaxed">{j.summary}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legislation News Feed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium">
            {mapView === "world" ? "Global AI Content Legislation News" : "AI Content Legislation News"}
          </span>
          <div className="flex items-center gap-1">
            {(["NEW_LAW", "AMENDMENT", "PROPOSED", "ENFORCEMENT_ACTION"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewsFilter(newsFilter === cat ? null : cat)}
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                  newsFilter === cat ? newsCategories[cat] : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {filteredNews.map((item) => {
            const code = mapView === "us" ? (item as LegislationNewsItem).stateCode : (item as GlobalLegislationNewsItem).countryCode
            const category = item.category
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="font-mono text-[11px] font-medium text-foreground/80 mt-0.5 w-6 shrink-0">{code}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium leading-snug">{item.headline}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.summary}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium", newsCategories[category])}>
                    {category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Multi-State Campaign Risk Calculator (US view only) */}
      {mapView === "us" && (
        <div className="rounded-md border border-border/40 p-3">
          <div className="text-[13px] font-medium mb-2">Multi-State Campaign Risk Calculator</div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[11px] text-muted-foreground mb-1">Select states for campaign</div>
              <div className="flex flex-wrap gap-1">
                {["NY", "CA", "TX", "FL", "IL", "MA", "TN", "WA", "GA", "CO"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleCalcState(code)}
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-mono transition-colors border",
                      calcStates.includes(code)
                        ? "border-foreground/30 bg-foreground/5 text-foreground font-medium"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground mb-1">Content type</div>
              <select
                value={calcContentType}
                onChange={(e) => setCalcContentType(e.target.value)}
                className="rounded-md border border-border/60 px-2 py-1 text-[12px] bg-background"
              >
                <option>AI-generated ad</option>
                <option>Synthetic performer</option>
                <option>NIL usage</option>
                <option>Deepfake</option>
                <option>Mixed</option>
              </select>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={runCalc} disabled={calcStates.length === 0}>
              Calculate Risk
            </Button>
          </div>
          {calcResult && (
            <div className="mt-3 pt-3 border-t border-border/30 flex gap-6 text-[12px]">
              <div><span className="text-muted-foreground">Penalty Exposure:</span> <span className="font-medium">{calcResult.combinedPenaltyExposure}</span></div>
              <div><span className="text-muted-foreground">Recommended Multiplier:</span> <span className="font-mono font-semibold">{calcResult.recommendedMultiplier}x</span></div>
              <div><span className="text-muted-foreground">Risk Level:</span> <span className="font-medium">{calcResult.riskLevel}</span></div>
            </div>
          )}
        </div>
      )}

      {/* Reference Table (collapsible) */}
      <div className="rounded-md border border-border/40">
        <button
          type="button"
          onClick={() => setPenaltyTableOpen(!penaltyTableOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium hover:bg-muted/30 transition-colors"
        >
          <span>{mapView === "us" ? "Penalty Reference Table (All 50 States)" : "Global Jurisdiction Reference Table"}</span>
          {penaltyTableOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {penaltyTableOpen && (
          <div className="border-t border-border/30">
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={mapView === "us" ? "Search states..." : "Search countries..."}
                  value={penaltySearch}
                  onChange={(e) => setPenaltySearch(e.target.value)}
                  className="w-full rounded-md border border-border/60 pl-7 pr-3 py-1 text-[12px] bg-background placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              {mapView === "us" ? (
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-background">
                    <tr className="text-muted-foreground text-left border-b border-border/30">
                      <th className="px-3 py-1.5 font-medium">State</th>
                      <th className="px-3 py-1.5 font-medium">Law Categories</th>
                      <th className="px-3 py-1.5 font-medium">AI Ad Penalty</th>
                      <th className="px-3 py-1.5 font-medium">NIL Penalty</th>
                      <th className="px-3 py-1.5 font-medium">Deepfake Penalty</th>
                      <th className="px-3 py-1.5 font-medium">Enforcement</th>
                      <th className="px-3 py-1.5 font-medium text-right">Multiplier</th>
                      <th className="px-3 py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPenaltyStates.map((j) => (
                      <tr key={j.stateCode} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-1.5 font-medium whitespace-nowrap">{j.state} <span className="text-muted-foreground font-mono">({j.stateCode})</span></td>
                        <td className="px-3 py-1.5">
                          <div className="flex flex-wrap gap-0.5">
                            {j.lawCategories.length > 0 ? j.lawCategories.map((c) => (
                              <span key={c} className="inline-flex rounded-full px-1 py-0.5 text-[8px] bg-muted text-muted-foreground">{c.replace(/_/g, " ")}</span>
                            )) : <span className="text-muted-foreground">&mdash;</span>}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 font-mono">{j.aiAdPenalty}</td>
                        <td className="px-3 py-1.5 font-mono">{j.nilPenalty}</td>
                        <td className="px-3 py-1.5 font-mono">{j.deepfakePenalty}</td>
                        <td className="px-3 py-1.5">
                          <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium", enforcementColors[j.enforcementIntensity])}>
                            {j.enforcementIntensity}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-medium">{j.multiplier}x</td>
                        <td className="px-3 py-1.5">
                          <span className={cn(
                            "inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                            j.legislationStatus === "ENACTED" ? "text-emerald-600 bg-emerald-500/10" :
                              j.legislationStatus === "PROPOSED" ? "text-amber-600 bg-amber-500/10" :
                                j.legislationStatus === "IN_COMMITTEE" ? "text-blue-600 bg-blue-500/10" :
                                  "text-slate-400 bg-slate-200/50"
                          )}>
                            {j.legislationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-background">
                    <tr className="text-muted-foreground text-left border-b border-border/30">
                      <th className="px-3 py-1.5 font-medium">Country</th>
                      <th className="px-3 py-1.5 font-medium">Region</th>
                      <th className="px-3 py-1.5 font-medium">Law Categories</th>
                      <th className="px-3 py-1.5 font-medium">AI Ad Penalty</th>
                      <th className="px-3 py-1.5 font-medium">Deepfake Penalty</th>
                      <th className="px-3 py-1.5 font-medium">Enforcement</th>
                      <th className="px-3 py-1.5 font-medium text-right">Multiplier</th>
                      <th className="px-3 py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPenaltyCountries.map((j) => (
                      <tr key={j.countryCode} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-1.5 font-medium whitespace-nowrap">{j.countryName} <span className="text-muted-foreground font-mono">({j.countryCode})</span></td>
                        <td className="px-3 py-1.5 text-muted-foreground">{j.region}</td>
                        <td className="px-3 py-1.5">
                          <div className="flex flex-wrap gap-0.5">
                            {j.lawCategories.length > 0 ? j.lawCategories.map((c) => (
                              <span key={c} className="inline-flex rounded-full px-1 py-0.5 text-[8px] bg-muted text-muted-foreground">{c.replace(/_/g, " ")}</span>
                            )) : <span className="text-muted-foreground">&mdash;</span>}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 font-mono">{j.aiAdPenalty}</td>
                        <td className="px-3 py-1.5 font-mono">{j.deepfakePenalty}</td>
                        <td className="px-3 py-1.5">
                          <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium", enforcementColors[j.enforcementIntensity])}>
                            {j.enforcementIntensity}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-medium">{j.multiplier}x</td>
                        <td className="px-3 py-1.5">
                          <span className={cn(
                            "inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                            j.legislationStatus === "ENACTED" ? "text-emerald-600 bg-emerald-500/10" :
                              j.legislationStatus === "PROPOSED" ? "text-amber-600 bg-amber-500/10" :
                                j.legislationStatus === "IN_COMMITTEE" ? "text-blue-600 bg-blue-500/10" :
                                  "text-slate-400 bg-slate-200/50"
                          )}>
                            {j.legislationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </ComplianceLayout>
  )
}
