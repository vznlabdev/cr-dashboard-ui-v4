"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { TagInput } from "@/components/ui/tag-input"
import { TalentPicker } from "./TalentPicker"
import { CalendarIcon, ChevronDown, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EditableField } from "@/types/bulk-edit"
import { format } from "date-fns"

interface InlineEditFieldProps {
  field: EditableField
  value: any
  onSave: (newValue: any) => Promise<void>
  className?: string
  label?: string
  showLabel?: boolean
}

export function InlineEditField({ 
  field, 
  value, 
  onSave, 
  className,
  label,
  showLabel = true
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    setLocalValue(value)
  }, [value])
  
  const handleSave = async () => {
    if (localValue === value) {
      setIsEditing(false)
      return
    }
    
    setSaving(true)
    try {
      await onSave(localValue)
      setIsEditing(false)
    } catch (error) {
      setLocalValue(value) // Revert on error
    } finally {
      setSaving(false)
    }
  }
  
  const handleAsyncSave = async (newValue: any) => {
    if (newValue === value) return
    
    setSaving(true)
    try {
      await onSave(newValue)
    } catch (error) {
      setLocalValue(value) // Revert on error
    } finally {
      setSaving(false)
    }
  }
  
  const handleCancel = () => {
    setLocalValue(value)
    setIsEditing(false)
  }
  
  const renderField = () => {
    if (!field.editable) {
      return (
        <div className="text-sm">{formatValue(localValue, field)}</div>
      )
    }
    
    // For badge and dropdown types, always show the interactive version
    if (field.type === "badge-select" || field.type === "badge-multiselect" || field.type === "searchable-select") {
      return renderInteractiveField()
    }
    
    // For other types, show view/edit mode
    if (isEditing) {
      return renderEditor()
    }
    
    return (
      <button
        onClick={() => setIsEditing(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full text-left hover:bg-accent/20 px-2 py-1.5 rounded border border-transparent hover:border-border text-sm transition-all duration-150 group"
      >
        <div className="flex items-center justify-between">
          <span>{formatValue(localValue, field) || <span className="text-muted-foreground">Add {field.label.toLowerCase()}...</span>}</span>
          {isHovered && <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </button>
    )
  }
  
  const renderEditor = () => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <Input
            autoFocus
            type={field.type === "number" ? "number" : "text"}
            value={localValue || ""}
            onChange={(e) => setLocalValue(field.type === "number" ? Number(e.target.value) : e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSave()
              } else if (e.key === 'Escape') {
                handleCancel()
              }
            }}
            className="h-9 text-sm"
            placeholder={field.placeholder}
            disabled={saving}
          />
        )
      
      case "textarea":
        return (
          <Textarea
            autoFocus
            value={localValue || ""}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            rows={4}
            placeholder={field.placeholder}
            disabled={saving}
            className="text-sm"
          />
        )
      
      case "tags":
        return (
          <TagInput
            value={localValue || []}
            onChange={async (tags) => {
              setLocalValue(tags)
              await handleAsyncSave(tags)
            }}
            placeholder={field.placeholder}
          />
        )
      
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-accent/50 text-sm w-full justify-start">
                <CalendarIcon className="h-4 w-4" />
                {localValue ? format(new Date(localValue), "PPP") : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localValue ? new Date(localValue) : undefined}
                onSelect={async (date) => {
                  setLocalValue(date)
                  await handleAsyncSave(date)
                }}
              />
            </PopoverContent>
          </Popover>
        )
      
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={localValue}
              onCheckedChange={async (checked) => {
                setLocalValue(checked)
                await handleAsyncSave(checked)
              }}
            />
            <span className="text-sm">{field.label}</span>
          </div>
        )
      
      case "talent":
        return (
          <TalentPicker
            value={localValue || []}
            onChange={async (talents) => {
              setLocalValue(talents)
              await handleAsyncSave(talents)
            }}
          />
        )
      
      default:
        return <span className="text-xs text-muted-foreground">Unsupported type</span>
    }
  }
  
  const renderInteractiveField = () => {
    switch (field.type) {
      case "badge-select": {
        const statusConfig = field.options?.find(o => o.value === localValue)
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 hover:bg-accent/50 px-3 py-2 rounded-md w-full justify-between">
                <Badge 
                  className={cn(
                    "font-semibold text-xs rounded-md px-2 py-0.5",
                    statusConfig?.color === "green" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    statusConfig?.color === "yellow" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    statusConfig?.color === "purple" && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                    statusConfig?.color === "red" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    statusConfig?.color === "gray" && "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400"
                  )}
                >
                  {statusConfig?.label || localValue || "Select"}
                </Badge>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-1" align="start">
              {field.options?.map(opt => (
                <button
                  key={opt.value}
                  onClick={async () => {
                    setLocalValue(opt.value)
                    await handleAsyncSave(opt.value)
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-accent rounded text-sm flex items-center gap-2"
                >
                  <Badge 
                    className={cn(
                      "font-semibold text-xs rounded-md px-2 py-0.5",
                      opt.color === "green" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                      opt.color === "yellow" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                      opt.color === "purple" && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                      opt.color === "red" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      opt.color === "gray" && "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400"
                    )}
                  >
                    {opt.label}
                  </Badge>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )
      }
      
      case "badge-multiselect": {
        const selectedBadges = Array.isArray(localValue) ? localValue : []
        const badgeColor = field.badgeColor || "purple"
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 flex-wrap hover:bg-accent/50 px-3 py-2 rounded-md min-h-[36px] w-full">
                {selectedBadges.length === 0 ? (
                  <span className="text-sm text-muted-foreground">Select {field.label.toLowerCase()}...</span>
                ) : (
                  selectedBadges.map(val => {
                    const opt = field.options?.find(o => o.value === val)
                    return (
                      <Badge 
                        key={val} 
                        className={cn(
                          "font-semibold text-xs rounded-md px-2 py-0.5",
                          badgeColor === "purple" && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                          badgeColor === "blue" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                          badgeColor === "green" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        )}
                      >
                        {opt?.label || val}
                      </Badge>
                    )
                  })
                )}
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-2" align="start">
              <div className="space-y-1 max-h-[300px] overflow-auto">
                {field.options?.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 p-1.5 hover:bg-accent rounded cursor-pointer">
                    <Checkbox
                      checked={selectedBadges.includes(opt.value)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...selectedBadges, opt.value]
                          : selectedBadges.filter((v: string) => v !== opt.value)
                        setLocalValue(newValue)
                        // Save in background so UI stays smooth (no saving state / no re-render flicker)
                        const same = Array.isArray(value) && Array.isArray(newValue) && value.length === newValue.length && newValue.every((v: string, i: number) => v === value[i])
                        if (same) return
                        onSave(newValue).catch(() => setLocalValue(value))
                      }}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )
      }
      
      case "searchable-select": {
        const filteredOptions = field.options?.filter(opt =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
        const selectedOption = field.options?.find(o => o.value === localValue)
        
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm hover:bg-accent/50 px-3 py-2 rounded-md w-full justify-between">
                <span className="truncate">{selectedOption?.label || localValue || `Select ${field.label.toLowerCase()}...`}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-2" align="start">
              <Input 
                placeholder="Search..." 
                className="h-8 mb-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <ScrollArea className="h-[200px]">
                <div className="space-y-0.5">
                  {filteredOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={async () => { 
                        setLocalValue(opt.value)
                        await handleAsyncSave(opt.value)
                        setSearchQuery("")
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-accent rounded text-sm"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )
      }
      
      default:
        return null
    }
  }
  
  // Don't block or shift layout for multiselect so checkboxes stay smooth and clickable
  const isMultiselect = field.type === "badge-multiselect"
  const showSavingState = saving && !isMultiselect
  const blockInteraction = saving && !isMultiselect

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          {label || field.label}
          {showSavingState && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
        </label>
      )}
      <div className={cn(blockInteraction && "opacity-60 pointer-events-none")}>
        {renderField()}
      </div>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}

function formatValue(value: any, field: EditableField): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return null
  }
  
  switch (field.type) {
    case "boolean":
      return value ? "Yes" : "No"
    case "date":
      return format(new Date(value), "PP")
    case "tags":
      return Array.isArray(value) ? value.join(", ") : ""
    case "badge-select": {
      const statusConfig = field.options?.find(o => o.value === value)
      return statusConfig?.label || value
    }
    case "badge-multiselect": {
      const selectedBadges = Array.isArray(value) ? value : []
      return selectedBadges.map((val: string) => {
        const opt = field.options?.find(o => o.value === val)
        return opt?.label || val
      }).join(", ")
    }
    case "searchable-select":
      const option = field.options?.find(o => o.value === value)
      return option?.label || value
    case "talent":
      return Array.isArray(value) ? `${value.length} selected` : ""
    case "number":
      return field.unit ? `${value} ${field.unit}` : String(value)
    default:
      return String(value)
  }
}
