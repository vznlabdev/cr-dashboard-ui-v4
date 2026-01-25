# Media Manager State Management Documentation

## Overview

The Media Manager uses local state management with localStorage persistence for temporary data storage until backend integration is ready.

## Architecture

### Type Definitions (`types/mediaManager.ts`)

All interfaces for Media Manager data structures:
- `MediaManagerData` - Main data container
- `LinkedAsset` - Assets linked to tasks
- `PromptData` - AI prompt information
- `ReferenceItem` - Reference materials
- `AssignedCreator` - Creator/persona assignments with NILP tracking

### Context Provider (`contexts/MediaManagerContext.tsx`)

Provides centralized state management:
- `mediaData` - Current media data state
- `activeTab` - Currently active tab
- `hasUnsavedChanges` - Tracks unsaved changes
- Update functions for each data type
- Auto-save to localStorage every 30 seconds

### Mock Data (`lib/mockMediaData.ts`)

Development data:
- 30 mock assets (varied clearance statuses)
- 10 mock personas (varied authorization states)
- 15 mock prompts (with ratings and effectiveness)
- 10 mock training datasets (cleared only)

### Validation (`utils/mediaValidation.ts`)

Validation functions:
- `validateAssets()` - Check asset requirements
- `validatePrompts()` - Check prompt requirements
- `validateTraining()` - Check training data requirements
- `validateCreatorDNA()` - Check creator assignments and authorizations
- `validateAllTabs()` - Comprehensive validation
- `hasMediaContent()` - Check if any media exists
- `countMediaItems()` - Count total items

### Tab Requirements (`utils/tabRequirements.ts`)

Determines which tabs are required/optional based on creation method:
- `getTabRequirements()` - Get requirements for all tabs
- `isTabRequired()` - Check if specific tab is required
- `getRequiredTabs()` - List all required tabs
- Tab status labels and styling

## Data Flow

### 1. Opening Media Manager

```typescript
// User clicks attachment button
setShowMediaManager(true)

// MediaManager receives:
- creationMethod: 'human-made' | 'ai-generated' | 'ai-enhanced'
- taskId: string | undefined
- intendedUse: string[]
```

### 2. Working in Media Manager

```typescript
// User adds/modifies data in tabs
- Assets: Link from library or upload new
- Prompts: Write prompts, save to library
- Training: Link training datasets
- References: Add references (library/upload/URL)
- Creator DNA: Assign personas with NILP components

// Auto-saves to localStorage every 30 seconds
localStorage.setItem(`task-media-${taskId || 'new'}`, JSON.stringify(mediaData))
```

### 3. Saving Media Manager

```typescript
// User clicks "Save & Close"
onSave(mediaData)

// Task modal receives data and converts to MediaManagerData format
setTaskFormData(prev => ({ ...prev, mediaData }))

// Badge appears on attachment button showing item count
```

### 4. Creating Task

```typescript
// User clicks "Create Task"
handleCreateTask()

// Media data is included with task
const newTask = { ...taskData, mediaData: taskFormData.mediaData }

// Clear localStorage after successful submission
clearMediaDataFromStorage('new')
```

## Tab Requirements by Creation Method

### Human-Made
- **Assets**: Required ✓
- **Prompts**: Optional (if AI assistance used)
- **Training**: Not typically used
- **References**: Optional
- **Creator DNA**: Required ✓

### AI-Generated
- **Assets**: Not typically used
- **Prompts**: Required ✓
- **Training**: Required ✓
- **References**: Optional
- **Creator DNA**: Required ✓

### AI-Enhanced
- **Assets**: Required ✓ (original assets)
- **Prompts**: Required ✓ (enhancement prompts)
- **Training**: Not typically used
- **References**: Optional
- **Creator DNA**: Required ✓

## Validation Rules

### Assets
- Required for Human-Made and AI-Enhanced
- Cannot include uncleared assets (clearanceStatus !== 'uncleared')

### Prompts
- Required for AI-Generated and AI-Enhanced
- If saving to library: title and tags required
- Warns if prompt is too short (< 20 chars)

### Training Data
- Required for AI-Generated only
- All items must have 'cleared' status

### Creator DNA
- Required for ALL creation methods
- At least one creator must be assigned
- Each creator must have at least one NILP component selected
- Authorization validation:
  - Expired: Error
  - Pending + Advertising use: Error
  - Pending + Other use: Warning
  - Expires soon: Warning

## LocalStorage Schema

### Key Format
```
task-media-${taskId || 'new'}
```

### Data Structure
```json
{
  "assets": [
    {
      "id": "asset-1",
      "filename": "hero-banner.jpg",
      "fileType": "image/jpeg",
      "fileSize": 4200000,
      "thumbnailUrl": "/placeholder.svg",
      "clearanceStatus": "cleared",
      "source": "library",
      "uploadedAt": "2025-01-24T..."
    }
  ],
  "prompts": {
    "text": "Create a professional product photo...",
    "saveToLibrary": true,
    "title": "Product Photography Prompt",
    "tags": ["Product", "Photography"],
    "isPrivate": false
  },
  "training": [...],
  "references": [...],
  "creatorDNA": [...]
}
```

### Lifecycle
- **Created**: When media data is first added
- **Updated**: Auto-save every 30 seconds if unsaved changes exist
- **Cleared**: On task submission or modal close

## UI Integration

### Attachment Button Badge

Shows item count when media exists:
```tsx
<Paperclip />
{mediaData && hasMediaContent(mediaData) && (
  <span className="badge">
    {countMediaItems(mediaData)}
  </span>
)}
```

### Create More Behavior

When "Create more" is enabled:
- Keeps: mode, intendedUses, selectedProjectId, clientVisibility, billable
- Resets: title, description, mediaData

## Future Backend Integration

When backend is ready:

1. Replace localStorage with API calls
2. Save media data to database on "Save & Close"
3. Link media data to task via `taskId`
4. Fetch media data when editing existing tasks
5. Implement proper file uploads (currently mocked)
6. Implement clearance check API integration
7. Implement persona authorization verification

## Best Practices

1. **Always validate** before saving (use `validateAllTabs()`)
2. **Clear localStorage** after successful task submission
3. **Auto-save frequently** to prevent data loss
4. **Show validation errors** in context (switch to tab with error)
5. **Warn about unsaved changes** when closing modal
6. **Restore from localStorage** when reopening modal for same task

## Example Usage

```tsx
import { useMediaManager } from '@/contexts/MediaManagerContext'
import { validateAllTabs } from '@/utils/mediaValidation'
import { getTabRequirements } from '@/utils/tabRequirements'

function MyComponent() {
  const { 
    mediaData, 
    updateAssets, 
    hasUnsavedChanges,
    markAsSaved 
  } = useMediaManager()
  
  const handleSave = () => {
    const validation = validateAllTabs(
      mediaData, 
      'human-made', 
      ['Advertising']
    )
    
    if (!validation.isValid) {
      // Show errors
      return
    }
    
    // Save data
    markAsSaved()
  }
  
  const requirements = getTabRequirements('human-made')
  // requirements.assets.required === true
}
```
