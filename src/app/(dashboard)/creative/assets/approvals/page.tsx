"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PageContainer } from "@/components/layout/PageContainer"
import { CopyrightCheckReview } from "@/components/creative"
import { mockAssets, mockBrands } from "@/lib/mock-data/creative"
import { Asset } from "@/types/creative"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  AlertTriangle,
  Sparkles,
  Eye,
  Palette,
  Zap,
  ShieldCheck,
  FileBarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useCopyrightCredits } from "@/lib/contexts/copyright-credits-context"
import { ScoreBadge } from "@/components/creative/ScoreBadge"

export default function AssetApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("risk")
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [reviewAsset, setReviewAsset] = useState<Asset | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { credits, getTotalAvailable } = useCopyrightCredits()

  // Get pending approval assets
  const pendingAssets = useMemo(() => {
    return mockAssets.filter(
      (asset) =>
        asset.approvalStatus === "pending" &&
        asset.copyrightCheckStatus === "completed" &&
        asset.copyrightCheckData
    )
  }, [])

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = pendingAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.brandName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBrand = brandFilter === "all" || asset.brandId === brandFilter
      const matchesRisk =
        riskFilter === "all" ||
        (riskFilter === "low" && asset.copyrightCheckData?.riskBreakdown.riskLevel === "low") ||
        (riskFilter === "medium" && asset.copyrightCheckData?.riskBreakdown.riskLevel === "medium") ||
        (riskFilter === "high" && asset.copyrightCheckData?.riskBreakdown.riskLevel === "high")
      return matchesSearch && matchesBrand && matchesRisk
    })

    // Sort assets
    if (sortBy === "risk") {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      filtered.sort((a, b) => {
        const aRisk = a.copyrightCheckData?.riskBreakdown.riskLevel || "low"
        const bRisk = b.copyrightCheckData?.riskBreakdown.riskLevel || "low"
        return riskOrder[aRisk as keyof typeof riskOrder] - riskOrder[bRisk as keyof typeof riskOrder]
      })
    } else if (sortBy === "similarity") {
      filtered.sort((a, b) => {
        const aScore = a.copyrightCheckData?.similarityScore || 0
        const bScore = b.copyrightCheckData?.similarityScore || 0
        return bScore - aScore
      })
    } else if (sortBy === "date") {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    return filtered
  }, [searchQuery, brandFilter, riskFilter, sortBy, pendingAssets])

  // Selection handlers
  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedAssets)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedAssets(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAssets(new Set(filteredAssets.map((a) => a.id)))
    } else {
      setSelectedAssets(new Set())
    }
  }

  // Approval handlers
  const handleApprove = async (assetId: string) => {
    setIsProcessing(true)
    try {
      // INTEGRATION POINT: Call API to approve asset
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Asset approved successfully")
      setSelectedAssets((prev) => {
        const newSet = new Set(prev)
        newSet.delete(assetId)
        return newSet
      })
      setReviewAsset(null)
    } catch (error) {
      toast.error("Failed to approve asset")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (assetId: string, reason: string) => {
    setIsProcessing(true)
    try {
      // INTEGRATION POINT: Call API to reject asset
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Asset rejected")
      setSelectedAssets((prev) => {
        const newSet = new Set(prev)
        newSet.delete(assetId)
        return newSet
      })
      setReviewAsset(null)
    } catch (error) {
      toast.error("Failed to reject asset")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedAssets.size === 0) {
      toast.error("Please select at least one asset")
      return
    }

    setIsProcessing(true)
    try {
      // INTEGRATION POINT: Call API to bulk approve assets
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(`Approved ${selectedAssets.size} asset${selectedAssets.size !== 1 ? "s" : ""}`)
      setSelectedAssets(new Set())
    } catch (error) {
      toast.error("Failed to approve assets")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedAssets.size === 0) {
      toast.error("Please select at least one asset")
      return
    }

    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    setIsProcessing(true)
    try {
      // INTEGRATION POINT: Call API to bulk reject assets
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(`Rejected ${selectedAssets.size} asset${selectedAssets.size !== 1 ? "s" : ""}`)
      setSelectedAssets(new Set())
    } catch (error) {
      toast.error("Failed to reject assets")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const allSelected = filteredAssets.length > 0 && selectedAssets.size === filteredAssets.length

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Minimal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Asset Approvals</h1>
            <Badge variant="secondary" className="text-xs">
              {pendingAssets.length} pending
            </Badge>
            {credits && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                {getTotalAvailable()} credits
              </Badge>
            )}
          </div>
          <Link href="/creative/assets">
            <Button variant="outline" size="sm">
              Back to Assets
            </Button>
          </Link>
        </div>

        {/* Inline Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          {/* Brand Filter */}
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {mockBrands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Risk Filter */}
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="All Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="risk">Sort: Risk</SelectItem>
              <SelectItem value="similarity">Sort: Similarity</SelectItem>
              <SelectItem value="date">Sort: Date</SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Actions (appears when items selected) */}
          {selectedAssets.size > 0 && (
            <>
              <div className="h-6 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {selectedAssets.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
                disabled={isProcessing}
                className="h-9"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 h-9"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </>
          )}
        </div>

        {/* Compact List */}
        <div className="border rounded-lg divide-y">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No assets pending approval</p>
              <p className="text-xs text-muted-foreground mt-1">All assets have been reviewed</p>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const similarityScore = asset.copyrightCheckData?.similarityScore ?? 0
              const riskLevel = asset.copyrightCheckData?.riskBreakdown.riskLevel ?? "low"
              const matchCount = asset.copyrightCheckData?.matchedSources.length ?? 0
              const isSelected = selectedAssets.has(asset.id)

              return (
                <div
                  key={asset.id}
                  className={cn(
                    "group p-3 hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelect(asset.id, !!checked)}
                      className="mt-0.5"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Line 1: Asset name + Scores */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium truncate">{asset.name}</span>
                        
                        {/* Quick Score Badges */}
                        <div className="flex items-center gap-1 shrink-0">
                          <ScoreBadge 
                            icon={Shield} 
                            score={asset.quickScores?.copyright} 
                            label="Copyright"
                          />
                          <ScoreBadge 
                            icon={Eye} 
                            score={asset.quickScores?.accessibility} 
                            label="Accessibility"
                          />
                          <ScoreBadge 
                            icon={Search} 
                            score={asset.quickScores?.seo} 
                            label="SEO"
                          />
                        </div>
                        
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs shrink-0",
                            riskLevel === "high" && "border-red-500 text-red-600 dark:text-red-400",
                            riskLevel === "medium" && "border-amber-500 text-amber-600 dark:text-amber-400",
                            riskLevel === "low" && "border-green-500 text-green-600 dark:text-green-400"
                          )}
                        >
                          {riskLevel === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {riskLevel.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Line 2: Brand • Matches • Date */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: asset.brandColor || "#666" }}
                          />
                          <span>{asset.brandName}</span>
                        </div>
                        <span>•</span>
                        <span>{matchCount} {matchCount === 1 ? "match" : "matches"}</span>
                        <span>•</span>
                        <span>{format(asset.createdAt, "MMM d")}</span>
                      </div>
                    </div>

                    {/* Actions (always visible on hover or when selected) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 px-2 text-xs"
                      >
                        <Link href={`/creative/assets/${asset.id}/review`}>
                          <FileBarChart className="h-3.5 w-3.5 mr-1" />
                          Full Review
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewAsset(asset)}
                        disabled={isProcessing}
                        className="h-8 px-2 text-xs"
                      >
                        Quick Review
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Copyright Check Review Dialog */}
      {reviewAsset && (
        <CopyrightCheckReview
          open={!!reviewAsset}
          onOpenChange={(open) => !open && setReviewAsset(null)}
          asset={reviewAsset}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </PageContainer>
  )
}

