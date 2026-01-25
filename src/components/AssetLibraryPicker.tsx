'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  X, 
  Search, 
  ChevronDown, 
  Grid3x3, 
  List as ListIcon,
  Check,
  AlertCircle,
  XCircle,
  Clock,
  CheckCircle,
  Image as ImageIcon,
  FileText,
  Video,
  File
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LinkedAsset } from '@/types/mediaManager'
import { MOCK_ASSET_LIBRARY } from '@/lib/mockData'

interface AssetLibraryPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (selectedAssets: LinkedAsset[]) => void
  multiSelect?: boolean
  filterMode?: 'all' | 'cleared-only' | 'training-mode'
  selectedAssetIds?: string[]
}

type ViewMode = 'grid' | 'list'
type FileTypeFilter = 'all' | 'images' | 'videos' | 'documents' | 'design'
type StatusFilter = 'all' | 'cleared' | 'pending' | 'uncleared' | 'in-progress'
type DateFilter = 'all' | '7days' | '30days' | '3months' | '6months'
type SortField = 'filename' | 'type' | 'status' | 'size' | 'date'
type SortDirection = 'asc' | 'desc'

export function AssetLibraryPicker({
  isOpen,
  onClose,
  onSelect,
  multiSelect = true,
  filterMode = 'all',
  selectedAssetIds = []
}: AssetLibraryPickerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    filterMode === 'cleared-only' || filterMode === 'training-mode' ? 'cleared' : 'all'
  )
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedAssetIds))
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  
  const gridRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(selectedAssetIds))
    }
  }, [isOpen, selectedAssetIds])

  // Reset lastSelectedIndex when filters change to prevent range selection bugs
  useEffect(() => {
    setLastSelectedIndex(null)
  }, [debouncedSearch, typeFilter, statusFilter, dateFilter, sortField, sortDirection])

  // Get file type from MIME type
  const getFileTypeCategory = (fileType: string): FileTypeFilter => {
    if (fileType.startsWith('image/')) return 'images'
    if (fileType.startsWith('video/')) return 'videos'
    if (fileType.includes('pdf') || fileType.includes('document')) return 'documents'
    if (fileType.includes('photoshop') || fileType.includes('illustrator') || 
        fileType.includes('figma') || fileType.includes('sketch')) return 'design'
    return 'all'
  }

  // Get file icon
  const getFileIcon = (fileType: string) => {
    const category = getFileTypeCategory(fileType)
    switch (category) {
      case 'images': return <ImageIcon className="w-8 h-8 text-blue-500" />
      case 'videos': return <Video className="w-8 h-8 text-purple-500" />
      case 'documents': return <FileText className="w-8 h-8 text-red-500" />
      case 'design': return <File className="w-8 h-8 text-green-500" />
      default: return <File className="w-8 h-8 text-gray-500" />
    }
  }

  // Get clearance status icon
  const getClearanceIcon = (status: LinkedAsset['clearanceStatus']) => {
    switch (status) {
      case 'cleared':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'uncleared':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  // Get clearance status label
  const getClearanceLabel = (status: LinkedAsset['clearanceStatus']) => {
    switch (status) {
      case 'cleared': return 'Cleared'
      case 'pending': return 'Pending'
      case 'uncleared': return 'Uncleared'
      default: return 'In Progress'
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  // Format relative date
  const formatRelativeDate = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Check if date matches filter
  const matchesDateFilter = (date: Date): boolean => {
    if (dateFilter === 'all') return true
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    switch (dateFilter) {
      case '7days': return diffDays <= 7
      case '30days': return diffDays <= 30
      case '3months': return diffDays <= 90
      case '6months': return diffDays <= 180
      default: return true
    }
  }

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let assets = [...MOCK_ASSET_LIBRARY]

    // Apply filter mode
    if (filterMode === 'cleared-only' || filterMode === 'training-mode') {
      assets = assets.filter(a => a.clearanceStatus === 'cleared')
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      assets = assets.filter(asset => 
        asset.filename.toLowerCase().includes(query) ||
        asset.metadata?.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        asset.metadata?.uploader?.toLowerCase().includes(query)
      )
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      assets = assets.filter(asset => getFileTypeCategory(asset.fileType) === typeFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      assets = assets.filter(asset => asset.clearanceStatus === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      assets = assets.filter(asset => matchesDateFilter(asset.uploadedAt))
    }

    // Sort assets
    assets.sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'filename':
          comparison = a.filename.localeCompare(b.filename)
          break
        case 'type':
          comparison = a.fileType.localeCompare(b.fileType)
          break
        case 'status':
          comparison = a.clearanceStatus.localeCompare(b.clearanceStatus)
          break
        case 'size':
          comparison = a.fileSize - b.fileSize
          break
        case 'date':
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime()
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return assets
  }, [debouncedSearch, typeFilter, statusFilter, dateFilter, sortField, sortDirection, filterMode])

  // Handle asset selection
  const toggleAssetSelection = useCallback((assetId: string, index: number, event?: React.MouseEvent) => {
    if (!multiSelect) {
      // Single select mode
      setSelectedIds(new Set([assetId]))
      setLastSelectedIndex(index)
      return
    }

    // Multi-select mode
    setSelectedIds(prev => {
      const newSelection = new Set(prev)
      
      // Handle shift-click for range selection
      if (event?.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)
        
        for (let i = start; i <= end; i++) {
          if (filteredAssets[i]) {
            newSelection.add(filteredAssets[i].id)
          }
        }
      } else {
        // Toggle individual selection
        if (newSelection.has(assetId)) {
          newSelection.delete(assetId)
        } else {
          newSelection.add(assetId)
        }
      }
      
      return newSelection
    })
    
    setLastSelectedIndex(index)
  }, [multiSelect, lastSelectedIndex, filteredAssets])

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      // Deselect all
      setSelectedIds(new Set())
    } else {
      // Select all filtered assets
      setSelectedIds(new Set(filteredAssets.map(a => a.id)))
    }
  }

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Handle confirm selection
  const handleConfirm = () => {
    const selected = MOCK_ASSET_LIBRARY.filter(a => selectedIds.has(a.id))
    onSelect(selected)
    onClose()
  }

  // Handle cancel
  const handleCancel = () => {
    setSelectedIds(new Set(selectedAssetIds))
    onClose()
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter(filterMode === 'cleared-only' || filterMode === 'training-mode' ? 'cleared' : 'all')
    setDateFilter('all')
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter' && selectedIds.size > 0) {
        handleConfirm()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        handleSelectAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIds, handleCancel, handleConfirm, handleSelectAll])

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || 
    (statusFilter !== 'all' && filterMode === 'all') || dateFilter !== 'all'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select from Asset Library
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filter Mode Info Banner */}
        {(filterMode === 'cleared-only' || filterMode === 'training-mode') && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex-shrink-0">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ Only cleared assets can be used for training data
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 space-y-3 flex-shrink-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename, tags, or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Filter Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FileTypeFilter)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="documents">Documents</option>
              <option value="design">Design Files</option>
            </select>

            {/* Status Filter - Hidden in cleared-only mode */}
            {filterMode === 'all' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="cleared">✓ Cleared</option>
                <option value="pending">⚠ Pending Review</option>
                <option value="uncleared">❌ Uncleared</option>
              </select>
            )}

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear Filters
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded transition",
                  viewMode === 'grid' 
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded transition",
                  viewMode === 'list' 
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Select All / Clear Selection */}
            {multiSelect && filteredAssets.length > 0 && (
              <button
                onClick={selectedIds.size === filteredAssets.length ? handleClearSelection : handleSelectAll}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                {selectedIds.size === filteredAssets.length ? 'Clear Selection' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4" ref={gridRef}>
          {filteredAssets.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {MOCK_ASSET_LIBRARY.length === 0 ? (
                <>
                  <File className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No assets yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload your first asset to get started
                  </p>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
                    Upload Asset
                  </button>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No assets match your filters
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg transition"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset, index) => {
                const isSelected = selectedIds.has(asset.id)
                const isImage = asset.fileType.startsWith('image/')
                
                return (
                  <div
                    key={asset.id}
                    onClick={(e) => toggleAssetSelection(asset.id, index, e)}
                    className={cn(
                      "relative group cursor-pointer rounded-lg border-2 transition-all hover:scale-[1.02]",
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    title={asset.filename}
                  >
                    {/* Checkbox */}
                    {multiSelect && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition",
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    )}

                    {/* Clearance Status Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm">
                        {getClearanceIcon(asset.clearanceStatus)}
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                      {isImage ? (
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(asset.fileType)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {asset.filename}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(asset.fileSize)}</span>
                        <span>{formatRelativeDate(asset.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // List View
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {multiSelect && (
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredAssets.length && filteredAssets.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </th>
                    )}
                    <th className="w-16 px-4 py-3"></th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('filename')}
                    >
                      Filename {sortField === 'filename' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('status')}
                    >
                      Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('size')}
                    >
                      Size {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('date')}
                    >
                      Uploaded {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAssets.map((asset, index) => {
                    const isSelected = selectedIds.has(asset.id)
                    const isImage = asset.fileType.startsWith('image/')
                    
                    return (
                      <tr
                        key={asset.id}
                        onClick={(e) => toggleAssetSelection(asset.id, index, e)}
                        className={cn(
                          "cursor-pointer transition",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        {multiSelect && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          {isImage ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.filename}
                              className="w-10 h-10 rounded object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-10 flex items-center justify-center">
                              {getFileIcon(asset.fileType)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {asset.filename}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getClearanceIcon(asset.clearanceStatus)}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {getClearanceLabel(asset.clearanceStatus)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(asset.fileSize)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatRelativeDate(asset.uploadedAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {multiSelect ? (
              <span>
                {selectedIds.size} {selectedIds.size === 1 ? 'asset' : 'assets'} selected
              </span>
            ) : (
              <span>
                {selectedIds.size === 1 ? '1 asset selected' : 'Select an asset'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition",
                selectedIds.size > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              Select
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
