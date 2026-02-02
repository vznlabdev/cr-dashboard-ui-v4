"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { TagInput } from "@/components/ui/tag-input"
import { TalentPicker } from "./TalentPicker"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EditableField } from "@/types/bulk-edit"
import { format } from "date-fns"

interface EditableCellProps {
  field: EditableField
  value: any
  originalValue: any
  hasChange: boolean
  error?: string
  onChange: (value: any) => void
}

export function EditableCell({ field, value, originalValue, hasChange, error, onChange }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    setLocalValue(value)
  }, [value])
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])
  
  const handleSave = () => {
    onChange(localValue)
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setLocalValue(value)
    setIsEditing(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && field.type !== 'textarea') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  // Readonly fields
  if (!field.editable) {
    return (
      <div className="text-sm text-muted-foreground">
        {formatValue(value, field)}
      </div>
    )
  }
  
  // Different editors based on field type
  const renderEditor = () => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <Input
            ref={inputRef}
            type={field.type === "number" ? "number" : "text"}
            value={localValue || ""}
            onChange={(e) => setLocalValue(field.type === "number" ? Number(e.target.value) : e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-8"
            placeholder={field.placeholder}
          />
        )
      
      case "textarea":
        return (
          <Textarea
            value={localValue || ""}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            rows={3}
            placeholder={field.placeholder}
          />
        )
      
      case "select":
        return (
          <Select value={localValue} onValueChange={(val) => { setLocalValue(val); onChange(val) }}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case "boolean":
        return (
          <Checkbox
            checked={localValue}
            onCheckedChange={(checked) => { setLocalValue(checked); onChange(checked) }}
          />
        )
      
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localValue ? format(new Date(localValue), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localValue ? new Date(localValue) : undefined}
                onSelect={(date) => { setLocalValue(date); onChange(date) }}
              />
            </PopoverContent>
          </Popover>
        )
      
      case "tags":
        return (
          <TagInput
            value={localValue || []}
            onChange={(tags) => { setLocalValue(tags); onChange(tags) }}
            placeholder={field.placeholder}
          />
        )
      
      case "talent":
        return (
          <TalentPicker
            value={localValue || []}
            onChange={(talents) => { setLocalValue(talents); onChange(talents) }}
          />
        )
      
      default:
        return <span className="text-xs text-muted-foreground">Unsupported type</span>
    }
  }
  
  return (
    <div className="relative">
      <div className={cn(
        "min-h-[32px] flex items-center",
        hasChange && "bg-amber-50 dark:bg-amber-950/20",
        error && "bg-red-50 dark:bg-red-950/20"
      )}>
        {isEditing ? (
          renderEditor()
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left hover:bg-accent/50 px-2 py-1 rounded text-sm"
          >
            {formatValue(localValue, field)}
          </button>
        )}
      </div>
      
      {hasChange && (
        <div className="absolute -top-1 -right-1">
          <Badge variant="secondary" className="h-3 w-3 p-0 rounded-full" />
        </div>
      )}
      
      {error && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}

function formatValue(value: any, field: EditableField): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>
  }
  
  switch (field.type) {
    case "boolean":
      return value ? "Yes" : "No"
    case "date":
      return format(new Date(value), "PP")
    case "tags":
    case "multiselect":
      return Array.isArray(value) ? value.join(", ") : "-"
    case "select":
      const option = field.options?.find(o => o.value === value)
      return option?.label || value
    case "talent":
      return Array.isArray(value) ? `${value.length} selected` : "-"
    default:
      return String(value)
  }
}
