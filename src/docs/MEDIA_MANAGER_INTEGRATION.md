# Media Manager Integration with Task Modal

## Overview

The Media Manager modal is fully integrated with the task creation modal, providing comprehensive media management capabilities with validation, summary display, and proper data handling.

## Integration Components

### 1. State Management

#### Task Modal State
```typescript
const [showMediaManager, setShowMediaManager] = useState(false)
const [mediaSummaryExpanded, setMediaSummaryExpanded] = useState(false)

// In taskFormData
mediaData: null as MediaManagerData | null
```

#### Media Data Flow
1. User clicks attachment button (📎)
2. Media Manager modal opens
3. User adds/edits media across all tabs
4. User clicks "Save & Close"
5. Media data updates `taskFormData.mediaData`
6. Badge shows item count on attachment button
7. Media summary section becomes visible

### 2. Attachment Button

**Location:** Task modal footer (left side)

**Features:**
- Paperclip icon
- Badge showing total item count when media exists
- Badge is blue with white text
- Opens Media Manager on click

**Code:**
```tsx
<button
  type="button"
  onClick={() => setShowMediaManager(true)}
  className="relative p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
  title="Media Manager"
>
  <Paperclip className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
  {taskFormData.mediaData && hasMediaContent(taskFormData.mediaData) && (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-blue-600 rounded-full">
      {countMediaItems(taskFormData.mediaData)}
    </span>
  )}
</button>
```

### 3. Media Summary Section

**Location:** Between "More" expanded content and Footer

**Visibility:** Only shows when `taskFormData.mediaData` has content

**Features:**
- Collapsible section with expand/collapse
- Shows summary: "3 Assets, 1 Prompt, 2 References, 1 Creator"
- Badge showing total item count
- Detailed breakdown when expanded:
  - Individual counts for each tab
  - Warning indicators (authorization expires soon, pending clearance)
  - "Edit Media" button to reopen Media Manager
- Gray background to distinguish from main content
- Blue accent color for counts and button

**Code Structure:**
```tsx
{taskFormData.mediaData && hasMediaData(taskFormData.mediaData) && (
  <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
    {/* Header with collapse toggle */}
    <button onClick={() => setMediaSummaryExpanded(!mediaSummaryExpanded)}>
      <Paperclip icon />
      <h4>Media Attached</h4>
      <p>{getMediaSummary(taskFormData.mediaData)}</p>
      <span>{getMediaCount(taskFormData.mediaData)} items</span>
      <ChevronUp/Down />
    </button>

    {/* Expanded Content */}
    {mediaSummaryExpanded && (
      <div>
        {/* Detailed breakdown */}
        {/* Warnings */}
        {/* Edit button */}
      </div>
    )}
  </div>
)}
```

### 4. Validation Before Submission

**Validation Flow:**
1. User clicks "Create Task" button
2. Standard validation runs (title, project, intended uses)
3. **Media validation runs** if `taskFormData.mediaData` exists
4. Validation checks:
   - Assets requirements based on creation method
   - Prompts requirements based on creation method
   - Training data requirements based on creation method
   - Creator DNA assignments and authorizations
   - Intended use vs authorization status

**Error Handling:**
- If **errors** exist:
  - Prevents task submission
  - Shows error toast: "Please fix media errors before creating task"
  - Logs errors to console
  - Expands media summary section to show issues
  - User must fix errors in Media Manager

- If **warnings** exist:
  - Shows confirmation dialog with all warnings
  - User can choose to continue or cancel
  - Example warnings:
    - "1 creator authorization expires soon"
    - "2 assets pending clearance review"

**Code:**
```typescript
// Validate media data if present
if (taskFormData.mediaData) {
  const creationMethod = 
    taskFormData.mode === 'manual' ? 'human-made' :
    taskFormData.mode === 'generative' ? 'ai-generated' :
    'ai-enhanced'
  
  const validation = validateAllTabs(
    taskFormData.mediaData,
    creationMethod,
    taskFormData.intendedUses
  )

  // Check for errors
  if (!validation.isValid) {
    setTaskFormError('Media validation failed')
    toast.error('Please fix media errors before creating task')
    console.error('Media validation errors:', validation.allErrors)
    setMediaSummaryExpanded(true)
    return
  }

  // Check for warnings
  if (validation.allWarnings.length > 0) {
    const proceed = confirm(
      `Media validation warnings:\n\n${validation.allWarnings.join('\n')}\n\nDo you want to continue anyway?`
    )
    if (!proceed) return
  }
}
```

### 5. Task Payload Structure

**Media Payload Format:**
```typescript
const mediaPayload = {
  assets: taskFormData.mediaData.assets.map(a => a.id),
  prompts: {
    text: taskFormData.mediaData.prompts.text,
    saveToLibrary: taskFormData.mediaData.prompts.saveToLibrary,
    title: taskFormData.mediaData.prompts.title,
    tags: taskFormData.mediaData.prompts.tags,
    isPrivate: taskFormData.mediaData.prompts.isPrivate
  },
  training: taskFormData.mediaData.training.map(t => t.id),
  references: taskFormData.mediaData.references.map(ref => ({
    id: ref.id,
    type: ref.type,
    filename: ref.filename,
    url: ref.url,
    notes: ref.notes,
    order: ref.order
  })),
  creatorDNA: taskFormData.mediaData.creatorDNA.map(creator => ({
    id: creator.id,
    name: creator.name,
    nilpId: creator.nilpId,
    role: creator.role,
    nilpComponents: creator.nilpComponents
  }))
}
```

**Backend Integration (Future):**
```typescript
// In production, send to backend
await createTask({ 
  task: newTask, 
  media: mediaPayload 
})
```

**Currently:**
- Media payload is logged to console
- Comment indicates where backend call would go
- Ready for backend integration

### 6. Reset on New Task

**Automatic Cleanup:**

When modal closes:
```typescript
const closeTaskModal = () => {
  clearMediaDataFromStorage('new')
  setTaskFormData({ ...emptyFormData, mediaData: null })
  setMediaSummaryExpanded(false)
  setShowMediaManager(false)
}
```

When "Create more" is used:
```typescript
if (createMore) {
  setTaskFormData({
    ...preservedFields,
    title: '',
    description: '',
    mediaData: null, // Reset for next task
  })
}
```

## Helper Functions

### `getMediaCount(mediaData)`
**Purpose:** Count total media items across all tabs

**Returns:** Number

**Usage:** Badge on attachment button, summary header

### `getMediaSummary(mediaData)`
**Purpose:** Generate human-readable summary

**Returns:** String like "3 Assets, 1 Prompt, 2 References, 1 Creator"

**Usage:** Media summary section header

### `getMediaWarnings(mediaData)`
**Purpose:** Extract all warnings from media data

**Returns:** Array of warning strings

**Checks:**
- Expiring creator authorizations
- Pending creator authorizations
- Pending asset clearances

**Usage:** Media summary expanded section

### `hasMediaData(mediaData)`
**Purpose:** Check if any media exists

**Returns:** Boolean

**Usage:** Conditional rendering of media summary section

## Validation Rules Reference

### By Creation Method

#### Human-Made
- **Assets**: Required
- **Prompts**: Optional
- **Training**: Not typically used
- **References**: Optional
- **Creator DNA**: Required

#### AI-Generated
- **Assets**: Not typically used
- **Prompts**: Required
- **Training**: Required
- **References**: Optional
- **Creator DNA**: Required

#### AI-Enhanced
- **Assets**: Required
- **Prompts**: Required
- **Training**: Not typically used
- **References**: Optional
- **Creator DNA**: Required

### Creator DNA Validation

**Always Required:** At least one creator must be assigned

**Authorization Rules:**
- **Expired**: Error (blocks submission)
- **Pending** + Advertising use: Error (blocks submission)
- **Pending** + Other use: Warning (allows submission with confirmation)
- **Expires Soon**: Warning (allows submission with confirmation)

**NILP Components:** At least one component must be selected per creator

## User Experience Flow

### Happy Path
1. User opens task creation modal
2. User fills in basic task info
3. User clicks attachment button (📎)
4. Media Manager opens
5. User adds assets, prompts, creators, etc.
6. User clicks "Save & Close"
7. Media summary appears in task modal showing "5 items"
8. User can expand to see details
9. User clicks "Create Task"
10. Validation passes
11. Task created with media attached
12. Success toast appears
13. Modal closes, localStorage cleared

### Error Path
1. User opens task creation modal
2. User clicks attachment button
3. User adds creators with expired authorizations
4. User clicks "Save & Close"
5. Media summary shows warnings
6. User clicks "Create Task"
7. **Validation fails**
8. Error toast: "Please fix media errors before creating task"
9. Media summary expands automatically
10. User sees red warning icons
11. User clicks "Edit Media"
12. User fixes issues in Media Manager
13. User tries again
14. Validation passes
15. Task created successfully

### Warning Path
1. User creates task with media
2. One creator's authorization expires in 20 days
3. User clicks "Create Task"
4. Validation passes with warnings
5. **Confirmation dialog appears:**
   - "Media validation warnings:"
   - "1 creator authorization expires soon"
   - "Do you want to continue anyway?"
6. User clicks "Yes"
7. Task created with warning noted
8. Console logs warning for tracking

## Integration Checklist

- [x] State management in task modal
- [x] Attachment button with badge
- [x] Media Manager rendering and props
- [x] Media summary section (collapsible)
- [x] Detailed breakdown when expanded
- [x] Warning indicators in summary
- [x] Edit button in summary
- [x] Validation before submission
- [x] Error handling (blocks submission)
- [x] Warning handling (confirmation dialog)
- [x] Media payload structure
- [x] Backend integration preparation
- [x] Reset on modal close
- [x] Reset on "Create more"
- [x] localStorage cleanup
- [x] Helper functions
- [x] Type definitions
- [x] Dark mode support
- [x] Accessibility (keyboard navigation, ARIA)

## Known Limitations

1. **File Uploads:** Currently mocked, need backend integration
2. **Asset Library:** Uses mock data, need API integration
3. **Persona Library:** Uses mock data, need API integration
4. **Clearance Checks:** Simulated, need real API
5. **Authorization Verification:** Simulated, need real API
6. **Prompt Library:** Uses mock data, need database
7. **Training Datasets:** Uses mock data, need asset system integration

## Future Enhancements

1. **Inline Preview:** Show asset thumbnails in summary
2. **Quick Edit:** Edit individual fields without opening full modal
3. **Templates:** Save media configurations as templates
4. **Bulk Operations:** Add multiple assets at once
5. **Drag & Drop:** Drag files directly onto attachment button
6. **Keyboard Shortcuts:** Quick access (e.g., Cmd+M for Media Manager)
7. **Validation Hints:** Real-time validation as user works
8. **Auto-save:** Save draft media to localStorage continuously
9. **Conflict Resolution:** Handle concurrent edits
10. **Media History:** Track changes over time

## Testing Checklist

### Manual Testing
- [ ] Open Media Manager from attachment button
- [ ] Add assets, see count update in badge
- [ ] Close Media Manager, verify summary appears
- [ ] Expand/collapse summary section
- [ ] View detailed breakdown
- [ ] See warning indicators
- [ ] Click "Edit Media" button
- [ ] Create task with valid media
- [ ] Create task with errors (blocked)
- [ ] Create task with warnings (confirmation)
- [ ] Use "Create more" (media resets)
- [ ] Close modal (localStorage cleared)
- [ ] Reopen modal (no stale data)

### Validation Testing
- [ ] Human-Made without assets (error)
- [ ] AI-Generated without prompts (error)
- [ ] AI-Generated without training (error)
- [ ] Any method without Creator DNA (error)
- [ ] Expired authorization (error)
- [ ] Pending authorization + Advertising (error)
- [ ] Pending authorization + Other use (warning)
- [ ] Expiring authorization (warning)
- [ ] Uncleared assets (error)
- [ ] Creator without NILP components (error)

## Support

For questions or issues with Media Manager integration:
1. Check this documentation
2. Review `MEDIA_MANAGER_STATE.md` for state management details
3. Check console logs for validation errors
4. Verify localStorage is not full (quota exceeded)
5. Test in incognito mode (clean state)
