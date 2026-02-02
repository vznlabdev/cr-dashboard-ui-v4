import type { EditableField } from "@/types/bulk-edit"
import type { BulkEditChange } from "@/types/bulk-edit"

export function validateFieldValue(value: any, field: EditableField): string | null {
  if (!field.validation) return null
  
  const { required, min, max, pattern, custom } = field.validation
  
  // Required check
  if (required && (value === null || value === undefined || value === "")) {
    return `${field.label} is required`
  }
  
  // Skip other validations if empty and not required
  if (!value && !required) return null
  
  // Min/max for numbers
  if (field.type === "number") {
    const num = Number(value)
    if (min !== undefined && num < min) {
      return `${field.label} must be at least ${min}`
    }
    if (max !== undefined && num > max) {
      return `${field.label} must be at most ${max}`
    }
  }
  
  // Pattern for text
  if (pattern && typeof value === "string") {
    if (!pattern.test(value)) {
      return `${field.label} format is invalid`
    }
  }
  
  // Custom validation
  if (custom) {
    return custom(value)
  }
  
  return null
}

export function validateAllChanges(changes: BulkEditChange[], fields: EditableField[]): BulkEditChange[] {
  return changes.map(change => {
    const field = fields.find(f => f.path === change.fieldPath)
    if (!field) return change
    
    const error = validateFieldValue(change.newValue, field)
    return { ...change, error: error || undefined }
  })
}
