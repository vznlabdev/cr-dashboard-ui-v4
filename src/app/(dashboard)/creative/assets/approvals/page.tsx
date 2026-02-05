"use client"

import { useState, useMemo, useEffect } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { PageContainer } from "@/components/layout/PageContainer"
import { mockAssets, mockBrands } from "@/lib/mock-data/creative"
import { Asset, AssetReviewData } from "@/types/creative"
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
  ChevronDown,
  CheckSquare,
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
  const [approvedAssets, setApprovedAssets] = useState<Set<string>>(new Set())
  const [rejectedAssets, setRejectedAssets] = useState<Set<string>>(new Set())
  const [showProcessed, setShowProcessed] = useState(false)
  const [checkingAssets, setCheckingAssets] = useState<Set<string>>(new Set())
  const [checksVersion, setChecksVersion] = useState(0) // Increment when checks complete to trigger recalculation
  const [, forceUpdate] = useState({}) // Force re-render when mockAssets mutated
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)
  const [selectAllPages, setSelectAllPages] = useState(false)
  const [deselectedAssets, setDeselectedAssets] = useState<Set<string>>(new Set())
  const { credits, getTotalAvailable, useCredit } = useCopyrightCredits()

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
  }, [pendingAssets, checksVersion])

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
  }, [searchQuery, brandFilter, riskFilter, sortBy, pendingAssets, showProcessed, approvedAssets, rejectedAssets, checksVersion])

  // Calculate how many selected assets actually need checks
  const assetsNeedingChecks = useMemo(() => {
    const selectedIds = selectAllPages
      ? filteredAssets.filter(asset => !deselectedAssets.has(asset.id)).map(asset => asset.id)
      : Array.from(selectedAssets)
    
    return selectedIds.filter(id => {
      const asset = mockAssets.find(a => a.id === id)
      return !asset?.reviewData
    }).length
  }, [selectedAssets, checksVersion, selectAllPages, filteredAssets, deselectedAssets])

  // Calculate selection count (supports select all pages)
  const selectionCount = useMemo(() => {
    if (selectAllPages) {
      return filteredAssets.length - deselectedAssets.size
    }
    return selectedAssets.size
  }, [selectAllPages, filteredAssets.length, deselectedAssets.size, selectedAssets.size])

  // Paginate filtered assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAssets.slice(startIndex, endIndex)
  }, [filteredAssets, currentPage, pageSize])

  // Calculate total pages
  const totalPages = Math.ceil(filteredAssets.length / pageSize)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, brandFilter, riskFilter, sortBy, showProcessed])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Generate mock review data for quality checks
  const generateMockReviewData = (): AssetReviewData => {
    const copyrightScore = Math.floor(Math.random() * 30) + 70 // 70-100
    const accessibilityScore = Math.floor(Math.random() * 25) + 75 // 75-100
    const seoScore = Math.floor(Math.random() * 30) + 65 // 65-95
    const performanceScore = Math.floor(Math.random() * 35) + 60 // 60-95
    const securityScore = Math.floor(Math.random() * 20) + 80 // 80-100
    
    const overallScore = Math.round(
      (copyrightScore * 0.3 + accessibilityScore * 0.2 + seoScore * 0.15 + 
       performanceScore * 0.2 + securityScore * 0.15)
    )

    const now = new Date()

    return {
      overallScore,
      checksCompleted: 6,
      totalChecks: 6,
      copyright: {
        status: "completed",
        data: {
          similarityScore: 100 - copyrightScore,
          matchedSources: [],
          riskBreakdown: {
            copyrightRisk: Math.max(0, 100 - copyrightScore - 10),
            trademarkRisk: Math.max(0, 100 - copyrightScore - 20),
            overallRisk: 100 - copyrightScore,
            riskLevel: copyrightScore >= 85 ? "low" : copyrightScore >= 70 ? "medium" : "high",
          },
          recommendations: [
            copyrightScore >= 85 
              ? "Asset passed copyright check with low similarity score."
              : "Some similarities detected, review recommended.",
            copyrightScore >= 85 
              ? "No significant matches found in copyright databases."
              : "Minor matches found, but likely acceptable.",
          ],
          checkedAt: now,
          checkDuration: 4500,
        },
      },
      accessibility: {
        status: "completed",
        data: {
          score: accessibilityScore,
          issues: accessibilityScore < 90 ? [{
            severity: "minor" as const,
            type: "contrast" as const,
            description: "Some text elements could use higher contrast",
            recommendation: "Increase contrast ratio for small text",
          }] : [],
          wcagLevel: accessibilityScore >= 90 ? "AAA" : "AA",
          colorContrast: {
            passed: true,
            ratio: accessibilityScore >= 90 ? 7.1 : 4.8,
            recommendation: accessibilityScore >= 90 
              ? "Excellent contrast ratio" 
              : "Meets WCAG AA standards",
          },
          altText: {
            present: true,
            quality: accessibilityScore >= 90 ? "good" : "fair",
          },
          recommendations: [
            accessibilityScore >= 90 
              ? "Excellent accessibility overall"
              : "Good accessibility with room for improvement",
            "Alt text is present and descriptive",
          ],
          checkedAt: now,
          checkDuration: 1200,
        },
      },
      seo: {
        status: "completed",
        data: {
          score: seoScore,
          imageOptimization: {
            format: seoScore >= 80 ? "optimal" : "acceptable",
            sizeRating: seoScore >= 80 ? "good" : "large",
            compressionPotential: Math.floor((100 - seoScore) / 2),
          },
          metadata: {
            filenameQuality: seoScore >= 80 ? "descriptive" : "generic",
            altTextPresent: true,
            dimensionsOptimal: seoScore >= 75,
          },
          recommendations: [
            seoScore >= 80 
              ? "Good SEO optimization"
              : "SEO could be improved",
            "Consider further optimization opportunities",
          ],
          checkedAt: now,
          checkDuration: 1500,
        },
      },
      brandCompliance: {
        status: "completed",
        data: {
          score: Math.floor(Math.random() * 20) + 80,
          colorCompliance: {
            passed: true,
            brandColorsUsed: [],
            offBrandColors: [],
          },
          logoUsage: {
            passed: true,
            issues: [],
          },
          styleGuideAdherence: Math.floor(Math.random() * 20) + 80,
          recommendations: ["Brand guidelines followed"],
          checkedAt: now,
          checkDuration: 1100,
        },
      },
      performance: {
        status: "completed",
        data: {
          score: performanceScore,
          fileSize: {
            current: 2400000,
            optimal: 2040000,
            savings: Math.floor((100 - performanceScore) * 10000),
          },
          loadTimeEstimate: Math.floor(1500 - (performanceScore * 5)),
          compressionScore: performanceScore,
          formatRecommendation: performanceScore < 80 
            ? "Consider WebP format for better compression"
            : undefined,
          recommendations: [
            performanceScore >= 80 
              ? "Good performance optimization"
              : "Performance could be improved",
            performanceScore < 80 
              ? "Consider file size optimization"
              : "File size is acceptable",
          ],
          checkedAt: now,
          checkDuration: 900,
        },
      },
      security: {
        status: "completed",
        data: {
          score: securityScore,
          threats: [],
          safe: true,
          recommendations: [
            "No security threats detected",
            "File is safe to use",
          ],
          checkedAt: now,
          checkDuration: 2200,
        },
      },
      lastReviewedAt: now,
      reviewedBy: "system",
    }
  }

  // Selection handlers
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
      
      // Reset rejection form state
      setShowRejectInput(null)
      setIndividualRejectionReason("")
    } catch (error) {
      toast.error("Failed to reject asset")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkApprove = async () => {
    const selectedIds = getSelectedAssetIds()
    if (selectedIds.length === 0) {
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
        selectedIds.forEach(id => updated.add(id))
        return updated
      })
      
      toast.success(`Approved ${selectedIds.length} asset${selectedIds.length !== 1 ? "s" : ""}`)
      handleClearSelection()
    } catch (error) {
      toast.error("Failed to approve assets")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkReject = async () => {
    const selectedIds = getSelectedAssetIds()
    if (selectedIds.length === 0) {
      toast.error("Please select at least one asset")
      return
    }

    // Show inline reject reason input instead of prompt
    setShowRejectInput("bulk")
  }

  const handleBulkRunChecks = async () => {
    const selectedIds = getSelectedAssetIds()
    if (selectedIds.length === 0) {
      toast.error("Please select at least one asset")
      return
    }

    // Separate assets that need checks vs already have scores
    const assetsToCheck: string[] = []
    const alreadyChecked: string[] = []
    
    selectedIds.forEach(id => {
      const asset = mockAssets.find(a => a.id === id)
      if (asset?.reviewData) {
        alreadyChecked.push(id)
      } else {
        assetsToCheck.push(id)
      }
    })

    // Show skip notification if applicable
    if (alreadyChecked.length > 0) {
      toast.info(`Skipped ${alreadyChecked.length} already checked asset${alreadyChecked.length !== 1 ? 's' : ''}`)
    }

    if (assetsToCheck.length === 0) {
      toast.error("All selected assets already have quality scores")
      return
    }

    const creditsNeeded = assetsToCheck.length
    const creditsAvailable = getTotalAvailable()

    if (creditsNeeded > creditsAvailable) {
      toast.error(`Insufficient credits. Need ${creditsNeeded}, have ${creditsAvailable}`)
      return
    }

    setIsProcessing(true)
    
    // Process each asset sequentially with visual feedback
    for (const assetId of assetsToCheck) {
      setCheckingAssets(prev => new Set(prev).add(assetId))
      
      try {
        // Consume credit before running check
        await useCredit()
        
        // INTEGRATION POINT: Call API to run checks and generate reviewData
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Generate mock review data and update asset
        const mockReviewData = generateMockReviewData()
        const assetIndex = mockAssets.findIndex(a => a.id === assetId)
        if (assetIndex !== -1) {
          mockAssets[assetIndex].reviewData = mockReviewData
          mockAssets[assetIndex].copyrightCheckStatus = "completed"
          mockAssets[assetIndex].copyrightCheckData = mockReviewData.copyright.data
          forceUpdate({}) // Trigger re-render after mutation
        }
      } catch (error) {
        console.error(`Failed to check asset ${assetId}:`, error)
        toast.error(`Failed to check asset: ${error}`)
      } finally {
        setCheckingAssets(prev => {
          const next = new Set(prev)
          next.delete(assetId)
          return next
        })
      }
    }
    
    setIsProcessing(false)
    setChecksVersion(prev => prev + 1) // Trigger recalculation of assets needing checks
    toast.success(`Completed checks on ${assetsToCheck.length} asset${assetsToCheck.length !== 1 ? 's' : ''}`)
  }

  // Selection handlers
  const handleSelectAllAssets = () => {
    setSelectAllPages(true)
    setDeselectedAssets(new Set())
    setSelectedAssets(new Set())
  }

  const handleClearSelection = () => {
    setSelectedAssets(new Set())
    setSelectAllPages(false)
    setDeselectedAssets(new Set())
  }

  const isAssetSelected = (id: string): boolean => {
    if (selectAllPages) {
      return !deselectedAssets.has(id)
    }
    return selectedAssets.has(id)
  }

  const handleToggleAsset = (id: string, checked: boolean) => {
    if (selectAllPages) {
      if (checked) {
        setDeselectedAssets(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        setDeselectedAssets(prev => new Set(prev).add(id))
      }
    } else {
      if (checked) {
        setSelectedAssets(prev => new Set(prev).add(id))
      } else {
        setSelectedAssets(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    }
  }

  const getSelectedAssetIds = (): string[] => {
    if (selectAllPages) {
      return filteredAssets
        .filter(asset => !deselectedAssets.has(asset.id))
        .map(asset => asset.id)
    }
    return Array.from(selectedAssets)
  }

  // Master checkbox for current page
  const allPageSelected = paginatedAssets.length > 0 && 
    paginatedAssets.every(asset => isAssetSelected(asset.id))

  const handleToggleAllPage = (checked: boolean) => {
    if (selectAllPages) {
      if (!checked) {
        // Deselect all on current page
        const pageIds = paginatedAssets.map(a => a.id)
        setDeselectedAssets(prev => new Set([...prev, ...pageIds]))
      } else {
        // Remove current page from deselected
        setDeselectedAssets(prev => {
          const next = new Set(prev)
          paginatedAssets.forEach(a => next.delete(a.id))
          return next
        })
      }
    } else {
      if (checked) {
        const pageIds = paginatedAssets.map(a => a.id)
        setSelectedAssets(prev => {
          const next = new Set(prev)
          pageIds.forEach(id => next.add(id))
          return next
        })
      } else {
        const pageIds = paginatedAssets.map(a => a.id)
        setSelectedAssets(prev => {
          const next = new Set(prev)
          pageIds.forEach(id => next.delete(id))
          return next
        })
      }
    }
  }

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
              disabled={selectionCount === 0 || isProcessing || getTotalAvailable() < assetsNeedingChecks}
              className="h-7 bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Run Checks ({assetsNeedingChecks})
            </Button>
          </div>
          <Link href="/creative/assets">
            <Button variant="outline" size="sm">
              Back to Assets
            </Button>
          </Link>
        </div>

        {/* Filters Row */}
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

        {/* Bulk Actions Bar - Shopify Style */}
        {selectionCount > 0 && !selectAllPages ? (
          <div className="sticky top-0 z-20 flex items-center justify-between py-2 border-b bg-background">
            <div className="flex items-center gap-2">
              {/* "Showing X selected" dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Showing {selectionCount} selected
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleSelectAllAssets}>
                    Select all {filteredAssets.length} assets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClearSelection}>
                    Deselect all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Action buttons */}
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={selectionCount === 0 || isProcessing}
                className="h-8 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Approve ({selectionCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
                disabled={selectionCount === 0 || isProcessing}
                className="h-8"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Reject
              </Button>
            </div>
          </div>
        ) : selectAllPages ? (
          <div className="sticky top-0 z-20 flex items-center justify-between py-2 border-b bg-background">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    All {selectionCount} selected
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleClearSelection}>
                    Deselect all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Action buttons */}
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={selectionCount === 0 || isProcessing}
                className="h-8 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Approve ({selectionCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
                disabled={selectionCount === 0 || isProcessing}
                className="h-8"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Reject
              </Button>
            </div>
          </div>
        ) : null}

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
                  const selectedIds = getSelectedAssetIds()
                  setIsProcessing(true)
                  try {
                    // INTEGRATION POINT: Call API to bulk reject assets
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    
                    // Mark assets as rejected
                    setRejectedAssets(prev => {
                      const updated = new Set(prev)
                      selectedIds.forEach(id => updated.add(id))
                      return updated
                    })
                    
                    toast.success(`Rejected ${selectedIds.length} asset${selectedIds.length !== 1 ? "s" : ""}`)
                    handleClearSelection()
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
          {paginatedAssets.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
              <Checkbox
                checked={allPageSelected}
                onCheckedChange={handleToggleAllPage}
                className="h-4 w-4"
              />
              <span className="text-xs text-muted-foreground">
                {allPageSelected ? `All ${paginatedAssets.length} on page selected` : `Select all ${paginatedAssets.length} on page`}
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
            paginatedAssets.map((asset) => {
              const similarityScore = asset.copyrightCheckData?.similarityScore ?? 0
              const riskLevel = asset.copyrightCheckData?.riskBreakdown.riskLevel ?? "low"
              const matchCount = asset.copyrightCheckData?.matchedSources.length ?? 0
              const isSelected = isAssetSelected(asset.id)
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
                        onCheckedChange={(checked) => handleToggleAsset(asset.id, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Line 1: Asset name + Status Badge */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link 
                            href={`/creative/assets/${asset.id}`}
                            className="text-sm font-medium truncate hover:text-blue-600 hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {asset.name}
                          </Link>
                          
                          {/* Status badge / Quality scores */}
                          {needsCheck ? (
                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 shrink-0">
                              <Shield className="h-3 w-3 mr-1" />
                              Needs Check
                            </Badge>
                          ) : checkingAssets.has(asset.id) ? (
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 shrink-0">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Checking...
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1">
                              <ScoreBadge icon={Shield} score={asset.reviewData?.copyright?.data ? (100 - asset.reviewData.copyright.data.similarityScore) : undefined} size="sm" />
                              <ScoreBadge icon={Eye} score={asset.reviewData?.accessibility?.data?.score} size="sm" />
                              <ScoreBadge icon={Zap} score={asset.reviewData?.performance?.data?.score} size="sm" />
                              <ScoreBadge icon={Palette} score={asset.reviewData?.seo?.data?.score} size="sm" />
                              <ScoreBadge icon={ShieldCheck} score={asset.reviewData?.security?.data?.score} size="sm" />
                            </div>
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
                              if (asset.reviewData) {
                                toast.info("Asset already has quality scores. Use 'Re-run Check' if needed.")
                                return
                              }
                              
                              setCheckingAssets(prev => new Set(prev).add(asset.id))
                              try {
                                // Consume credit before running check
                                await useCredit()
                                
                                await new Promise((resolve) => setTimeout(resolve, 1500))
                                
                                const mockReviewData = generateMockReviewData()
                                const assetIndex = mockAssets.findIndex(a => a.id === asset.id)
                                if (assetIndex !== -1) {
                                  mockAssets[assetIndex].reviewData = mockReviewData
                                  mockAssets[assetIndex].copyrightCheckStatus = "completed"
                                  mockAssets[assetIndex].copyrightCheckData = mockReviewData.copyright.data
                                  forceUpdate({}) // Trigger re-render after mutation
                                }
                                
                                setChecksVersion(prev => prev + 1) // Trigger recalculation of assets needing checks
                                toast.success("Quality check completed")
                              } catch (error) {
                                toast.error("Failed to run check")
                                console.error(error)
                              } finally {
                                setCheckingAssets(prev => {
                                  const next = new Set(prev)
                                  next.delete(asset.id)
                                  return next
                                })
                              }
                            }}
                            disabled={checkingAssets.has(asset.id) || getTotalAvailable() < 1}
                          >
                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                            Run Check (1 credit)
                          </Button>
                        </div>
                      ) : checkingAssets.has(asset.id) ? (
                        <div className="text-center py-4">
                          <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-muted-foreground">Running quality checks...</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Key Insights - Compact & Actionable */}
                          <div className="space-y-2">
                            {/* Copyright Insights */}
                            {asset.reviewData?.copyright?.data && (
                              <div className="flex items-start gap-2 text-xs">
                                <Shield className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="text-muted-foreground">Copyright: </span>
                                  <span>{asset.reviewData.copyright.data.similarityScore}% similarity, </span>
                                  <span className="font-medium">{asset.reviewData.copyright.data.riskBreakdown.riskLevel} risk</span>
                                  {asset.reviewData.copyright.data.matchedSources.length > 0 && (
                                    <span className="text-muted-foreground"> • {asset.reviewData.copyright.data.matchedSources.length} matches</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Accessibility Insights */}
                            {asset.reviewData?.accessibility?.data && (
                              <div className="flex items-start gap-2 text-xs">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="text-muted-foreground">Accessibility: </span>
                                  <span className="font-medium">{asset.reviewData.accessibility.data.wcagLevel} compliant</span>
                                  {asset.reviewData.accessibility.data.issues.length > 0 && (
                                    <span className="text-amber-600"> • {asset.reviewData.accessibility.data.issues.length} issues</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Performance Insights */}
                            {asset.reviewData?.performance?.data && (
                              <div className="flex items-start gap-2 text-xs">
                                <Zap className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="text-muted-foreground">Performance: </span>
                                  <span>{asset.reviewData.performance.data.loadTimeEstimate}ms load</span>
                                  {asset.reviewData.performance.data.fileSize.savings > 0 && (
                                    <span className="text-muted-foreground"> • Can save {Math.round(asset.reviewData.performance.data.fileSize.savings / 1000)}KB</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* SEO Insights */}
                            {asset.reviewData?.seo?.data && (
                              <div className="flex items-start gap-2 text-xs">
                                <Palette className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="text-muted-foreground">SEO: </span>
                                  <span className="font-medium">{asset.reviewData.seo.data.imageOptimization.format} format</span>
                                  <span className="text-muted-foreground"> • {asset.reviewData.seo.data.imageOptimization.sizeRating} size</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Security Insights */}
                            {asset.reviewData?.security?.data && (
                              <div className="flex items-start gap-2 text-xs">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="text-muted-foreground">Security: </span>
                                  <span className={cn(
                                    "font-medium",
                                    asset.reviewData.security.data.safe ? "text-green-600" : "text-red-600"
                                  )}>
                                    {asset.reviewData.security.data.safe ? "Safe" : "Threats detected"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Last checked info */}
                          {asset.reviewData?.lastReviewedAt && (
                            <div className="text-xs text-muted-foreground">
                              Last checked: {format(asset.reviewData.lastReviewedAt, 'MMM d, yyyy h:mm a')}
                            </div>
                          )}

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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end py-4">
            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredAssets.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

