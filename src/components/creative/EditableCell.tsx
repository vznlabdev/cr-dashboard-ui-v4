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
import { ScrollArea } from "@/components/ui/scroll-area"
import { TagInput } from "@/components/ui/tag-input"
import { TalentPicker } from "./TalentPicker"
import { CalendarIcon, AlertCircle, ChevronDown } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
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
      
      case "badge-select": {
        const statusConfig = field.options?.find(o => o.value === localValue)
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 hover:bg-accent/50 px-2 py-1 rounded">
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
                  onClick={() => { setLocalValue(opt.value); onChange(opt.value) }}
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
              <button className="flex items-center gap-1 flex-wrap hover:bg-accent/50 px-2 py-1 rounded min-h-[28px]">
                {selectedBadges.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Select...</span>
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
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
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
                        onChange(newValue)
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
              <button className="flex items-center gap-1.5 text-sm hover:bg-accent/50 px-2 py-1 rounded w-full justify-between">
                <span className="truncate">{selectedOption?.label || localValue || "Select..."}</span>
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
                      onClick={() => { 
                        setLocalValue(opt.value)
                        onChange(opt.value)
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
            className="w-full text-left hover:bg-accent/50 px-2 py-1 rounded text-sm text-foreground"
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
      return <span className="text-foreground">{value ? "Yes" : "No"}</span>
    case "date":
      return <span className="text-foreground">{format(new Date(value), "PP")}</span>
    case "tags":
    case "multiselect":
      return <span className="text-foreground">{Array.isArray(value) ? value.join(", ") : "-"}</span>
    case "select":
    case "searchable-select":
      const option = field.options?.find(o => o.value === value)
      return <span className="text-foreground">{option?.label || value}</span>
    case "badge-select": {
      const statusConfig = field.options?.find(o => o.value === value)
      return (
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
          {statusConfig?.label || value}
        </Badge>
      )
    }
    case "badge-multiselect": {
      const selectedBadges = Array.isArray(value) ? value : []
      const badgeColor = field.badgeColor || "purple"
      if (selectedBadges.length === 0) return <span className="text-muted-foreground">-</span>
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedBadges.map((val: string) => {
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
          })}
        </div>
      )
    }
    case "talent":
      return <span className="text-foreground">{Array.isArray(value) ? `${value.length} selected` : "-"}</span>
    case "number":
      return <span className="text-foreground">{field.unit ? `${value} ${field.unit}` : String(value)}</span>
    default:
      return <span className="text-foreground">{String(value)}</span>
  }
}
