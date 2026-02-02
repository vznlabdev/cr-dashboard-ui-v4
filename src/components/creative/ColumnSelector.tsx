"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BULK_EDIT_CATEGORIES, EDITABLE_FIELDS, getEditableFields } from "@/config/bulk-edit-fields"

interface ColumnSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedColumns: string[]
  onColumnsChange: (columns: string[]) => void
}

export function ColumnSelector({ open, onOpenChange, selectedColumns, onColumnsChange }: ColumnSelectorProps) {
  const [tempSelected, setTempSelected] = useState(selectedColumns)
  
  const handleToggle = (fieldId: string) => {
    setTempSelected(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }
  
  const handleApply = () => {
    onColumnsChange(tempSelected)
    onOpenChange(false)
  }
  
  const handleReset = () => {
    setTempSelected(selectedColumns)
  }
  
  const editableFields = getEditableFields()
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Columns</DialogTitle>
          <DialogDescription>
            Choose which metadata fields to display in the bulk editor ({tempSelected.length} selected)
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(BULK_EDIT_CATEGORIES).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 gap-2 p-4">
                {editableFields.map(field => (
                  <label key={field.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded">
                    <Checkbox
                      checked={tempSelected.includes(field.id)}
                      onCheckedChange={() => handleToggle(field.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{field.label}</span>
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground truncate">{field.helpText}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {Object.keys(BULK_EDIT_CATEGORIES).map(category => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {editableFields.filter(f => f.category === category).map(field => (
                    <label key={field.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded">
                      <Checkbox
                        checked={tempSelected.includes(field.id)}
                        onCheckedChange={() => handleToggle(field.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm">{field.label}</span>
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground truncate">{field.helpText}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
