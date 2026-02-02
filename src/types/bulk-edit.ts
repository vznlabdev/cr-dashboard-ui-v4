export type EditableFieldType = 
  | "text"           // Single line text
  | "textarea"       // Multi-line text
  | "select"         // Single select dropdown
  | "multiselect"    // Multiple select
  | "date"           // Date picker
  | "boolean"        // Checkbox/switch
  | "number"         // Numeric input
  | "color"          // Color picker
  | "tags"           // Tag input
  | "talent"         // Talent/creator picker
  | "readonly"       // Display only

export interface EditableField {
  id: string
  label: string
  type: EditableFieldType
  category: string
  path: string                    // Nested path like "reviewData.accessibility.score"
  editable: boolean
  options?: { value: string; label: string }[]  // For select/multiselect
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: any) => string | null  // Returns error message or null
  }
  helpText?: string
  placeholder?: string
}

export interface BulkEditChange {
  assetId: string
  fieldPath: string
  oldValue: any
  newValue: any
  error?: string
}

export interface BulkEditSession {
  id: string
  assetIds: string[]
  changes: BulkEditChange[]
  startedAt: Date
  savedAt?: Date
}
