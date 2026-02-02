"use client"

import { useState, useMemo, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X, Save, RotateCcw, Columns, AlertTriangle } from "lucide-react"
import { BulkEditTable } from "./BulkEditTable"
import { ColumnSelector } from "./ColumnSelector"
import { BULK_EDIT_CATEGORIES, getFieldsByCategory } from "@/config/bulk-edit-fields"
import type { Asset, AssetVersion } from "@/types/creative"
import type { BulkEditChange } from "@/types/bulk-edit"
import { toast } from "sonner"

interface BulkEditorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assets: (Asset | AssetVersion)[]
  onSave: (changes: BulkEditChange[]) => Promise<void>
}

export function BulkEditorSheet({ open, onOpenChange, assets, onSave }: BulkEditorSheetProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name", "brandId", "designType", "tags", "approvalStatus"
  ])
  const [changes, setChanges] = useState<BulkEditChange[]>([])
  const [saving, setSaving] = useState(false)
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
  
  const fieldsByCategory = useMemo(() => getFieldsByCategory(), [])
  
  const hasChanges = changes.length > 0
  const errorCount = changes.filter(c => c.error).length
  
  const handleCellChange = useCallback((assetId: string, fieldPath: string, newValue: any, oldValue: any) => {
    setChanges(prev => {
      // Remove existing change for this asset/field
      const filtered = prev.filter(c => !(c.assetId === assetId && c.fieldPath === fieldPath))
      
      // Add new change if value actually changed
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        return [...filtered, { assetId, fieldPath, oldValue, newValue }]
      }
      
      return filtered
    })
  }, [])
  
  const handleReset = () => {
    setChanges([])
    toast.info("Changes reset")
  }
  
  const handleSave = async () => {
    if (errorCount > 0) {
      toast.error(`Cannot save: ${errorCount} validation errors`)
      return
    }
    
    setSaving(true)
    try {
      await onSave(changes)
      setChanges([])
      toast.success(`Successfully updated ${assets.length} assets`)
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }
  
  // Reset changes when sheet closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && hasChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to close?")
      if (!confirmed) return
    }
    if (!isOpen) {
      setChanges([])
    }
    onOpenChange(isOpen)
  }
  
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Bulk Edit Metadata</SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  <span>Editing {assets.length} assets</span>
                  {hasChanges && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        {changes.length} changes
                      </Badge>
                    </>
                  )}
                  {errorCount > 0 && (
                    <>
                      <span>•</span>
                      <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errorCount} errors
                      </Badge>
                    </>
                  )}
                </SheetDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setColumnSelectorOpen(true)}
                >
                  <Columns className="mr-2 h-4 w-4" />
                  Columns
                </Button>
                {hasChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleReset}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleSave}
                  disabled={!hasChanges || saving || errorCount > 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>
          
          {/* Category Tabs */}
          <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
            <TabsList className="px-6 pt-2 justify-start border-b rounded-none bg-transparent h-auto">
              <TabsTrigger value="all" className="data-[state=active]:border-b-2">All Fields</TabsTrigger>
              {Object.entries(BULK_EDIT_CATEGORIES).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:border-b-2">{label}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="flex-1 m-0 min-h-0">
              <BulkEditTable
                assets={assets}
                columns={selectedColumns}
                changes={changes}
                onCellChange={handleCellChange}
              />
            </TabsContent>
            
            {Object.entries(BULK_EDIT_CATEGORIES).map(([key]) => (
              <TabsContent key={key} value={key} className="flex-1 m-0 min-h-0">
                <BulkEditTable
                  assets={assets}
                  columns={fieldsByCategory[key]?.map(f => f.id) || []}
                  changes={changes}
                  onCellChange={handleCellChange}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        {/* Column Selector Dialog */}
        <ColumnSelector
          open={columnSelectorOpen}
          onOpenChange={setColumnSelectorOpen}
          selectedColumns={selectedColumns}
          onColumnsChange={setSelectedColumns}
        />
      </SheetContent>
    </Sheet>
  )
}
