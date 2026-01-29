"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  Search,
  Download,
  FileImage,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  MoreHorizontal,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockAssets, mockBrands } from "@/lib/mock-data/creative"
import { getDesignTypeIcon } from "@/lib/design-icons"
import { formatFileSize } from "@/lib/format-utils"
import { PageContainer } from "@/components/layout/PageContainer"
import { UploadAssetDialog } from "@/components/creative"
import { AssetFileType, DesignType, ASSET_FILE_TYPE_CONFIG, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { toast } from "sonner"
import { format } from "date-fns"
import NextImage from "next/image"
import Link from "next/link"

export default function AssetsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [fileTypeFilter, setFileTypeFilter] = useState<AssetFileType | "all">("all")
  const [designTypeFilter, setDesignTypeFilter] = useState<DesignType | "all">("all")
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
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
  const totalSize = filteredAssets.reduce((acc, a) => acc + a.fileSize, 0)
  const imageCount = filteredAssets.filter((a) => a.fileType === "image").length
  const documentCount = filteredAssets.filter((a) => a.fileType === "pdf" || a.fileType === "document").length

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

      {/* Page Header - Linear Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
            {' • '}
            {imageCount} images
            {' • '}
            {documentCount} documents
            {' • '}
            {formatFileSize(totalSize)} total
          </div>
        </div>
        <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Assets
        </Button>
      </div>

      {/* Filters - Linear Style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Brand Filter */}
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="Brand" />
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

        {/* File Type Filter */}
        <Select value={fileTypeFilter} onValueChange={(v) => setFileTypeFilter(v as AssetFileType | "all")}>
          <SelectTrigger className="w-full sm:w-[130px] h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ASSET_FILE_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Design Type Filter */}
        <Select value={designTypeFilter} onValueChange={(v) => setDesignTypeFilter(v as DesignType | "all")}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(DESIGN_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedAssets.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedAssets.size === filteredAssets.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedAssets(new Set(filteredAssets.map(a => a.id)))
                } else {
                  setSelectedAssets(new Set())
                }
              }}
            />
            <span className="text-sm font-medium">
              {selectedAssets.size} {selectedAssets.size === 1 ? 'asset' : 'assets'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Assets Table - Linear Style */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 w-[40px]">
                <Checkbox
                  checked={selectedAssets.size === filteredAssets.length && filteredAssets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="h-11 w-[35%] text-xs font-medium">Asset</TableHead>
              <TableHead className="h-11 w-[12%] text-xs font-medium">Brand</TableHead>
              <TableHead className="h-11 w-[10%] text-xs font-medium">Type</TableHead>
              <TableHead className="h-11 w-[15%] text-xs font-medium">Category</TableHead>
              <TableHead className="h-11 w-[10%] text-xs font-medium">Size</TableHead>
              <TableHead className="h-11 w-[12%] text-xs font-medium">Created</TableHead>
              <TableHead className="h-11 w-[10%] text-xs font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileImage className="h-8 w-8 opacity-50" />
                    <p>No assets found</p>
                    {hasActiveFilters && (
                      <Button variant="link" size="sm" onClick={clearFilters}>
                        Clear filters
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
                    className="h-12 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                    onClick={() => router.push(`/creative/assets/${asset.id}`)}
                  >
                    {/* Checkbox */}
                    <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelect(asset.id, checked as boolean)}
                      />
                    </TableCell>

                    {/* Asset with Thumbnail */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 rounded overflow-hidden bg-muted shrink-0">
                          <NextImage
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{asset.name}</p>
                          {asset.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {asset.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Brand with Color Dot */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {asset.brandColor && (
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: asset.brandColor }}
                          />
                        )}
                        <span className="text-xs truncate">{asset.brandName}</span>
                      </div>
                    </TableCell>

                    {/* File Type Badge */}
                    <TableCell className="py-2">
                      <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0.5">
                        {fileTypeConfig.label}
                      </Badge>
                    </TableCell>

                    {/* Design Type with Icon */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        <DesignIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {designTypeConfig.label}
                        </span>
                      </div>
                    </TableCell>

                    {/* File Size */}
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {formatFileSize(asset.fileSize)}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {format(asset.createdAt, "MMM d, yyyy")}
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/creative/assets/${asset.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={asset.fileUrl} download>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast.success("Delete feature coming soon!")}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Dialog */}
      <UploadAssetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </PageContainer>
  )
}
