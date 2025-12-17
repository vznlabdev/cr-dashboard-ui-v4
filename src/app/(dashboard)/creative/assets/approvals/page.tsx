"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { PageContainer } from "@/components/layout/PageContainer"
import { CopyrightCheckReview } from "@/components/creative"
import { mockAssets, mockBrands } from "@/lib/mock-data/creative"
import { Asset } from "@/types/creative"
import { format } from "date-fns"
import { formatFileSize } from "@/lib/format-utils"
import { toast } from "sonner"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function AssetApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [reviewAsset, setReviewAsset] = useState<Asset | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get pending approval assets
  const pendingAssets = useMemo(() => {
    return mockAssets.filter(
      (asset) =>
        asset.approvalStatus === "pending" &&
        asset.copyrightCheckStatus === "completed" &&
        asset.copyrightCheckData
    )
  }, [])

  // Filter assets
  const filteredAssets = useMemo(() => {
    return pendingAssets.filter((asset) => {
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
  }, [searchQuery, brandFilter, riskFilter, pendingAssets])

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
  const someSelected = selectedAssets.size > 0 && selectedAssets.size < filteredAssets.length
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null)

  // Set indeterminate state on checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const input = selectAllCheckboxRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement
      if (input) {
        input.indeterminate = someSelected
      }
    }
  }, [someSelected])

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asset Approvals</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve assets flagged during copyright checks
            </p>
          </div>
          <Link href="/creative/assets">
            <Button variant="outline">Back to Assets</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingAssets.filter(
                  (a) => a.copyrightCheckData?.riskBreakdown.riskLevel === "high"
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Selected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedAssets.size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Brand Filter */}
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedAssets.size > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {selectedAssets.size} asset{selectedAssets.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkReject}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Selected
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Selected
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals ({filteredAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No assets pending approval</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        ref={selectAllCheckboxRef}
                      />
                    </TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Similarity Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const similarityScore = asset.copyrightCheckData?.similarityScore ?? 0
                    const riskLevel = asset.copyrightCheckData?.riskBreakdown.riskLevel ?? "low"
                    const isSelected = selectedAssets.has(asset.id)

                    return (
                      <TableRow key={asset.id} className={cn(isSelected && "bg-muted/50")}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelect(asset.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(asset.fileSize)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: asset.brandColor || "#666" }}
                            />
                            <span className="text-sm">{asset.brandName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(asset.createdAt, "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={similarityScore < 30 ? "default" : "destructive"}
                            className={cn(
                              similarityScore < 30 && "bg-green-500 hover:bg-green-600"
                            )}
                          >
                            {similarityScore}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              riskLevel === "low"
                                ? "default"
                                : riskLevel === "medium"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {riskLevel.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-amber-600 border-amber-500">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReviewAsset(asset)}
                              disabled={isProcessing}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(asset.id, "Rejected by admin")}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(asset.id)}
                              disabled={isProcessing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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

