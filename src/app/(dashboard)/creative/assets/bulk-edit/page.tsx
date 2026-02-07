"use client"

import { useState, useMemo, useCallback, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ArrowLeft, Columns, Search, AlertTriangle, ChevronDown, FileImage } from "lucide-react"
import { mockAssets, mockVersionGroups, mockBrands } from "@/lib/mock-data/creative"
import { BULK_EDIT_CATEGORIES, EDITABLE_FIELDS } from "@/config/bulk-edit-fields"
import { EditableCell } from "@/components/creative"
import type { Asset, AssetVersion } from "@/types/creative"
import type { BulkEditChange } from "@/types/bulk-edit"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import NextImage from "next/image"

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj)
}

function BulkEditPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assetIds = searchParams.get('ids')?.split(',') || []
  
  // Get assets from mock data
  const allAssets = useMemo(() => {
    return [...mockAssets, ...mockVersionGroups.flatMap(g => g.versions)]
  }, [])
  
  const selectedAssets = useMemo(() => {
    // Handle both regular asset IDs and version group IDs
    const expandedIds: string[] = []
    
    assetIds.forEach(id => {
      // Check if this is a version group ID
      const versionGroup = mockVersionGroups.find(vg => vg.id === id)
      if (versionGroup) {
        // Add all version IDs from this group
        expandedIds.push(...versionGroup.versions.map(v => v.id))
      } else {
        // Regular asset ID
        expandedIds.push(id)
      }
    })
    
    return allAssets.filter(a => expandedIds.includes(a.id))
  }, [allAssets, assetIds])
  
  // Enrich EDITABLE_FIELDS with dynamic brand options
  const enrichedFields = useMemo(() => {
    return EDITABLE_FIELDS.map(field => {
      if (field.id === 'brandId') {
        // Explicitly preserve all field properties and add brand options
        return {
          ...field,
          options: mockBrands.map(brand => ({
            value: brand.id,
            label: brand.name
          }))
        } as typeof field
      }
      return field
    })
  }, [])
  
  // State
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "brandId", "designType", "tags", "approvalStatus", "qualityScore"
  ])
  const [changes, setChanges] = useState<BulkEditChange[]>([])
  const [saving, setSaving] = useState(false)
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const groupIds = new Set<string>()
    assetIds.forEach(id => {
      const versionGroup = mockVersionGroups.find(vg => vg.id === id)
      if (versionGroup) {
        groupIds.add(versionGroup.id)
      }
    })
    return groupIds
  })
  
  // Enhanced asset list with parent-child relationships
  const hierarchicalAssets = useMemo(() => {
    const result: Array<{
      asset: Asset | AssetVersion
      isParent: boolean
      isVersion: boolean
      parentId?: string
      versionNumber?: number
      groupId?: string
    }> = []
    
    assetIds.forEach(id => {
      const versionGroup = mockVersionGroups.find(vg => vg.id === id)
      if (versionGroup) {
        // Add parent group entry with complete properties
        const latestVersion = versionGroup.versions[versionGroup.versions.length - 1]
        result.push({
          asset: {
            id: versionGroup.id,
            name: versionGroup.name,
            brandId: versionGroup.brandId,
            brandName: versionGroup.brandName,
            brandColor: versionGroup.brandColor,
            brandLogoUrl: versionGroup.brandLogoUrl,
            designType: versionGroup.designType,
            tags: versionGroup.tags,
            thumbnailUrl: latestVersion.thumbnailUrl,
            fileUrl: latestVersion.fileUrl,
            fileType: latestVersion.fileType,
            contentType: latestVersion.contentType,
            fileSize: latestVersion.fileSize,
            mimeType: latestVersion.mimeType,
            dimensions: latestVersion.dimensions,
            createdAt: versionGroup.createdAt,
            updatedAt: versionGroup.updatedAt,
            approvalStatus: 'submitted',
            uploadedById: latestVersion.uploadedById,
            uploadedByName: latestVersion.uploadedByName,
          } as Asset,
          isParent: true,
          isVersion: false,
          groupId: versionGroup.id
        })
        
        // Add versions if expanded
        if (expandedGroups.has(versionGroup.id)) {
          versionGroup.versions.forEach(version => {
            result.push({
              asset: version,
              isParent: false,
              isVersion: true,
              parentId: versionGroup.id,
              versionNumber: version.versionNumber,
              groupId: versionGroup.id
            })
          })
        }
      } else {
        // Regular asset (not a version group)
        const asset = allAssets.find(a => a.id === id)
        if (asset) {
          result.push({
            asset,
            isParent: false,
            isVersion: false
          })
        }
      }
    })
    
    return result
  }, [assetIds, expandedGroups, allAssets])
  
  // Persistent map to track which IDs are versions (independent of expand state)
  const assetTypeMap = useMemo(() => {
    const map = new Map<string, { isVersion: boolean; parentId?: string }>()
    
    assetIds.forEach(id => {
      const versionGroup = mockVersionGroups.find(vg => vg.id === id)
      if (versionGroup) {
        // Mark parent
        map.set(versionGroup.id, { isVersion: false })
        
        // Mark all versions
        versionGroup.versions.forEach(version => {
          map.set(version.id, { 
            isVersion: true, 
            parentId: versionGroup.id 
          })
        })
      } else {
        // Regular asset
        map.set(id, { isVersion: false })
      }
    })
    
    return map
  }, [assetIds])
  
  // Derived state
  const hasChanges = changes.length > 0
  const errorCount = changes.filter(c => c.error).length
  
  // Cell change handler
  const handleCellChange = useCallback((assetId: string, fieldPath: string, newValue: any, oldValue: any) => {
    setChanges(prev => {
      const filtered = prev.filter(c => !(c.assetId === assetId && c.fieldPath === fieldPath))
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        return [...filtered, { assetId, fieldPath, oldValue, newValue }]
      }
      return filtered
    })
  }, [])
  
  // Get change for cell
  const getChangeForCell = useCallback((assetId: string, fieldPath: string) => {
    return changes.find(c => c.assetId === assetId && c.fieldPath === fieldPath)
  }, [changes])
  
  // Get cell value (with changes applied)
  const getCellValue = useCallback((asset: Asset | AssetVersion, fieldPath: string) => {
    const change = getChangeForCell(asset.id, fieldPath)
    return change ? change.newValue : getNestedValue(asset, fieldPath)
  }, [getChangeForCell])
  
  // Save handler
  const handleSave = async () => {
    if (errorCount > 0) {
      toast.error(`Cannot save: ${errorCount} validation errors`)
      return
    }
    
    setSaving(true)
    try {
      // Group changes by type (version vs regular asset)
      const versionChanges: BulkEditChange[] = []
      const assetChanges: BulkEditChange[] = []
      
      changes.forEach(change => {
        const assetType = assetTypeMap.get(change.assetId)
        if (assetType?.isVersion) {
          versionChanges.push({
            ...change,
            isVersion: true,
            parentAssetId: assetType.parentId
          })
        } else {
          assetChanges.push(change)
        }
      })
      
      // In production, send to different endpoints
      // await api.updateVersions(versionChanges)
      // await api.updateAssets(assetChanges)
      
      console.log('Saving version changes:', versionChanges)
      console.log('Saving asset changes:', assetChanges)
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Successfully updated ${changes.length} fields (${versionChanges.length} version edits, ${assetChanges.length} asset edits)`)
      setChanges([])
      // Optionally refresh or redirect
      // router.push('/creative/assets')
    } catch (error) {
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }
  
  // Expand/Collapse handler for version groups
  const handleToggleExpand = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])
  
  // Column toggle handler
  const handleToggleColumn = useCallback((fieldId: string) => {
    setSelectedColumns(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }, [])
  
  // Filtered fields for column selector
  const filteredFields = useMemo(() => {
    if (!searchQuery) return enrichedFields
    const query = searchQuery.toLowerCase()
    return enrichedFields.filter(f =>
      f.label.toLowerCase().includes(query) ||
      f.helpText?.toLowerCase().includes(query)
    )
  }, [searchQuery, enrichedFields])
  
  // Sync table width with bottom scrollbar
  useEffect(() => {
    const scrollArea = document.getElementById('bulk-edit-scroll-area')
    const bottomContent = document.getElementById('bottom-scrollbar-content')
    if (!scrollArea || !bottomContent) return
    
    const updateWidth = () => {
      const table = scrollArea.querySelector('table')
      if (table) {
        bottomContent.style.width = `${table.scrollWidth}px`
      }
    }
    
    updateWidth()
    const resizeObserver = new ResizeObserver(updateWidth)
    const firstChild = scrollArea.firstElementChild
    if (firstChild) {
      resizeObserver.observe(firstChild)
    }
    
    return () => resizeObserver.disconnect()
  }, [selectedColumns, selectedAssets.length])
  
  // Sync scrolling between top and bottom scrollbars
  useEffect(() => {
    const mainScroll = document.getElementById('bulk-edit-scroll-area')
    const bottomScroll = document.getElementById('bottom-scrollbar')
    
    if (!mainScroll || !bottomScroll) return
    
    const handleMainScroll = () => {
      if (mainScroll.scrollLeft !== bottomScroll.scrollLeft) {
        bottomScroll.scrollLeft = mainScroll.scrollLeft
      }
    }
    
    const handleBottomScroll = () => {
      if (bottomScroll.scrollLeft !== mainScroll.scrollLeft) {
        mainScroll.scrollLeft = bottomScroll.scrollLeft
      }
    }
    
    mainScroll.addEventListener('scroll', handleMainScroll)
    bottomScroll.addEventListener('scroll', handleBottomScroll)
    
    return () => {
      mainScroll.removeEventListener('scroll', handleMainScroll)
      bottomScroll.removeEventListener('scroll', handleBottomScroll)
    }
  }, [])
  
  // Show empty state if no assets selected
  if (selectedAssets.length === 0) {
    return (
      <div className="flex items-center justify-center bg-background -m-4 md:-m-6 h-[calc(100vh-8rem)]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No assets selected</p>
          <Button size="sm" className="mt-2" onClick={() => router.push('/creative/assets')}>
            Back to assets
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col bg-background -m-4 md:-m-6 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      {/* Linear-Style Compact Header - h-11 */}
      <div className="flex items-center justify-between px-4 h-11 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => router.push('/creative/assets')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold">Editing {selectedAssets.length} assets</h1>
          
          {hierarchicalAssets.some(h => h.isParent) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const allGroupIds = hierarchicalAssets
                  .filter(h => h.isParent && h.groupId)
                  .map(h => h.groupId!)
                
                if (expandedGroups.size === allGroupIds.length) {
                  setExpandedGroups(new Set())
                } else {
                  setExpandedGroups(new Set(allGroupIds))
                }
              }}
            >
              {expandedGroups.size > 0 ? 'Collapse all' : 'Expand all'}
            </Button>
          )}
          
          {hasChanges && (
            <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
              {changes.length} changes
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {errorCount} errors
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8" 
            onClick={() => setColumnsPanelOpen(true)}
          >
            <Columns className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Columns</span>
          </Button>
          <Button 
            size="sm" 
            className="h-8" 
            onClick={handleSave} 
            disabled={!hasChanges || saving || errorCount > 0}
          >
            <span className="text-xs">{saving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>
      
      {/* Table area with synchronized scrollbars */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Main scrollable content */}
        <div className="flex-1 overflow-auto scrollbar-hide" id="bulk-edit-scroll-area">
          <LinearStyleTable 
            assets={hierarchicalAssets}
            columns={selectedColumns}
            changes={changes}
            onCellChange={handleCellChange}
            getChangeForCell={getChangeForCell}
            getCellValue={getCellValue}
            enrichedFields={enrichedFields}
            expandedGroups={expandedGroups}
            onToggleExpand={handleToggleExpand}
          />
        </div>
        
        {/* Sticky bottom scrollbar - only show when table is wider than viewport */}
        <div className="overflow-x-auto overflow-y-hidden h-3 border-t bg-background" id="bottom-scrollbar">
          <div id="bottom-scrollbar-content" style={{ height: 1 }} />
        </div>
      </div>
      
      {/* Shopify-Style Column Selector Side Panel with Collapsible Groups */}
      <Sheet open={columnsPanelOpen} onOpenChange={setColumnsPanelOpen}>
        <SheetContent side="right" className="w-[320px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle className="text-sm font-bold">Columns</SheetTitle>
            <span className="text-xs text-muted-foreground">{selectedColumns.length} selected</span>
          </SheetHeader>
          
          {/* Search */}
          <div className="px-4 py-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search fields" 
                className="h-8 text-sm pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Collapsible Category Groups (Shopify Style) */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              {Object.entries(BULK_EDIT_CATEGORIES).map(([key, label]) => {
                const categoryFields = filteredFields.filter(f => f.category === key && f.editable && f.id !== 'name')
                if (categoryFields.length === 0) return null
                
                return (
                  <Collapsible key={key} defaultOpen={key === "basic" || key === "brand"} className="mb-3">
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-bold hover:bg-accent/50 rounded px-2 group">
                      <span>{label}</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-1">
                      <div className="space-y-0.5 pl-2">
                        {categoryFields.map(field => (
                          <label 
                            key={field.id} 
                            className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent/50 rounded cursor-pointer"
                          >
                            <Checkbox 
                              checked={selectedColumns.includes(field.id)}
                              onCheckedChange={() => handleToggleColumn(field.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{field.label}</span>
                          </label>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Linear-Style Dense Table Component
interface LinearStyleTableProps {
  assets: Array<{
    asset: Asset | AssetVersion
    isParent: boolean
    isVersion: boolean
    parentId?: string
    versionNumber?: number
    groupId?: string
  }>
  columns: string[]
  changes: BulkEditChange[]
  onCellChange: (assetId: string, fieldPath: string, newValue: any, oldValue: any) => void
  getChangeForCell: (assetId: string, fieldPath: string) => BulkEditChange | undefined
  getCellValue: (asset: Asset | AssetVersion, fieldPath: string) => any
}

function LinearStyleTable({ 
  assets, 
  columns, 
  changes, 
  onCellChange, 
  getChangeForCell, 
  getCellValue,
  enrichedFields,
  expandedGroups,
  onToggleExpand
}: LinearStyleTableProps & { 
  enrichedFields: typeof EDITABLE_FIELDS
  expandedGroups: Set<string>
  onToggleExpand: (groupId: string) => void
}) {
  const fields = useMemo(() => {
    return columns
      .map(colId => enrichedFields.find(f => f.id === colId))
      .filter((field): field is typeof enrichedFields[number] => field !== undefined)
  }, [columns, enrichedFields])
  
  return (
    <table className="w-max min-w-full text-sm font-medium">
      <thead className="sticky top-0 bg-background z-20 border-b">
        <tr className="h-8">
          <th className="sticky top-0 left-0 bg-background z-30 border-r px-2 py-1.5 text-left text-xs font-medium text-muted-foreground">
            Asset Name
          </th>
          {fields.map(field => (
            <th 
              key={field.id} 
              className="px-2 py-1.5 text-left text-xs font-medium text-muted-foreground min-w-[140px]"
            >
              {field.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {assets.map(({asset, isParent, isVersion, versionNumber, groupId, parentId}) => {
          const isExpanded = groupId && expandedGroups.has(groupId)
          
          return (
            <tr 
              key={asset.id} 
              className={cn(
                "border-b border-border hover:bg-accent/10 transition-colors h-8",
                isVersion && "bg-muted/20"
              )}
            >
              <td className={cn(
                "sticky left-0 z-30 border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)] px-2 py-1.5 font-medium text-sm",
                isVersion ? "bg-muted/20 pl-6" : "bg-background"
              )}>
                <div className="flex items-center gap-1.5">
                  {isParent && (
                    <button
                      onClick={() => onToggleExpand(groupId!)}
                      className="hover:bg-accent/50 rounded p-0.5 -ml-1"
                    >
                      <ChevronDown 
                        className={cn(
                          "h-3.5 w-3.5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-0",
                          !isExpanded && "-rotate-90"
                        )} 
                      />
                    </button>
                  )}
                  
                  {isVersion && (
                    <Badge 
                      variant="outline" 
                      className="h-4 px-1 text-[10px] font-mono text-muted-foreground border-muted-foreground/30"
                    >
                      v{versionNumber}
                    </Badge>
                  )}
                  
                  <div className={cn(
                    "rounded overflow-hidden border shrink-0",
                    isVersion ? "h-5 w-5" : "h-6 w-6"
                  )}>
                    {asset.thumbnailUrl ? (
                      <NextImage 
                        src={asset.thumbnailUrl} 
                        alt={asset.name}
                        width={isVersion ? 20 : 24}
                        height={isVersion ? 20 : 24}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <FileImage className={cn(
                          "text-muted-foreground",
                          isVersion ? "h-2.5 w-2.5" : "h-3 w-3"
                        )} />
                      </div>
                    )}
                  </div>
                  
                  <span className={cn(
                    "font-medium text-sm truncate max-w-[200px]",
                    isVersion && "text-muted-foreground font-normal"
                  )} title={asset.name}>
                    {asset.name}
                  </span>
                </div>
              </td>
              
              {fields.map(field => {
                const value = getCellValue(asset, field.path)
                const originalValue = getNestedValue(asset, field.path)
                const change = getChangeForCell(asset.id, field.path)
                
                const isFieldEditable = isVersion 
                  ? (field.versionEditable !== false)
                  : field.editable
                
                // Show dash for inherited fields on versions OR non-inherited fields on parents
                const showDash = (isVersion && field.inheritedFromParent) || (isParent && !field.inheritedFromParent)
                
                return (
                  <td 
                    key={field.id} 
                    className={cn(
                      "px-2 py-1.5",
                      isVersion && "bg-muted/20"
                    )}
                  >
                    {showDash ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <EditableCell
                        field={{...field, editable: isFieldEditable}}
                        value={value}
                        originalValue={originalValue}
                        hasChange={!!change}
                        error={change?.error}
                        onChange={(newValue) => onCellChange(asset.id, field.path, newValue, originalValue)}
                      />
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
      </table>
  )
}

export default function BulkEditPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center bg-background -m-4 md:-m-6 h-[calc(100vh-8rem)]">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <BulkEditPageContent />
    </Suspense>
  )
}
