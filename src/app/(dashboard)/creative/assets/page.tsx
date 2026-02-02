"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Upload,
  Search,
  Download,
  FileImage,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Sparkles,
  Shield,
  X,
  List,
  Grid,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  CheckSquare,
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { mockAssets, mockBrands, mockVersionGroups } from "@/lib/mock-data/creative"
import { getDesignTypeIcon } from "@/lib/design-icons"
import { formatFileSize } from "@/lib/format-utils"
import { PageContainer } from "@/components/layout/PageContainer"
import { UploadAssetDialog } from "@/components/creative"
import { AssetFileType, AssetContentType, DesignType, ASSET_FILE_TYPE_CONFIG, DESIGN_TYPE_CONFIG, AssetVersionGroup } from "@/types/creative"
import { VersionStatusBadge } from "@/components/assets"
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
  const [contentTypeFilter, setContentTypeFilter] = useState<AssetContentType | "all">("all")
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedView, setSelectedView] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [searchOpen, setSearchOpen] = useState(false)
  const [showAllSelected, setShowAllSelected] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Combine assets and version groups for display
  type CombinedAssetType = (typeof mockAssets[0] & { isVersionGroup?: boolean; versionGroup?: AssetVersionGroup })
  
  const combinedAssets = useMemo(() => {
    // Convert version groups to a display format
    const versionGroupsAsAssets: CombinedAssetType[] = mockVersionGroups.map((group) => {
      const latestVersion = group.versions[group.versions.length - 1]
      return {
        id: group.id,
        name: group.name,
        description: `${group.totalVersions} versions`,
        isVersionGroup: true,
        versionGroup: group,
        thumbnailUrl: latestVersion?.thumbnailUrl || "",
        fileUrl: latestVersion?.fileUrl || "",
        fileType: latestVersion?.fileType || "image",
        contentType: latestVersion?.contentType || "original",
        mimeType: latestVersion?.mimeType || "image/png",
        fileSize: latestVersion?.fileSize || 0,
        dimensions: latestVersion?.dimensions,
        brandId: group.brandId,
        brandName: group.brandName,
        brandColor: group.brandColor,
        brandLogoUrl: group.brandLogoUrl,
        designType: group.designType,
        tags: group.tags,
        uploadedById: latestVersion?.uploadedById || "",
        uploadedByName: latestVersion?.uploadedByName || "",
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      } as CombinedAssetType
    })
    
    return [...versionGroupsAsAssets, ...mockAssets]
  }, [])

  // Filter combined assets
  const filteredAssets = useMemo(() => {
    return combinedAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        asset.brandName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBrand = brandFilter === "all" || asset.brandId === brandFilter
      const matchesFileType = fileTypeFilter === "all" || asset.fileType === fileTypeFilter
      const matchesDesignType = designTypeFilter === "all" || asset.designType === designTypeFilter
      const matchesContentType = contentTypeFilter === "all" || asset.contentType === contentTypeFilter
      return matchesSearch && matchesBrand && matchesFileType && matchesDesignType && matchesContentType
    })
  }, [combinedAssets, searchQuery, brandFilter, fileTypeFilter, designTypeFilter, contentTypeFilter])

  // Sort filtered assets
  const sortedAssets = useMemo(() => {
    const sorted = [...filteredAssets]
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'date-desc':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      case 'date-asc':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      case 'size-desc':
        return sorted.sort((a, b) => b.fileSize - a.fileSize)
      case 'size-asc':
        return sorted.sort((a, b) => a.fileSize - b.fileSize)
      default:
        return sorted
    }
  }, [filteredAssets, sortBy])

  // Define view tabs with counts
  const views = useMemo(() => [
    { id: 'all', label: 'All', count: sortedAssets.length },
    { id: 'images', label: 'Images', fileType: 'image' as const },
    { id: 'ai', label: 'AI Generated', contentType: 'ai_generated' as const },
    { id: 'recent', label: 'Recent', sortBy: 'date-desc' as const },
  ], [sortedAssets.length])

  // Calculate stats
  const totalSize = sortedAssets.reduce((acc, a) => acc + a.fileSize, 0)
  const imageCount = sortedAssets.filter((a) => a.fileType === "image").length
  const documentCount = sortedAssets.filter((a) => a.fileType === "pdf" || a.fileType === "document").length
  const aiCount = sortedAssets.filter((a) => a.contentType === "ai_generated").length
  const originalCount = sortedAssets.filter((a) => a.contentType === "original").length

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
    if (selectedAssets.size === sortedAssets.length) {
      setSelectedAssets(new Set())
    } else {
      setSelectedAssets(new Set(sortedAssets.map((a) => a.id)))
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
    setContentTypeFilter("all")
  }

  const hasActiveFilters = searchQuery || brandFilter !== "all" || fileTypeFilter !== "all" || designTypeFilter !== "all" || contentTypeFilter !== "all"
  
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (brandFilter !== "all") count++
    if (fileTypeFilter !== "all") count++
    if (designTypeFilter !== "all") count++
    if (contentTypeFilter !== "all") count++
    return count
  }, [brandFilter, fileTypeFilter, designTypeFilter, contentTypeFilter])

  // Count assets pending approval
  const pendingApprovalCount = useMemo(() => {
    return mockAssets.filter(
      (asset) => asset.approvalStatus === "pending" && asset.copyrightCheckStatus === "completed"
    ).length
  }, [])

  // Handle view tab changes
  const handleViewChange = (viewId: string) => {
    setSelectedView(viewId)
    const view = views.find(v => v.id === viewId)
    if (view) {
      // Apply view-specific filters
      if ('fileType' in view && view.fileType) {
        setFileTypeFilter(view.fileType)
      }
      if ('contentType' in view && view.contentType) {
        setContentTypeFilter(view.contentType)
      }
      if ('sortBy' in view && view.sortBy) {
        setSortBy(view.sortBy)
      }
      // Reset to defaults for 'all' view
      if (viewId === 'all') {
        setFileTypeFilter('all')
        setContentTypeFilter('all')
        setSortBy('date-desc')
      }
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      // Cmd/Ctrl + F: Toggle filters
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setFiltersOpen(prev => !prev)
      }
      // Escape: Close search, filters, or clear selection (priority order)
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setFiltersOpen(false)
        setSelectedAssets(new Set())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header - Linear Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets</h1>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <span>{sortedAssets.length} {sortedAssets.length === 1 ? 'asset' : 'assets'}</span>
            <span>•</span>
            <span>{aiCount} AI</span>
            <span>•</span>
            <span>{originalCount} original</span>
            <span>•</span>
            <span>{formatFileSize(totalSize)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingApprovalCount > 0 && (
            <Link href="/creative/assets/approvals">
              <Button variant="outline" size="sm" className="h-8 border-amber-500 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                <Shield className="mr-2 h-4 w-4" />
                Approvals
                <Badge className="ml-2 bg-amber-500 text-white hover:bg-amber-500">{pendingApprovalCount}</Badge>
              </Button>
            </Link>
          )}
          <Button size="sm" className="h-8" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Assets
          </Button>
        </div>
      </div>

      {/* View Tabs + Icon Toolbar - Shopify Style */}
      <div className="flex items-center justify-between py-3 border-b">
        {/* Pill-style tabs on left */}
        <div className="flex items-center gap-1">
          {views.map(view => (
            <Button
              key={view.id}
              variant={selectedView === view.id ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-full px-4"
              onClick={() => handleViewChange(view.id)}
            >
              {view.label}
              {view.id === 'all' && (
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{view.count}</Badge>
              )}
            </Button>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Icon buttons on right */}
        <div className="flex items-center gap-1">
          {/* Search Icon */}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Filter Icon (Hamburger) */}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 relative"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                {activeFilterCount}
              </div>
            )}
          </Button>

          {/* Sort Icon - opens sort menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Sort by</div>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                <DropdownMenuRadioItem value="name-asc">Product title</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date-desc">Created</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date-asc">Updated</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="date-desc">↑ Newest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date-asc">↓ Oldest first</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex items-center border rounded-md ml-2">
            <Button 
              variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-l-none border-l"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsible Search Bar */}
      {searchOpen && (
        <div className="flex items-center gap-2 py-2 border-b animate-in slide-in-from-top-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search assets..."
              className="pl-9 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Bulk Actions Bar - Shopify Style */}
      {selectedAssets.size > 0 ? (
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            {/* "Showing X selected" dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Showing {selectedAssets.size} selected
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSelectAll}>
                  Select all {sortedAssets.length}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearSelection}>
                  Deselect all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Action buttons */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8" 
              onClick={() => {
                const ids = Array.from(selectedAssets).join(',')
                router.push(`/creative/assets/bulk-edit?ids=${ids}`)
              }}
            >
              Bulk edit
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              Set as draft
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleBulkDownload}>
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Show all selected toggle (right side) */}
          <div className="flex items-center gap-2">
            <label className="text-sm">Show all selected</label>
            <Switch checked={showAllSelected} onCheckedChange={setShowAllSelected} />
          </div>
        </div>
      ) : null}

      {/* Filter Panel (Simple for future) - Hidden by default per Shopify */}
      {filtersOpen && !selectedAssets.size && (
        <Card className="border-b rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Brand</label>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="h-8">
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
              </div>

              {/* File Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">File Type</label>
                <Select value={fileTypeFilter} onValueChange={(v) => setFileTypeFilter(v as AssetFileType | "all")}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Types" />
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
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Category</label>
                <Select value={designTypeFilter} onValueChange={(v) => setDesignTypeFilter(v as DesignType | "all")}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Categories" />
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
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Source</label>
                <Select value={contentTypeFilter} onValueChange={(v) => setContentTypeFilter(v as AssetContentType | "all")}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="ai_generated">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Generated
                      </div>
                    </SelectItem>
                    <SelectItem value="original">Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
                <Button size="sm" onClick={() => setFiltersOpen(false)}>
                  Done
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assets View - Table or Grid */}
      {viewMode === 'table' ? (
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="h-9 w-[30px]">
                  <Checkbox
                    checked={selectedAssets.size === sortedAssets.length && sortedAssets.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="h-9 w-[40%] text-xs font-medium">Asset</TableHead>
                <TableHead className="h-9 w-[15%] text-xs font-medium">Brand</TableHead>
                <TableHead className="h-9 w-[35%] text-xs font-medium">Info</TableHead>
                <TableHead className="h-9 w-[10%] text-xs font-medium text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileImage className="h-8 w-8 opacity-50" />
                      <p className="text-sm">No assets found</p>
                      {hasActiveFilters && (
                        <Button variant="link" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedAssets.map((asset) => {
                  const fileTypeConfig = ASSET_FILE_TYPE_CONFIG[asset.fileType]
                  const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
                  const DesignIcon = designTypeConfig ? getDesignTypeIcon(designTypeConfig.iconName) : FileImage
                  const isSelected = selectedAssets.has(asset.id)

                  return (
                    <TableRow
                      key={asset.id}
                      className="h-10 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/creative/assets/${asset.id}`)}
                    >
                      {/* Checkbox */}
                      <TableCell className="py-1.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelect(asset.id, checked === true)}
                        />
                      </TableCell>

                      {/* Asset with Thumbnail */}
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="relative h-7 w-7 rounded overflow-hidden bg-muted shrink-0">
                            <NextImage
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium truncate">{asset.name}</p>
                              {asset.contentType === "ai_generated" && (
                                <div title="AI Generated">
                                  <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
                                </div>
                              )}
                              {('isVersionGroup' in asset && asset.isVersionGroup && 'versionGroup' in asset && asset.versionGroup) ? (
                                <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                                  v{(asset as any).versionGroup.currentVersionNumber}
                                </Badge>
                              ) : null}
                            </div>
                            {asset.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {asset.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Brand with Color Dot */}
                      <TableCell className="py-1.5">
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

                      {/* Combined Info Column */}
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {fileTypeConfig.label}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <DesignIcon className="h-3 w-3" />
                            {designTypeConfig?.label || asset.designType}
                          </span>
                          <span>•</span>
                          <span>{formatFileSize(asset.fileSize)}</span>
                          <span>•</span>
                          <span>{format(asset.createdAt, "MMM d")}</span>
                        </div>
                      </TableCell>

                      {/* Actions Dropdown */}
                      <TableCell className="py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
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
      ) : (
        // Grid View
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sortedAssets.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-2 text-muted-foreground py-12">
              <FileImage className="h-8 w-8 opacity-50" />
              <p className="text-sm">No assets found</p>
              {hasActiveFilters && (
                <Button variant="link" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            sortedAssets.map((asset) => {
              const fileTypeConfig = ASSET_FILE_TYPE_CONFIG[asset.fileType]
              const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
              const DesignIcon = designTypeConfig ? getDesignTypeIcon(designTypeConfig.iconName) : FileImage
              const isSelected = selectedAssets.has(asset.id)

              return (
                <Card
                  key={asset.id}
                  className="group relative cursor-pointer hover:shadow-md transition-all overflow-hidden"
                  onClick={() => router.push(`/creative/assets/${asset.id}`)}
                >
                  {/* Checkbox Overlay */}
                  <div 
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelect(asset.id, checked === true)}
                      className="bg-white shadow-sm"
                    />
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-full aspect-square bg-muted">
                    <NextImage
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      fill
                      className="object-cover"
                    />
                    {asset.contentType === "ai_generated" && (
                      <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {asset.brandColor && (
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: asset.brandColor }}
                          />
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {asset.brandName}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {fileTypeConfig.label}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DesignIcon className="h-3 w-3" />
                        {designTypeConfig?.label || asset.designType}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{formatFileSize(asset.fileSize)}</span>
                      <span>{format(asset.createdAt, "MMM d")}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadAssetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </PageContainer>
  )
}
