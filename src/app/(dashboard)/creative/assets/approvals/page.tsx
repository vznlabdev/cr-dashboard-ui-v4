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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PageContainer } from "@/components/layout/PageContainer"
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
  Loader2,
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null)
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null)
  const [bulkRejectionReason, setBulkRejectionReason] = useState("")
  const [individualRejectionReason, setIndividualRejectionReason] = useState("")
  const [showManualApproveConfirm, setShowManualApproveConfirm] = useState(false)
  const [manualApproveReason, setManualApproveReason] = useState("")
  const [approvedAssets, setApprovedAssets] = useState<Set<string>>(new Set())
  const [rejectedAssets, setRejectedAssets] = useState<Set<string>>(new Set())
  const [showProcessed, setShowProcessed] = useState(false)
  const { credits, getTotalAvailable } = useCopyrightCredits()

  // Get pending approval assets (including unchecked)
  const pendingAssets = useMemo(() => {
    return mockAssets.filter(
      (asset) => 
        asset.approvalStatus === "pending" && 
        !approvedAssets.has(asset.id) &&
        !rejectedAssets.has(asset.id)
    )
  }, [approvedAssets, rejectedAssets])

  // Categorize assets by check status
  const assetsByStatus = useMemo(() => {
    return {
      needsCheck: pendingAssets.filter(a => !a.copyrightCheckStatus || a.copyrightCheckStatus === "pending"),
      checking: pendingAssets.filter(a => a.copyrightCheckStatus === "checking"),
      checked: pendingAssets.filter(a => a.copyrightCheckStatus === "completed"),
    }
  }, [pendingAssets])

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    // Include processed assets when showProcessed is true
    let baseAssets = showProcessed 
      ? [...pendingAssets, ...mockAssets.filter(a => 
          approvedAssets.has(a.id) || rejectedAssets.has(a.id)
        )]
      : pendingAssets
    
    let filtered = baseAssets.filter((asset) => {
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
  }, [searchQuery, brandFilter, riskFilter, sortBy, pendingAssets, showProcessed, approvedAssets, rejectedAssets])

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
      
      // Mark asset as approved
      setApprovedAssets(prev => new Set(prev).add(assetId))
      
      toast.success("Asset approved successfully")
      setSelectedAssets((prev) => {
        const newSet = new Set(prev)
        newSet.delete(assetId)
        return newSet
      })
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
      
      // Mark asset as rejected
      setRejectedAssets(prev => new Set(prev).add(assetId))
      
      toast.success("Asset rejected")
      setSelectedAssets((prev) => {
        const newSet = new Set(prev)
        newSet.delete(assetId)
        return newSet
      })
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
      
      // Mark assets as approved in local state
      setApprovedAssets(prev => {
        const updated = new Set(prev)
        selectedAssets.forEach(id => updated.add(id))
        return updated
      })
      
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

    // Show inline reject reason input instead of prompt
    setShowRejectInput("bulk")
  }

  const handleManualApprove = async () => {
    if (selectedAssets.size === 0) {
      toast.error("Please select at least one asset")
      return
    }

    // Show inline confirmation for manual override
    setShowManualApproveConfirm(true)
  }

  const confirmManualApprove = async (reason: string) => {
    setIsProcessing(true)
    try {
      // INTEGRATION POINT: Call API to manually approve assets with override
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Mark assets as approved
      setApprovedAssets(prev => {
        const updated = new Set(prev)
        selectedAssets.forEach(id => updated.add(id))
        return updated
      })
      
      toast.success(`Manually approved ${selectedAssets.size} asset${selectedAssets.size !== 1 ? "s" : ""} with override`)
      setSelectedAssets(new Set())
      setShowManualApproveConfirm(false)
      setManualApproveReason("")
    } catch (error) {
      toast.error("Failed to manually approve assets")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkRunChecks = async () => {
    if (selectedAssets.size === 0) {
      toast.error("Please select at least one asset")
      return
    }

    const creditsNeeded = selectedAssets.size
    const creditsAvailable = getTotalAvailable()

    if (creditsNeeded > creditsAvailable) {
      toast.error(`Insufficient credits. Need ${creditsNeeded}, have ${creditsAvailable}`)
      return
    }

    setIsProcessing(true)
    try {
      // INTEGRATION POINT: Call API to run copyright checks on multiple assets
      // This should update copyrightCheckStatus to "checking" then "completed"
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success(`Running checks on ${selectedAssets.size} asset${selectedAssets.size !== 1 ? "s" : ""}`)
      // Don't clear selection - let user see results and approve
    } catch (error) {
      toast.error("Failed to run checks")
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
            {(approvedAssets.size > 0 || rejectedAssets.size > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProcessed(!showProcessed)}
                className="h-6 px-2 text-xs"
              >
                {showProcessed ? "Hide" : "Show"} Processed ({approvedAssets.size + rejectedAssets.size})
              </Button>
            )}
            {credits && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                {getTotalAvailable()} credits
              </Badge>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkRunChecks}
              disabled={selectedAssets.size === 0 || isProcessing || getTotalAvailable() < selectedAssets.size}
              className="h-7 bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Run Checks ({selectedAssets.size})
            </Button>
          </div>
          <Link href="/creative/assets">
            <Button variant="outline" size="sm">
              Back to Assets
            </Button>
          </Link>
        </div>

        {/* Compact Action Bar - Linear Style */}
        <div className="space-y-2.5">
          {/* Row 1: Filters First */}
          <div className="flex items-center gap-2">
            {/* Search - flexible width */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            {/* Brand Filter */}
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
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
              <SelectTrigger className="w-[110px] h-8 text-sm">
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
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Sort: Risk</SelectItem>
                <SelectItem value="similarity">Sort: Similarity</SelectItem>
                <SelectItem value="date">Sort: Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Actions Below */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={selectedAssets.size === 0 || isProcessing}
              className="h-8 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Approve ({selectedAssets.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkReject}
              disabled={selectedAssets.size === 0 || isProcessing}
              className="h-8"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Reject
            </Button>
            <div className="h-5 w-px bg-border" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualApprove}
              disabled={selectedAssets.size === 0 || isProcessing}
              className="h-8"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Manual Approve
            </Button>
          </div>
        </div>

        {/* Inline Manual Approve Confirmation */}
        {showManualApproveConfirm && (
          <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Manual Approval Override</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  You are about to manually approve {selectedAssets.size} asset{selectedAssets.size !== 1 ? "s" : ""} without copyright check validation. 
                  Please provide a reason for this override.
                </p>
                <div className="space-y-2">
                  <Label className="text-xs">Override Reason <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={manualApproveReason}
                    onChange={(e) => setManualApproveReason(e.target.value)}
                    placeholder="e.g., Legal clearance obtained, Client requested, Low-risk use case..."
                    className="h-20 text-sm"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => confirmManualApprove(manualApproveReason)}
                    disabled={!manualApproveReason.trim() || isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Processing..." : "Confirm Manual Approval"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowManualApproveConfirm(false)
                      setManualApproveReason("")
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inline Bulk Reject Input */}
        {showRejectInput === "bulk" && (
          <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Rejection Reason <span className="text-destructive">*</span></Label>
              <Textarea
                value={bulkRejectionReason}
                onChange={(e) => setBulkRejectionReason(e.target.value)}
                placeholder="Explain why these assets are being rejected..."
                className="h-20 text-sm"
                disabled={isProcessing}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (!bulkRejectionReason.trim()) {
                    toast.error("Please provide a rejection reason")
                    return
                  }
                  setIsProcessing(true)
                  try {
                    // INTEGRATION POINT: Call API to bulk reject assets
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    
                    // Mark assets as rejected
                    setRejectedAssets(prev => {
                      const updated = new Set(prev)
                      selectedAssets.forEach(id => updated.add(id))
                      return updated
                    })
                    
                    toast.success(`Rejected ${selectedAssets.size} asset${selectedAssets.size !== 1 ? "s" : ""}`)
                    setSelectedAssets(new Set())
                    setShowRejectInput(null)
                    setBulkRejectionReason("")
                  } catch (error) {
                    toast.error("Failed to reject assets")
                    console.error(error)
                  } finally {
                    setIsProcessing(false)
                  }
                }}
                disabled={!bulkRejectionReason.trim() || isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm Reject"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowRejectInput(null)
                  setBulkRejectionReason("")
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Compact List */}
        <div className="border rounded-lg divide-y">
          {/* Select All Header */}
          {filteredAssets.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="h-4 w-4"
              />
              <span className="text-xs text-muted-foreground">
                {allSelected ? `All ${filteredAssets.length} selected` : `Select all ${filteredAssets.length}`}
              </span>
            </div>
          )}

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
              const isExpanded = expandedAsset === asset.id
              const needsCheck = !asset.copyrightCheckStatus || asset.copyrightCheckStatus === "pending"
              const isChecking = asset.copyrightCheckStatus === "checking"
              const isChecked = asset.copyrightCheckStatus === "completed"
              const isProcessed = approvedAssets.has(asset.id) || rejectedAssets.has(asset.id)

              return (
                <div key={asset.id} className={cn("group", isProcessed && "opacity-60 bg-muted/20")}>
                  {/* Main row */}
                  <div
                    className={cn(
                      "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                      isSelected && "bg-muted/50",
                      isExpanded && "bg-muted/30"
                    )}
                    onClick={(e) => {
                      // Don't toggle if clicking checkbox or buttons
                      if ((e.target as HTMLElement).closest('button, a, [role="checkbox"]')) return
                      setExpandedAsset(isExpanded ? null : asset.id)
                    }}
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
                        {/* Line 1: Asset name + Status Badge */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium truncate">{asset.name}</span>
                          
                          {/* Status badge */}
                          {needsCheck ? (
                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 shrink-0">
                              <Shield className="h-3 w-3 mr-1" />
                              Needs Check
                            </Badge>
                          ) : isChecking ? (
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 shrink-0">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Checking...
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs shrink-0",
                                riskLevel === "high" && "border-red-500 text-red-600",
                                riskLevel === "medium" && "border-amber-500 text-amber-600",
                                riskLevel === "low" && "border-green-500 text-green-600"
                              )}
                            >
                              {riskLevel === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {riskLevel.toUpperCase()}
                            </Badge>
                          )}
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
                          {isChecked && (
                            <>
                              <span>•</span>
                              <span>{matchCount} {matchCount === 1 ? "match" : "matches"}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{format(asset.createdAt, "MMM d")}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isChecked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Link href={`/creative/assets/${asset.id}/review`}>
                              <FileBarChart className="h-3.5 w-3.5 mr-1" />
                              Full Review
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable inline panel */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20 p-4 space-y-3">
                      {needsCheck ? (
                        <div className="text-center py-4">
                          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">
                            This asset hasn't been checked yet. Run a copyright check to review.
                          </p>
                          <Button
                            size="sm"
                            onClick={async () => {
                              setIsProcessing(true)
                              try {
                                await new Promise((resolve) => setTimeout(resolve, 2000))
                                toast.success("Check completed")
                              } catch (error) {
                                toast.error("Failed to run check")
                              } finally {
                                setIsProcessing(false)
                              }
                            }}
                            disabled={isProcessing || getTotalAvailable() < 1}
                          >
                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                            Run Check (1 credit)
                          </Button>
                        </div>
                      ) : isChecking ? (
                        <div className="text-center py-4">
                          <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-muted-foreground">Running copyright check...</p>
                        </div>
                      ) : (
                        <>
                          {/* Copyright check results */}
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-muted-foreground">Similarity</span>
                              <div className="font-semibold">{similarityScore}%</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-muted-foreground">Risk Level</span>
                              <div className="font-semibold capitalize">{riskLevel}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-muted-foreground">Matches</span>
                              <div className="font-semibold">{matchCount}</div>
                            </div>
                          </div>

                          {/* Quick actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(asset.id)}
                              disabled={isProcessing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowRejectInput(asset.id)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <Link href={`/creative/assets/${asset.id}/review`}>
                                <FileBarChart className="h-3.5 w-3.5 mr-1.5" />
                                Full Review
                              </Link>
                            </Button>
                          </div>

                          {/* Inline reject reason input */}
                          {showRejectInput === asset.id && (
                            <div className="space-y-2 pt-3 border-t">
                              <Label className="text-xs">Rejection Reason</Label>
                              <Textarea
                                value={individualRejectionReason}
                                onChange={(e) => setIndividualRejectionReason(e.target.value)}
                                placeholder="Explain why this asset is being rejected..."
                                className="h-20 text-sm"
                                disabled={isProcessing}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(asset.id, individualRejectionReason)}
                                  disabled={!individualRejectionReason.trim() || isProcessing}
                                >
                                  {isProcessing ? "Processing..." : "Confirm Reject"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setShowRejectInput(null)
                                    setIndividualRejectionReason("")
                                  }}
                                  disabled={isProcessing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </PageContainer>
  )
}

