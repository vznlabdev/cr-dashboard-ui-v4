export type EditableFieldType = 
  | "text"                  // Single line text
  | "text-with-suggestions" // Text with dropdown suggestions
  | "textarea"              // Multi-line text
  | "select"                // Single select dropdown
  | "searchable-select"     // Searchable dropdown
  | "badge-select"          // Badge with dropdown (like Shopify Status)
  | "badge-multiselect"     // Multiple badges with dropdown
  | "multiselect"           // Multiple select
  | "date"                  // Date picker
  | "boolean"               // Checkbox/switch
  | "number"                // Numeric input
  | "color"                 // Color picker
  | "tags"                  // Tag input
  | "talent"                // Talent/creator picker
  | "readonly"              // Display only

export interface EditableField {
  id: string
  label: string
  type: EditableFieldType
  category: string
  path: string                    // Nested path like "reviewData.accessibility.score"
  editable: boolean
  versionEditable?: boolean       // Can this be edited at version level?
  inheritedFromParent?: boolean   // Is this inherited from parent?
  options?: { value: string; label: string; color?: string }[]  // For select/multiselect, color for badge variants
  badgeColor?: string             // Default color for badge fields (e.g., "purple", "green")
  unit?: string                   // Display unit for number fields (e.g., "MB", "USD")
  searchable?: boolean            // Enable search in dropdowns
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
  isVersion?: boolean           // Flag to indicate version edit
  parentAssetId?: string        // Reference to parent for version edits
}

export interface BulkEditSession {
  id: string
  assetIds: string[]
  changes: BulkEditChange[]
  startedAt: Date
  savedAt?: Date
}
