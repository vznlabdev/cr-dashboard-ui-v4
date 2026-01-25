# Media Manager Quick Start Guide

Get up and running with Media Manager in 5 minutes.

## 1. Basic Usage

### Open Media Manager from Task Modal

```typescript
// The attachment button is already integrated
// Just click the 📎 button in the task modal footer
```

The Media Manager opens automatically when you click the paperclip icon.

## 2. Add Content to Tabs

### Assets Tab
```typescript
// Click "Link from Asset Library" or "Upload New"
// Select assets
// See them appear in the linked assets list
```

### Prompts Tab
```typescript
// Type your prompt in the editor
// Optionally check "Save to Prompt Library"
// Fill in title and tags if saving
```

### Training Tab
```typescript
// Click "Link Training Datasets from Asset Library"
// Select cleared datasets
// See them in the grid display
```

### References Tab
```typescript
// Click "Link from Asset Library" for library assets
// Click "Upload Reference Files" for quick uploads  
// Click "Add URL Reference" for external links
// Drag to reorder, add notes to each reference
```

### Creator DNA Tab
```typescript
// Click "Add Creator/Persona"
// Select from library
// OR click "Create New Persona"
// Expand NILP Components to customize
// Select role if needed
```

## 3. Save & Return to Task Modal

```typescript
// Click "Save & Close" button
// Media data is saved to task
// Badge appears on attachment button: (5)
// Summary section appears above footer
```

## 4. Create Task

```typescript
// Fill in task details
// Click "Create Task"
// Validation runs automatically
// If errors: fix them in Media Manager
// If warnings: confirm to continue
// Task created with media attached
```

## Quick Examples

### Example 1: Human-Made Content

```typescript
// 1. Set Mode to "Manual"
// 2. Click attachment button (📎)
// 3. In Media Manager:
//    - Assets tab: Upload 3 product photos
//    - References tab: Add 2 inspiration URLs
//    - Creator DNA tab: Assign 1 photographer
// 4. Save & Close
// 5. Create Task
```

### Example 2: AI-Generated Content

```typescript
// 1. Set Mode to "AI Generative"
// 2. Click attachment button (📎)
// 3. In Media Manager:
//    - Prompts tab: Write detailed prompt
//    - Training tab: Link 2 training datasets
//    - Creator DNA tab: Assign 1 voice actor
// 4. Save & Close
// 5. Create Task
```

### Example 3: AI-Enhanced Content

```typescript
// 1. Set Mode to "AI Assisted"
// 2. Click attachment button (📎)
// 3. In Media Manager:
//    - Assets tab: Upload original asset
//    - Prompts tab: Describe enhancement
//    - References tab: Add style references
//    - Creator DNA tab: Assign original creator
// 4. Save & Close
// 5. Create Task
```

## Using Mock Data in Development

### Import Mock Data
```typescript
import { 
  MOCK_ASSET_LIBRARY,
  MOCK_PERSONA_LIBRARY,
  MOCK_PROMPT_LIBRARY,
  getSampleMediaData 
} from '@/lib/mockData'
```

### Use Sample Data
```typescript
// Get pre-populated sample data
const sampleMedia = getSampleMediaData('human-made')

// Use in development/testing
setMediaData(sampleMedia)
```

### Filter Mock Data
```typescript
import { 
  getAssetsByStatus,
  getPersonasByStatus,
  getTopRatedPrompts 
} from '@/lib/mockData'

const clearedAssets = getAssetsByStatus('cleared')
const authorizedCreators = getPersonasByStatus('authorized')
const topPrompts = getTopRatedPrompts(5)
```

## Common Tasks

### Check Media Badge Count
```typescript
import { getMediaCount } from '@/utils/mediaHelpers'

const count = getMediaCount(taskFormData.mediaData)
// Shows number in badge: (5)
```

### Validate Before Save
```typescript
import { validateAllTabs } from '@/utils/mediaValidation'

const validation = validateAllTabs(
  mediaData,
  'human-made',
  ['Advertising']
)

if (!validation.isValid) {
  // Show errors
  console.error(validation.allErrors)
}
```

### Get Tab Requirements
```typescript
import { getTabRequirements } from '@/utils/tabRequirements'

const requirements = getTabRequirements('ai-generated')
console.log(requirements.prompts.required) // true
console.log(requirements.assets.tooltip) // "Not typically used..."
```

## Troubleshooting

### Issue: No badge showing
**Solution:** Check if media data exists
```typescript
import { hasMediaData } from '@/utils/mediaHelpers'

if (!hasMediaData(taskFormData.mediaData)) {
  console.log('No media data present')
}
```

### Issue: Validation failing
**Solution:** Check validation results
```typescript
const validation = validateAllTabs(mediaData, method, intendedUse)
console.log('Errors:', validation.allErrors)
console.log('Warnings:', validation.allWarnings)
```

### Issue: Mock data not loading
**Solution:** Check imports
```typescript
// ❌ Wrong
import { MOCK_ASSET_LIBRARY } from '@/lib/mockData/assetLibrary'

// ✅ Correct
import { MOCK_ASSET_LIBRARY } from '@/lib/mockData'
```

### Issue: LocalStorage quota exceeded
**Solution:** Clear old data
```typescript
import { clearMediaDataFromStorage } from '@/contexts/MediaManagerContext'

clearMediaDataFromStorage('old-task-id')
```

## Keyboard Shortcuts

### Task Modal
- `⌘↵` or `Ctrl+Enter` - Create Task
- `Esc` - Close Modal (if no unsaved changes)

### Media Manager
- `Esc` - Close Media Manager
- `Enter` - Submit forms (URL input, create persona)
- `Tab` - Navigate between fields

## Tips & Tricks

### 1. Quick Testing
```typescript
import { getTestScenarioMedia } from '@/lib/mockData'

// Test with pre-made scenarios
const testData = getTestScenarioMedia('warnings')
```

### 2. Debug with Stats
```typescript
import { getAllMockDataStats } from '@/lib/mockData'

console.log(getAllMockDataStats())
// See complete statistics
```

### 3. Validate Mock Data
```typescript
import { validateMockData } from '@/lib/mockData'

const { isValid, issues } = validateMockData()
if (!isValid) console.error(issues)
```

### 4. Use Suggested Prompts
```typescript
import { getTopRatedPrompts } from '@/lib/mockData'

const suggestions = getTopRatedPrompts(5)
// Show in UI as suggestions
```

### 5. Filter by Authorization
```typescript
import { getPersonasByStatus, getExpiringPersonas } from '@/lib/mockData'

const safe = getPersonasByStatus('authorized')
const attention = getExpiringPersonas(30)
```

## Next Steps

1. **Explore the UI:** Open Media Manager and try all tabs
2. **Test Validation:** Try creating tasks with invalid media
3. **Check Mock Data:** Review `lib/mockData/README.md`
4. **Read Full Docs:** Check `docs/MEDIA_MANAGER_COMPLETE.md`
5. **Plan Backend:** Define API contracts

## Support Resources

- **Main Docs:** `docs/MEDIA_MANAGER_COMPLETE.md`
- **State Management:** `docs/MEDIA_MANAGER_STATE.md`
- **Integration:** `docs/MEDIA_MANAGER_INTEGRATION.md`
- **Visual Guide:** `docs/MEDIA_MANAGER_VISUAL_GUIDE.md`
- **Mock Data:** `lib/mockData/README.md`
- **This Guide:** `docs/MEDIA_MANAGER_QUICKSTART.md`

## Questions?

1. Check the relevant documentation file
2. Review mock data examples
3. Test with sample scenarios
4. Check console for validation errors
5. Verify localStorage (dev tools > Application > Local Storage)

---

**Ready to go!** Start by clicking the 📎 button in the task modal.
