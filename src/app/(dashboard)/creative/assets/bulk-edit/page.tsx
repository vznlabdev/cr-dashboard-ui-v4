"use client"

import { useState, useMemo, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Columns, Search, AlertTriangle } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { mockAssets, mockVersionGroups } from "@/lib/mock-data/creative"
import { BULK_EDIT_CATEGORIES, EDITABLE_FIELDS, getFieldsByCategory } from "@/config/bulk-edit-fields"
import { EditableCell } from "@/components/creative"
import type { Asset, AssetVersion } from "@/types/creative"
import type { BulkEditChange } from "@/types/bulk-edit"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
  
  // State
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name", "brandId", "designType", "tags", "approvalStatus"
  ])
  const [changes, setChanges] = useState<BulkEditChange[]>([])
  const [saving, setSaving] = useState(false)
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  // Derived state
  const hasChanges = changes.length > 0
  const errorCount = changes.filter(c => c.error).length
  const fieldsByCategory = useMemo(() => getFieldsByCategory(), [])
  
  // Get columns for current tab
  const currentColumns = useMemo(() => {
    if (activeTab === "all") {
      return selectedColumns
    }
    const categoryFields = fieldsByCategory[activeTab] || []
    return categoryFields.map(f => f.id).filter(id => selectedColumns.includes(id))
  }, [activeTab, selectedColumns, fieldsByCategory])
  
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
      // Group changes by asset ID
      const changesByAsset = changes.reduce((acc, change) => {
        if (!acc[change.assetId]) acc[change.assetId] = []
        acc[change.assetId].push(change)
        return acc
      }, {} as Record<string, BulkEditChange[]>)
      
      // Apply changes to each asset
      for (const [assetId, assetChanges] of Object.entries(changesByAsset)) {
        const asset = selectedAssets.find(a => a.id === assetId)
        if (!asset) continue
        
        const updatedAsset = { ...asset }
        assetChanges.forEach(change => {
          const pathParts = change.fieldPath.split('.')
          let current: any = updatedAsset
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) current[pathParts[i]] = {}
            current = current[pathParts[i]]
          }
          current[pathParts[pathParts.length - 1]] = change.newValue
        })
        
        // TODO: Save to backend/context
        console.log('Updated asset:', assetId, updatedAsset)
      }
      
      toast.success(`Successfully updated ${selectedAssets.length} assets`)
      setChanges([])
      router.push('/creative/assets')
    } catch (error) {
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }
  
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
    if (!searchQuery) return EDITABLE_FIELDS
    const query = searchQuery.toLowerCase()
    return EDITABLE_FIELDS.filter(f =>
      f.label.toLowerCase().includes(query) ||
      f.helpText?.toLowerCase().includes(query)
    )
  }, [searchQuery])
  
  // Show empty state if no assets selected
  if (selectedAssets.length === 0) {
    return (
      <PageContainer className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No assets selected</p>
          <Button size="sm" className="mt-2" onClick={() => router.push('/creative/assets')}>
            Back to assets
          </Button>
        </div>
      </PageContainer>
    )
  }
  
  return (
    <PageContainer className="flex flex-col h-[calc(100vh-4rem)] p-0">
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
      
      {/* Linear-Style Compact Tabs - h-9 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="border-b bg-background px-4 shrink-0">
          <TabsList className="h-9 bg-transparent border-0 gap-4">
            <TabsTrigger 
              value="all" 
              className="h-9 px-2 text-xs data-[state=active]:border-b-2 rounded-none"
            >
              All Fields
            </TabsTrigger>
            <TabsTrigger value="basic" className="h-9 px-2 text-xs rounded-none">
              Basic
            </TabsTrigger>
            <TabsTrigger value="brand" className="h-9 px-2 text-xs rounded-none">
              Brand
            </TabsTrigger>
            <TabsTrigger value="files" className="h-9 px-2 text-xs rounded-none">
              Files
            </TabsTrigger>
            <TabsTrigger value="copyright" className="h-9 px-2 text-xs rounded-none">
              Copyright
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="h-9 px-2 text-xs rounded-none">
              A11y
            </TabsTrigger>
            <TabsTrigger value="seo" className="h-9 px-2 text-xs rounded-none">
              SEO
            </TabsTrigger>
            <TabsTrigger value="talent" className="h-9 px-2 text-xs rounded-none">
              Talent
            </TabsTrigger>
            <TabsTrigger value="ai" className="h-9 px-2 text-xs rounded-none">
              AI
            </TabsTrigger>
            <TabsTrigger value="approval" className="h-9 px-2 text-xs rounded-none">
              Approval
            </TabsTrigger>
            <TabsTrigger value="version" className="h-9 px-2 text-xs rounded-none">
              Version
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Table Content - All Tabs */}
        {Object.keys(BULK_EDIT_CATEGORIES).map(categoryKey => (
          <TabsContent 
            key={categoryKey} 
            value={categoryKey} 
            className="flex-1 m-0 overflow-hidden"
          >
            <LinearStyleTable 
              assets={selectedAssets}
              columns={currentColumns}
              changes={changes}
              onCellChange={handleCellChange}
              getChangeForCell={getChangeForCell}
              getCellValue={getCellValue}
            />
          </TabsContent>
        ))}
        
        <TabsContent value="all" className="flex-1 m-0 overflow-hidden">
          <LinearStyleTable 
            assets={selectedAssets}
            columns={currentColumns}
            changes={changes}
            onCellChange={handleCellChange}
            getChangeForCell={getChangeForCell}
            getCellValue={getCellValue}
          />
        </TabsContent>
      </Tabs>
      
      {/* Linear-Style Compact Column Selector Side Panel */}
      <Sheet open={columnsPanelOpen} onOpenChange={setColumnsPanelOpen}>
        <SheetContent side="right" className="w-[340px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle className="text-base">Columns</SheetTitle>
            <SheetDescription className="text-xs">
              {selectedColumns.length} selected
            </SheetDescription>
          </SheetHeader>
          
          {/* Compact search */}
          <div className="px-4 py-2 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search fields" 
                className="h-8 text-xs pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Dense grouped checkboxes */}
          <ScrollArea className="flex-1">
            <div className="px-4 py-2">
              {Object.entries(BULK_EDIT_CATEGORIES).map(([key, label]) => {
                const categoryFields = filteredFields.filter(f => f.category === key && f.editable)
                if (categoryFields.length === 0) return null
                
                return (
                  <div key={key} className="mb-4">
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      {label}
                    </h3>
                    <div className="space-y-0.5">
                      {categoryFields.map(field => (
                        <label 
                          key={field.id} 
                          className="flex items-center gap-2 py-1 px-1.5 hover:bg-accent/50 rounded cursor-pointer"
                        >
                          <Checkbox 
                            checked={selectedColumns.includes(field.id)}
                            onCheckedChange={() => handleToggleColumn(field.id)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="text-xs">{field.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

// Linear-Style Dense Table Component
interface LinearStyleTableProps {
  assets: (Asset | AssetVersion)[]
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
  getCellValue 
}: LinearStyleTableProps) {
  const fields = useMemo(() => {
    return columns.map(colId => EDITABLE_FIELDS.find(f => f.id === colId)).filter(Boolean) as typeof EDITABLE_FIELDS
  }, [columns])
  
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-background z-10 border-b">
          <tr className="h-8">
            <th className="sticky left-0 bg-background z-20 px-3 py-1.5 text-left font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
              Asset
            </th>
            {fields.map(field => (
              <th 
                key={field.id} 
                className="px-3 py-1.5 text-left font-medium text-[11px] text-muted-foreground uppercase tracking-wide min-w-[180px]"
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr 
              key={asset.id} 
              className="border-b border-border/40 hover:bg-accent/30 transition-colors h-8"
            >
              <td className="sticky left-0 bg-background z-10 px-3 py-1.5 font-medium text-xs">
                <div className="truncate max-w-[160px]" title={asset.name}>
                  {asset.name}
                </div>
              </td>
              {fields.map(field => {
                const value = getCellValue(asset, field.path)
                const originalValue = getNestedValue(asset, field.path)
                const change = getChangeForCell(asset.id, field.path)
                
                return (
                  <td key={field.id} className="px-3 py-1">
                    <EditableCell
                      field={field}
                      value={value}
                      originalValue={originalValue}
                      hasChange={!!change}
                      error={change?.error}
                      onChange={(newValue) => onCellChange(asset.id, field.path, newValue, originalValue)}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function BulkEditPage() {
  return (
    <Suspense fallback={
      <PageContainer className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </PageContainer>
    }>
      <BulkEditPageContent />
    </Suspense>
  )
}
