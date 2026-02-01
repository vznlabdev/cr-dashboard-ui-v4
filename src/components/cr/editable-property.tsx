"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Check, X, Pencil } from "lucide-react"

interface EditablePropertyProps {
  label: string
  value: string | string[]
  type?: "text" | "textarea" | "select" | "date" | "multi-select"
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  onSave?: (value: string | string[]) => void
  editable?: boolean
  className?: string
  renderValue?: (value: string | string[]) => React.ReactNode
}

export function EditableProperty({
  label,
  value,
  type = "text",
  options = [],
  placeholder,
  onSave,
  editable = true,
  className,
  renderValue,
}: EditablePropertyProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    if (onSave) {
      onSave(editValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const displayValue = renderValue ? renderValue(value) : value

  return (
    <div className={cn("flex items-start gap-3 py-2.5 border-b border-border last:border-0", className)}>
      {/* Label */}
      <div className="w-32 flex-shrink-0 pt-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      </div>

      {/* Value / Edit Input */}
      <div className="flex-1 min-w-0">
        {!isEditing ? (
          <div
            className={cn(
              "group flex items-center gap-2 py-2 min-h-[2rem]",
              editable && "cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
            )}
            onClick={() => editable && setIsEditing(true)}
          >
            <div className="flex-1 min-w-0">
              {displayValue || (
                <span className="text-sm text-muted-foreground">{placeholder || "Click to edit..."}</span>
              )}
            </div>
            {editable && (
              <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {type === "text" && (
              <Input
                value={editValue as string}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                autoFocus
              />
            )}

            {type === "textarea" && (
              <Textarea
                value={editValue as string}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                rows={3}
                autoFocus
              />
            )}

            {type === "select" && (
              <Select
                value={editValue as string}
                onValueChange={(val) => setEditValue(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {type === "date" && (
              <Input
                type="date"
                value={editValue as string}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
              />
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
