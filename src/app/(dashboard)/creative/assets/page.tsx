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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { mockAssets, mockBrands, mockVersionGroups } from "@/lib/mock-data/creative"
import { getDesignTypeIcon } from "@/lib/design-icons"
import { formatFileSize } from "@/lib/format-utils"
import { isApprovalApproved, isApprovalPending } from "@/lib/approval-utils"
import { PageContainer } from "@/components/layout/PageContainer"
import { UploadAssetDialog, ApprovalStatusIcon, QualityScoreBadge } from "@/components/creative"
import { AssetFileType, AssetContentType, DesignType, ASSET_FILE_TYPE_CONFIG, DESIGN_TYPE_CONFIG, AssetVersionGroup } from "@/types/creative"
import { VersionStatusBadge } from "@/components/assets"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { StickyHorizontalScroll } from "@/components/ui/sticky-horizontal-scroll"
import { toast } from "sonner"
import { format } from "date-fns"
import NextImage from "next/image"
import Link from "next/link"

// Custom View Type Definition
interface CustomView {
  id: string
  label: string
  isCustom: true
  filters: {
    brandFilter?: string
    fileTypeFilter?: AssetFileType | "all"
    designTypeFilter?: DesignType | "all"
    contentTypeFilter?: AssetContentType | "all"
    sortBy?: string
  }
}

export default function AssetsPage() {
  const router = useRouter()
  const topRef = useRef<HTMLDivElement>(null)
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
  
  // Custom views state
  const [customViews, setCustomViews] = useState<CustomView[]>([])
  const [createViewDialogOpen, setCreateViewDialogOpen] = useState(false)
  const [newViewName, setNewViewName] = useState("")
  const [newViewFilters, setNewViewFilters] = useState({
    brandFilter: brandFilter,
    fileTypeFilter: fileTypeFilter,
    designTypeFilter: designTypeFilter,
    contentTypeFilter: contentTypeFilter,
    sortBy: sortBy,
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [selectAllPages, setSelectAllPages] = useState(false)
  const [deselectedAssets, setDeselectedAssets] = useState<Set<string>>(new Set())

  // Load custom views from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('assets-custom-views')
      if (stored) {
        const parsed = JSON.parse(stored)
        setCustomViews(parsed)
      }
    } catch (error) {
      console.error('Failed to load custom views:', error)
      // Fallback to empty array on error
    }
  }, [])

  // Save custom views to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('assets-custom-views', JSON.stringify(customViews))
    } catch (error) {
      console.error('Failed to save custom views:', error)
      toast.error('Failed to save custom view')
    }
  }, [customViews])

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

  // Apply "Show all selected" filter
  const displayAssets = useMemo(() => {
    if (!showAllSelected) return sortedAssets
    
    if (selectAllPages) {
      // When all pages selected, show all except deselected
      return sortedAssets.filter(asset => !deselectedAssets.has(asset.id))
    } else {
      // Show only individually selected assets
      return sortedAssets.filter(asset => selectedAssets.has(asset.id))
    }
  }, [sortedAssets, showAllSelected, selectAllPages, selectedAssets, deselectedAssets])

  // Paginate the display assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return displayAssets.slice(startIndex, endIndex)
  }, [displayAssets, currentPage, pageSize])

  // Calculate total pages
  const totalPages = Math.ceil(displayAssets.length / pageSize)

  // Calculate stats
  const totalSize = sortedAssets.reduce((acc, a) => acc + a.fileSize, 0)
  const imageCount = sortedAssets.filter((a) => a.fileType === "image").length
  const documentCount = sortedAssets.filter((a) => a.fileType === "pdf" || a.fileType === "document").length
  const aiCount = sortedAssets.filter((a) => a.contentType === "ai_generated").length
  const originalCount = sortedAssets.filter((a) => a.contentType === "original").length

  // Define default view tabs
  const defaultViews = useMemo(() => [
    { id: 'all', label: 'All', count: sortedAssets.length },
    { id: 'images', label: 'Images', fileType: 'image' as const, count: imageCount },
    { id: 'ai', label: 'AI Generated', contentType: 'ai_generated' as const, count: aiCount },
    { id: 'recent', label: 'Recent', sortBy: 'date-desc' as const, count: sortedAssets.length },
  ], [sortedAssets.length, imageCount, aiCount])

  // Merge default and custom views
  const allViews = useMemo(() => [
    ...defaultViews,
    ...customViews
  ], [defaultViews, customViews])

  // Calculate selection count
  const selectionCount = useMemo(() => {
    if (selectAllPages) {
      return sortedAssets.length - deselectedAssets.size
    }
    return selectedAssets.size
  }, [selectAllPages, sortedAssets.length, deselectedAssets.size, selectedAssets.size])

  // Selection handlers
  const handleSelect = (id: string, selected: boolean) => {
    if (selectAllPages) {
      // When all pages are selected, manage deselected items
      const newDeselected = new Set(deselectedAssets)
      if (selected) {
        // Re-selecting: remove from deselected
        newDeselected.delete(id)
      } else {
        // Deselecting: add to deselected
        newDeselected.add(id)
      }
      setDeselectedAssets(newDeselected)
    } else {
      // Normal individual selection mode
      const newSelected = new Set(selectedAssets)
      if (selected) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      setSelectedAssets(newSelected)
    }
  }

  const handleSelectAllOnPage = () => {
    // Select all items on current page
    if (selectAllPages) {
      // In all-pages mode, remove current page items from deselected
      const newDeselected = new Set(deselectedAssets)
      paginatedAssets.forEach(asset => newDeselected.delete(asset.id))
      setDeselectedAssets(newDeselected)
    } else {
      // Check if all items on current page are selected
      const allPageSelected = paginatedAssets.every(asset => selectedAssets.has(asset.id))
      const newSelected = new Set(selectedAssets)
      
      if (allPageSelected) {
        // Deselect all on page
        paginatedAssets.forEach(asset => newSelected.delete(asset.id))
      } else {
        // Select all on page
        paginatedAssets.forEach(asset => newSelected.add(asset.id))
      }
      setSelectedAssets(newSelected)
    }
  }

  const handleSelectAllAssets = () => {
    // Select all assets across all pages
    setSelectAllPages(true)
    setDeselectedAssets(new Set())
    setSelectedAssets(new Set())
  }

  const handleClearSelection = () => {
    setSelectedAssets(new Set())
    setSelectAllPages(false)
    setDeselectedAssets(new Set())
  }

  // Check if an asset is selected
  const isAssetSelected = (id: string): boolean => {
    if (selectAllPages) {
      return !deselectedAssets.has(id)
    }
    return selectedAssets.has(id)
  }

  const handleBulkDownload = () => {
    toast.success(`Downloading ${selectionCount} assets...`)
    // In a real app, this would trigger a bulk download
  }

  // Get selected asset IDs (for bulk operations)
  const getSelectedAssetIds = (): string[] => {
    if (selectAllPages) {
      return sortedAssets
        .filter(asset => !deselectedAssets.has(asset.id))
        .map(asset => asset.id)
    }
    return Array.from(selectedAssets)
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

  // Count items in the approvals queue (matches approvals page: standalone assets + version rows, pending by status)
  const pendingApprovalCount = useMemo(() => {
    const standalonePending = mockAssets.filter((a) => isApprovalPending(a.approvalStatus)).length
    const versionPending = mockVersionGroups.reduce((sum, g) => {
      return sum + g.versions.filter((v) => isApprovalPending(v.status ?? v.approvalStatus)).length
    }, 0)
    return standalonePending + versionPending
  }, [])

  // Handle view tab changes
  const handleViewChange = (viewId: string) => {
    setSelectedView(viewId)
    const view = allViews.find(v => v.id === viewId)
    if (view) {
      // Check if it's a custom view with filters
      if ('isCustom' in view && view.isCustom && view.filters) {
        // Apply custom view filters
        setBrandFilter(view.filters.brandFilter || 'all')
        setFileTypeFilter(view.filters.fileTypeFilter || 'all')
        setDesignTypeFilter(view.filters.designTypeFilter || 'all')
        setContentTypeFilter(view.filters.contentTypeFilter || 'all')
        setSortBy(view.filters.sortBy || 'date-desc')
      } else {
        // Reset all filters to defaults first for default views
        if (viewId !== 'all') {
          setBrandFilter('all')
          setFileTypeFilter('all')
          setDesignTypeFilter('all')
          setContentTypeFilter('all')
          setSortBy('date-desc')
        }
        
        // Then apply specific filter for this view
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
          setBrandFilter('all')
          setFileTypeFilter('all')
          setDesignTypeFilter('all')
          setContentTypeFilter('all')
          setSortBy('date-desc')
        }
      }
    }
  }

  // Handle create view dialog open
  const handleCreateView = () => {
    // Pre-fill dialog with current filter state
    setNewViewFilters({
      brandFilter: brandFilter,
      fileTypeFilter: fileTypeFilter,
      designTypeFilter: designTypeFilter,
      contentTypeFilter: contentTypeFilter,
      sortBy: sortBy,
    })
    setNewViewName('')
    setCreateViewDialogOpen(true)
  }

  // Handle save new view
  const handleSaveView = () => {
    if (!newViewName.trim()) {
      toast.error('Please enter a view name')
      return
    }

    const newView: CustomView = {
      id: `custom-${Date.now()}`,
      label: newViewName.trim(),
      isCustom: true,
      filters: newViewFilters,
    }

    setCustomViews([...customViews, newView])
    setCreateViewDialogOpen(false)
    setNewViewName('')
    
    // Switch to the new view
    setTimeout(() => {
      handleViewChange(newView.id)
    }, 0)
    
    toast.success('View created')
  }

  // Handle delete view
  const handleDeleteView = (viewId: string) => {
    setCustomViews(customViews.filter(v => v.id !== viewId))
    
    // If the deleted view was active, switch to 'all'
    if (selectedView === viewId) {
      handleViewChange('all')
    }
    
    toast('View deleted')
  }

  // Scroll to top on page change - use scrollIntoView approach
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' })
      
      // Additional fallback scrolls
      const scrollContainer = document.getElementById('main-scroll-container')
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = 0
          if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' })
          }
        }, 0)
        
        setTimeout(() => {
          scrollContainer.scrollTop = 0
          if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' })
          }
        }, 50)
      }
    }
  }, [currentPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, brandFilter, fileTypeFilter, designTypeFilter, contentTypeFilter, sortBy, showAllSelected])

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
        setSelectAllPages(false)
        setDeselectedAssets(new Set())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header - Linear Style */}
      <div ref={topRef} className="flex items-center justify-between">
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
        {/* Tabs with horizontal scroll and fade effect */}
        <div className="relative flex-1 min-w-0">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable tabs container */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-1">
            {allViews.map(view => {
              const isCustomView = 'isCustom' in view && view.isCustom
              
              // For custom views, wrap in positioned div for delete button
              if (isCustomView) {
                return (
                  <div key={view.id} className="relative group">
                    <Button
                      variant={selectedView === view.id ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 rounded-full px-4 pr-8 shrink-0"
                      onClick={() => handleViewChange(view.id)}
                    >
                      {view.label}
                      {'count' in view && typeof view.count === 'number' && (
                        <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{view.count}</Badge>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteView(view.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              }
              
              // For default views, render clean button
              return (
                <Button
                  key={view.id}
                  variant={selectedView === view.id ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 rounded-full px-4 shrink-0"
                  onClick={() => handleViewChange(view.id)}
                >
                  {view.label}
                  {'count' in view && typeof view.count === 'number' && (
                    <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{view.count}</Badge>
                  )}
                </Button>
              )
            })}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full shrink-0"
              onClick={handleCreateView}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </div>

        {/* Right side controls - always visible */}
        <div className="flex items-center gap-2 ml-2 shrink-0">
          {/* Page size selector */}
          <Select 
            value={pageSize.toString()} 
            onValueChange={(val) => {
              setPageSize(Number(val))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 items</SelectItem>
              <SelectItem value="50">50 items</SelectItem>
              <SelectItem value="100">100 items</SelectItem>
            </SelectContent>
          </Select>

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
            <div className="flex items-center border rounded-md">
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
                  Select all {sortedAssets.length} assets
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
                const ids = getSelectedAssetIds().join(',')
                router.push(`/creative/assets/bulk-edit?ids=${ids}`)
              }}
            >
              Bulk edit
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

      {/* Bulk Actions Bar when all pages selected */}
      {selectAllPages && (
        <div className="sticky top-0 z-20 flex items-center justify-between py-2 border-b bg-background">
          <div className="flex items-center gap-2">
            {/* "All X selected" dropdown */}
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

            {/* Bulk edit button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8" 
              onClick={() => {
                const ids = getSelectedAssetIds().join(',')
                router.push(`/creative/assets/bulk-edit?ids=${ids}`)
              }}
            >
              Bulk edit
            </Button>

            {/* More actions menu */}
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
      )}

      {/* Filter Panel - Linear Style Compact */}
      {filtersOpen && selectionCount === 0 && (
        <div className="border-b bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-3">
            {/* Title & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">Filters</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 -mr-1"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Filters in a row */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Brand */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Brand</label>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="h-7 w-[140px] text-xs">
                    <SelectValue />
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

              {/* File Type */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label className="text-xs text-muted-foreground whitespace-nowrap">File Type</label>
                <Select value={fileTypeFilter} onValueChange={(v) => setFileTypeFilter(v as AssetFileType | "all")}>
                  <SelectTrigger className="h-7 w-[120px] text-xs">
                    <SelectValue />
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

              {/* Category */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Category</label>
                <Select value={designTypeFilter} onValueChange={(v) => setDesignTypeFilter(v as DesignType | "all")}>
                  <SelectTrigger className="h-7 w-[130px] text-xs">
                    <SelectValue />
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

              {/* Source */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Source</label>
                <Select value={contentTypeFilter} onValueChange={(v) => setContentTypeFilter(v as AssetContentType | "all")}>
                  <SelectTrigger className="h-7 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="ai_generated">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        AI Generated
                      </div>
                    </SelectItem>
                    <SelectItem value="original">Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear button - only show when filters active */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs shrink-0"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Assets View - Table or Grid */}
      {viewMode === 'table' ? (
        <StickyHorizontalScroll>
          <div className="border rounded-lg bg-card">
            <Table className="w-max min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="sticky left-0 z-20 h-9 w-[30px] bg-background">
                  <Checkbox
                    checked={paginatedAssets.length > 0 && paginatedAssets.every(asset => isAssetSelected(asset.id))}
                    onCheckedChange={handleSelectAllOnPage}
                  />
                </TableHead>
                <TableHead className="sticky left-[30px] z-20 h-9 w-[50px] bg-background"></TableHead>
                <TableHead className="h-9 min-w-[370px] text-xs font-medium">Asset</TableHead>
                <TableHead className="h-9 min-w-[150px] text-xs font-medium">Brand</TableHead>
                <TableHead className="h-9 min-w-[300px] text-xs font-medium">Info</TableHead>
                <TableHead className="h-9 min-w-[100px] text-xs font-medium text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
                paginatedAssets.map((asset) => {
                  const fileTypeConfig = ASSET_FILE_TYPE_CONFIG[asset.fileType]
                  const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
                  const DesignIcon = designTypeConfig ? getDesignTypeIcon(designTypeConfig.iconName) : FileImage
                  const isSelected = isAssetSelected(asset.id)

                  const isVersionGroup = 'isVersionGroup' in asset && asset.isVersionGroup && 'versionGroup' in asset && asset.versionGroup
                  const assetHref = isVersionGroup 
                    ? `/creative/assets/${asset.id}/v/${(asset as any).versionGroup.currentVersionNumber}`
                    : `/creative/assets/${asset.id}`
                  
                  return (
                    <TableRow
                      key={asset.id}
                      className="h-10 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(assetHref)}
                    >
                      {/* Checkbox */}
                      <TableCell className="sticky left-0 z-10 py-1.5 bg-background" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelect(asset.id, checked === true)}
                        />
                      </TableCell>

                      {/* Thumbnail - sticky */}
                      <TableCell className="sticky left-[30px] z-10 py-1.5 bg-background">
                        <div className="relative h-7 w-7 rounded overflow-hidden bg-muted shrink-0">
                          <NextImage
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>

                      {/* Asset Info - scrollable */}
                      <TableCell className="py-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{asset.name}</p>
                            {asset.contentType === "ai_generated" && (
                              <div title="AI Generated">
                                <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
                              </div>
                            )}
                            <ApprovalStatusIcon asset={asset} />
                            {asset.reviewData ? (
                              <QualityScoreBadge asset={asset} />
                            ) : isApprovalApproved(asset.approvalStatus) && !asset.reviewData ? (
                              <Badge variant="outline" className="text-[10px]">Manual</Badge>
                            ) : null}
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
                              <Link href={assetHref}>
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
        </StickyHorizontalScroll>
      ) : (
        // Grid View
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {displayAssets.length === 0 ? (
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
            paginatedAssets.map((asset) => {
              const fileTypeConfig = ASSET_FILE_TYPE_CONFIG[asset.fileType]
              const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
              const DesignIcon = designTypeConfig ? getDesignTypeIcon(designTypeConfig.iconName) : FileImage
              const isSelected = isAssetSelected(asset.id)

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
                        {asset.contentType === "ai_generated" && (
                          <Sparkles className="h-3 w-3 text-purple-500" />
                        )}
                        <ApprovalStatusIcon asset={asset} showLabel />
                        {asset.reviewData && (
                          <QualityScoreBadge asset={asset} />
                        )}
                      </div>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={displayAssets.length}
          onPageChange={setCurrentPage}
          className="mt-2"
        />
      )}

      {/* Create View Dialog */}
      <Dialog open={createViewDialogOpen} onOpenChange={setCreateViewDialogOpen}>
        <DialogContent className="max-w-[400px] p-4 gap-3">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-medium">Create view</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Name input */}
            <div className="space-y-1.5">
              <Label htmlFor="view-name" className="text-xs font-medium text-muted-foreground">
                Name
              </Label>
              <Input
                id="view-name"
                placeholder="My filtered view"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newViewName.trim()) {
                    handleSaveView()
                  }
                }}
                className="h-8 text-sm"
                autoFocus
              />
            </div>

            {/* Filters section */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Filters</Label>
              
              <div className="space-y-2">
                {/* Brand filter */}
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="view-brand" className="text-sm text-foreground w-24">Brand</Label>
                  <Select 
                    value={newViewFilters.brandFilter} 
                    onValueChange={(val) => setNewViewFilters({...newViewFilters, brandFilter: val})}
                  >
                    <SelectTrigger id="view-brand" className="h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All brands</SelectItem>
                      {mockBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File type filter */}
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="view-file-type" className="text-sm text-foreground w-24">File type</Label>
                  <Select 
                    value={newViewFilters.fileTypeFilter} 
                    onValueChange={(val) => setNewViewFilters({...newViewFilters, fileTypeFilter: val as AssetFileType | "all"})}
                  >
                    <SelectTrigger id="view-file-type" className="h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Design type filter */}
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="view-design-type" className="text-sm text-foreground w-24">Design type</Label>
                  <Select 
                    value={newViewFilters.designTypeFilter} 
                    onValueChange={(val) => setNewViewFilters({...newViewFilters, designTypeFilter: val as DesignType | "all"})}
                  >
                    <SelectTrigger id="view-design-type" className="h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All designs</SelectItem>
                      {Object.entries(DESIGN_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content type filter */}
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="view-content-type" className="text-sm text-foreground w-24">Content type</Label>
                  <Select 
                    value={newViewFilters.contentTypeFilter} 
                    onValueChange={(val) => setNewViewFilters({...newViewFilters, contentTypeFilter: val as AssetContentType | "all"})}
                  >
                    <SelectTrigger id="view-content-type" className="h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All content</SelectItem>
                      <SelectItem value="ai_generated">AI Generated</SelectItem>
                      <SelectItem value="original">Original</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort by */}
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="view-sort" className="text-sm text-foreground w-24">Sort by</Label>
                  <Select 
                    value={newViewFilters.sortBy} 
                    onValueChange={(val) => setNewViewFilters({...newViewFilters, sortBy: val})}
                  >
                    <SelectTrigger id="view-sort" className="h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Most recent</SelectItem>
                      <SelectItem value="date-asc">Oldest first</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateViewDialogOpen(false)}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveView}
              disabled={!newViewName.trim()}
              className="h-8"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <UploadAssetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </PageContainer>
  )
}
