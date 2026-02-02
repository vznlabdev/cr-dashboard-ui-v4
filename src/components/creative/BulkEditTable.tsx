"use client"

import { useMemo } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EditableCell } from "./EditableCell"
import { EDITABLE_FIELDS } from "@/config/bulk-edit-fields"
import type { Asset, AssetVersion } from "@/types/creative"
import type { BulkEditChange } from "@/types/bulk-edit"

interface BulkEditTableProps {
  assets: (Asset | AssetVersion)[]
  columns: string[]
  changes: BulkEditChange[]
  onCellChange: (assetId: string, fieldPath: string, newValue: any, oldValue: any) => void
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj)
}

export function BulkEditTable({ assets, columns, changes, onCellChange }: BulkEditTableProps) {
  const fields = useMemo(() => {
    return columns.map(colId => EDITABLE_FIELDS.find(f => f.id === colId)).filter(Boolean) as typeof EDITABLE_FIELDS
  }, [columns])
  
  const getChangeForCell = (assetId: string, fieldPath: string) => {
    return changes.find(c => c.assetId === assetId && c.fieldPath === fieldPath)
  }
  
  const getCellValue = (asset: Asset | AssetVersion, fieldPath: string) => {
    const change = getChangeForCell(asset.id, fieldPath)
    return change ? change.newValue : getNestedValue(asset, fieldPath)
  }
  
  return (
    <ScrollArea className="h-full">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[200px] sticky left-0 bg-background border-r">
              Asset Name
            </TableHead>
            {fields.map(field => (
              <TableHead key={field.id} className="min-w-[150px]">
                <div className="flex flex-col gap-1">
                  <span>{field.label}</span>
                  {field.helpText && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {field.helpText}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map(asset => (
            <TableRow key={asset.id}>
              <TableCell className="sticky left-0 bg-background font-medium border-r">
                <div className="truncate max-w-[180px]" title={asset.name}>
                  {asset.name}
                </div>
              </TableCell>
              {fields.map(field => {
                const value = getCellValue(asset, field.path)
                const originalValue = getNestedValue(asset, field.path)
                const change = getChangeForCell(asset.id, field.path)
                
                return (
                  <TableCell key={field.id}>
                    <EditableCell
                      field={field}
                      value={value}
                      originalValue={originalValue}
                      hasChange={!!change}
                      error={change?.error}
                      onChange={(newValue) => onCellChange(asset.id, field.path, newValue, originalValue)}
                    />
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
