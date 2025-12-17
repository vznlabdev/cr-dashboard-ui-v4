"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Search,
  LayoutGrid,
  List,
  Table as TableIcon,
  Download,
  FileImage,
  FileText,
  Package,
  X,
  CheckSquare,
  Square,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
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
import { mockAssets, mockBrands } from "@/lib/mock-data/creative"
import { getDesignTypeIcon } from "@/lib/design-icons"
import { formatFileSize } from "@/lib/format-utils"
import { PageContainer } from "@/components/layout/PageContainer"
import { AssetCard, AssetPreviewModal, UploadAssetDialog } from "@/components/creative"
import { Asset, AssetFileType, DesignType, ASSET_FILE_TYPE_CONFIG, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import NextImage from "next/image"
import Link from "next/link"

type ViewType = "grid" | "list" | "table"

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<ViewType>("grid")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [fileTypeFilter, setFileTypeFilter] = useState<AssetFileType | "all">("all")
  const [designTypeFilter, setDesignTypeFilter] = useState<DesignType | "all">("all")
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Filter assets
  const filteredAssets = useMemo(() => {
    return mockAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        asset.brandName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBrand = brandFilter === "all" || asset.brandId === brandFilter
      const matchesFileType = fileTypeFilter === "all" || asset.fileType === fileTypeFilter
      const matchesDesignType = designTypeFilter === "all" || asset.designType === designTypeFilter
      return matchesSearch && matchesBrand && matchesFileType && matchesDesignType
    })
  }, [searchQuery, brandFilter, fileTypeFilter, designTypeFilter])

  // Calculate stats
  const totalSize = mockAssets.reduce((acc, a) => acc + a.fileSize, 0)
  const imageCount = mockAssets.filter((a) => a.fileType === "image").length
  const documentCount = mockAssets.filter((a) => a.fileType === "pdf" || a.fileType === "document").length
  const archiveCount = mockAssets.filter((a) => a.fileType === "archive").length

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

  const handleSelectAll = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set())
    } else {
      setSelectedAssets(new Set(filteredAssets.map((a) => a.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedAssets(new Set())
  }

  const handleBulkDownload = () => {
    toast.success(`Downloading ${selectedAssets.size} assets...`)
    // In a real app, this would trigger a bulk download
  }

  const clearFilters = () => {
    setSearchQuery("")
    setBrandFilter("all")
    setFileTypeFilter("all")
    setDesignTypeFilter("all")
  }

  const hasActiveFilters = searchQuery || brandFilter !== "all" || fileTypeFilter !== "all" || designTypeFilter !== "all"

  // Count assets pending approval
  const pendingApprovalCount = useMemo(() => {
    return mockAssets.filter(
      (asset) => asset.approvalStatus === "pending" && asset.copyrightCheckStatus === "completed"
    ).length
  }, [])

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Pending Approval Banner */}
      {pendingApprovalCount > 0 && (
        <Card className="border-amber-500 bg-amber-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    {pendingApprovalCount} asset{pendingApprovalCount !== 1 ? "s" : ""} pending approval
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Review and approve assets flagged during copyright checks
                  </p>
                </div>
              </div>
              <Link href="/creative/assets/approvals">
                <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white">
                  Review Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Asset Library</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Browse and manage deliverables and creative assets
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Assets
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAssets.length}</div>
            <p className="text-xs text-muted-foreground">{formatFileSize(totalSize)} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <FileImage className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imageCount}</div>
            <p className="text-xs text-muted-foreground">PNG, JPG, SVG, PSD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
            <p className="text-xs text-muted-foreground">PDF, DOC, HTML</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Archives</CardTitle>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archiveCount}</div>
            <p className="text-xs text-muted-foreground">ZIP packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, tag, or brand..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[160px]">
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

            <Select value={fileTypeFilter} onValueChange={(v) => setFileTypeFilter(v as AssetFileType | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(ASSET_FILE_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={designTypeFilter} onValueChange={(v) => setDesignTypeFilter(v as DesignType | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(DESIGN_TYPE_CONFIG).map(([key, config]) => {
                  const Icon = getDesignTypeIcon(config.iconName)
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={view === "grid" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "table" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setView("table")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters & Selection Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""}
          </span>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto py-1 px-2">
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}

          <div className="flex-1" />

          {/* Bulk Selection */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="gap-2"
          >
            {selectedAssets.size === filteredAssets.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedAssets.size === filteredAssets.length ? "Deselect All" : "Select All"}
          </Button>

          {selectedAssets.size > 0 && (
            <>
              <Badge variant="secondary">{selectedAssets.size} selected</Badge>
              <Button variant="outline" size="sm" onClick={handleClearSelection}>
                Clear
              </Button>
              <Button size="sm" onClick={handleBulkDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Selected
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Asset Grid/List/Table */}
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              variant="grid"
              selected={selectedAssets.has(asset.id)}
              onSelect={handleSelect}
              onClick={(a) => setPreviewAsset(a)}
            />
          ))}
        </div>
      ) : view === "list" ? (
        <div className="space-y-2">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              variant="list"
              selected={selectedAssets.has(asset.id)}
              onSelect={handleSelect}
              onClick={(a) => setPreviewAsset(a)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAssets.size === filteredAssets.length && filteredAssets.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileImage className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          {hasActiveFilters
                            ? "No assets found matching your filters."
                            : "No assets in the library yet."}
                        </p>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => {
                    const fileTypeConfig = ASSET_FILE_TYPE_CONFIG[asset.fileType]
                    const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
                    const DesignIcon = getDesignTypeIcon(designTypeConfig.iconName)
                    const isSelected = selectedAssets.has(asset.id)

                    return (
                      <TableRow
                        key={asset.id}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-muted/50"
                        )}
                        onClick={() => setPreviewAsset(asset)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelect(asset.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded overflow-hidden bg-muted shrink-0">
                              <NextImage
                                src={asset.thumbnailUrl}
                                alt={asset.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{asset.name}</p>
                              {asset.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {asset.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {asset.brandColor && (
                              <div
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: asset.brandColor }}
                              />
                            )}
                            <span className="text-sm">{asset.brandName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {fileTypeConfig.icon} {fileTypeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DesignIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {designTypeConfig.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFileSize(asset.fileSize)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(asset.createdAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={asset.fileUrl}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-muted rounded-md transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewAsset(asset)
                              }}
                              className="p-2 hover:bg-muted rounded-md transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State (for grid and list views) */}
      {filteredAssets.length === 0 && view !== "table" && (
        <div className="text-center py-12">
          <FileImage className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? "No assets found matching your filters."
              : "No assets in the library yet."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={previewAsset}
        open={!!previewAsset}
        onOpenChange={(open) => !open && setPreviewAsset(null)}
      />

      {/* Upload Dialog */}
      <UploadAssetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </PageContainer>
  )
}
