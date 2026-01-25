# Mock Data for Media Manager

This directory contains comprehensive mock data for Media Manager development. All data is realistic but fictional, designed to simulate production scenarios without requiring backend services.

## File Structure

```
src/lib/mockData/
├── index.ts                    # Central export point
├── assetLibrary.ts            # 30 mock assets with varied clearance
├── personaLibrary.ts          # 12 mock creators with authorization states
├── promptLibrary.ts           # 20 mock prompts with ratings/usage
├── trainingDatasets.ts        # 8 mock training dataset collections
├── referenceMaterials.ts      # 15 mock reference items
├── helpers.ts                 # Utility functions for filtering/searching
├── initialStates.ts           # State generators and test scenarios
└── README.md                  # This file
```

## Data Overview

### Asset Library (30 assets)

**Distribution:**
- 12 Cleared (40%) - API verified + admin approved
- 9 Pending (30%) - Awaiting admin review
- 6 Uncleared (20%) - Failed verification
- 3 In-Progress (10%) - API check running

**File Types:**
- Images: .jpg, .png, .svg
- Videos: .mp4
- Documents: .pdf
- Design Files: .psd, .ai, .fig
- Archives: .zip

**Size Range:** 89 KB - 52 MB

**Metadata Includes:**
- Uploader name
- Dimensions (for images/videos)
- Duration (for videos)
- Tags (content type, brand, campaign)
- Clearance reason (for uncleared)
- Processing status (for in-progress)

**Usage:**
```typescript
import { MOCK_ASSET_LIBRARY, getAssetsByStatus } from '@/lib/mockData'

const clearedAssets = getAssetsByStatus('cleared')
const imageAssets = getAssetsByType('jpg')
const searchResults = searchAssets('product')
```

### Persona Library (12 creators)

**Distribution:**
- 5 Authorized (42%) - Valid, not expiring soon
- 3 Expires Soon (25%) - < 30 days remaining
- 2 Expired (17%) - Authorization ended
- 2 Pending (17%) - Awaiting approval

**Roles:**
- Brand Ambassador (3)
- Voice Actor (3)
- Model (3)
- Actor (2)
- Influencer (2)

**NILP ID Format:** CR-YYYY-NNNNN (e.g., CR-2025-00001)

**Metadata Includes:**
- Email and phone
- Authorization document reference
- Specialties
- Social media (for influencers)
- Renewal status
- Expiration reason

**Usage:**
```typescript
import { MOCK_PERSONA_LIBRARY, getPersonasByStatus, getExpiringPersonas } from '@/lib/mockData'

const authorized = getPersonasByStatus('authorized')
const expiringSoon = getExpiringPersonas(30) // Next 30 days
const voiceActors = getPersonasByRole('Voice Actor')
```

### Prompt Library (20 prompts)

**Categories:**
- Product Photography (2)
- Social Media (5)
- Video (4)
- Copywriting (6)
- Design (6)
- Audio (1)

**Metrics:**
- Effectiveness Rating: 4.0 - 5.0 stars
- Usage Count: 14 - 82 uses
- Success Rate: 72% - 94%

**Features:**
- Actual detailed prompt text (100-300 words)
- Tags for filtering
- Created by/date
- Last used date
- Private/shared status

**Usage:**
```typescript
import { MOCK_PROMPT_LIBRARY, getTopRatedPrompts, getPromptsByTag } from '@/lib/mockData'

const topPrompts = getTopRatedPrompts(5)
const socialMediaPrompts = getPromptsByTag('social-media')
const recentPrompts = getRecentlyUsedPrompts(7) // Last 7 days
```

### Training Datasets (8 collections)

**Categories:**
- Visual (3) - Images and design files
- Text (1) - Copywriting and content
- Audio (1) - Voice and music
- Mixed (3) - Combination of types

**Size Range:** 45 MB - 8.4 GB

**Asset Counts:** 56 - 1,847 assets per dataset

**All Cleared:** Training data must always be cleared

**Metadata Includes:**
- Asset count
- File types included
- Total size
- Description and use case
- Creator
- Usage count
- Last updated date

**Usage:**
```typescript
import { MOCK_TRAINING_DATASETS, searchDatasets, getTopUsedDatasets } from '@/lib/mockData'

const visualDatasets = getDatasetsByCategory('visual')
const largeDatasets = getLargeDatasets(200) // Min 200 assets
const searchResults = searchDatasets('product')
```

### Reference Materials (15 items)

**Distribution:**
- 6 Asset Library Links (40%)
- 6 Direct Uploads (40%)
- 3 URLs (20%)

**URL Examples:**
- Behance galleries
- Dribbble shots
- Pinterest pins

**Features:**
- Notes explaining relevance
- Order priority
- File sizes (for uploads)
- Thumbnails

**Usage:**
```typescript
import { MOCK_REFERENCES, getReferencesByType, searchReferenceNotes } from '@/lib/mockData'

const uploads = getReferencesByType('upload')
const urlRefs = getReferencesByType('url')
const orderedRefs = getOrderedReferences()
```

## Helper Functions

### Asset Helpers
- `getAssetsByStatus(status)` - Filter by clearance status
- `getAssetsByType(extension)` - Filter by file type
- `searchAssets(query)` - Search by filename/tags
- `getRandomAssets(count)` - Random selection for testing
- `getAssetsByUploader(name)` - Filter by uploader
- `getRecentAssets(days)` - Recently uploaded
- `getAssetsByTag(tag)` - Filter by tag

### Persona Helpers
- `getPersonasByStatus(status)` - Filter by authorization
- `getExpiringPersonas(days)` - Expiring within timeframe
- `searchPersonas(query)` - Search name/NILP ID
- `getPersonasByRole(role)` - Filter by role
- `getPersonasWithComponent(component)` - Filter by NILP component
- `getPersonasNeedingAttention()` - Expired, pending, or expiring

### Prompt Helpers
- `getPromptsByTag(tag)` - Filter by tag
- `getTopRatedPrompts(count)` - Highest rated
- `getPromptsByCategory(category)` - Filter by category
- `getMostUsedPrompts(count)` - Most frequently used
- `getPromptsBySuccessRate(minRate)` - Above threshold
- `searchPrompts(query)` - Search title/text/tags
- `getRecentlyUsedPrompts(days)` - Recently used

### Dataset Helpers
- `searchTrainingDatasets(query)` - Search name/description/tags
- `getDatasetsByCategory(category)` - Filter by category
- `getLargeDatasets(minAssets)` - Large collections only

### Statistics
- `getAssetLibraryStats()` - Complete asset statistics
- `getPersonaLibraryStats()` - Complete persona statistics
- `getPromptLibraryStats()` - Complete prompt statistics
- `getTrainingDatasetStats()` - Complete dataset statistics
- `getAllMockDataStats()` - Everything in one object

## Initial State Generators

### Empty States
```typescript
import { getEmptyMediaData } from '@/lib/mockData'

const emptyData = getEmptyMediaData()
// Returns clean MediaManagerData with all arrays empty
```

### Sample States
```typescript
import { getSampleMediaData } from '@/lib/mockData'

const humanMadeData = getSampleMediaData('human-made')
const aiGeneratedData = getSampleMediaData('ai-generated')
const aiEnhancedData = getSampleMediaData('ai-enhanced')
```

### Test Scenarios
```typescript
import { getTestScenarioMedia } from '@/lib/mockData'

const emptyState = getTestScenarioMedia('empty')
const minimalValid = getTestScenarioMedia('minimal')
const fullExample = getTestScenarioMedia('full')
const invalidData = getTestScenarioMedia('invalid')
const withWarnings = getTestScenarioMedia('warnings')
const advertisingUse = getTestScenarioMedia('advertising-use')
```

### Complete Tasks
```typescript
import { getTaskWithMedia, generateSampleTasks } from '@/lib/mockData'

const singleTask = getTaskWithMedia('ai-generated')
const multipleTasks = generateSampleTasks(10)
```

## Data Validation

Validate mock data integrity:
```typescript
import { validateMockData } from '@/lib/mockData'

const validation = validateMockData()
console.log(validation.isValid) // true
console.log(validation.issues)  // []
```

## Usage Examples

### Loading Asset Library
```typescript
import { MOCK_ASSET_LIBRARY, getAssetsByStatus } from '@/lib/mockData'

function AssetLibraryPicker() {
  const [assets, setAssets] = useState(MOCK_ASSET_LIBRARY)
  const clearedOnly = getAssetsByStatus('cleared')
  
  return (
    <div>
      {assets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
```

### Loading Persona Library
```typescript
import { MOCK_PERSONA_LIBRARY, getPersonasNeedingAttention } from '@/lib/mockData'

function PersonaPicker() {
  const [personas] = useState(MOCK_PERSONA_LIBRARY)
  const needsAttention = getPersonasNeedingAttention()
  
  // Show warning if personas need attention
  if (needsAttention.length > 0) {
    showWarning(`${needsAttention.length} creators need authorization review`)
  }
  
  return <PersonaList personas={personas} />
}
```

### Suggested Prompts
```typescript
import { getTopRatedPrompts, getPromptsByTag } from '@/lib/mockData'

function SuggestedPrompts({ category }: { category: string }) {
  const topPrompts = getTopRatedPrompts(5)
  const categoryPrompts = getPromptsByTag(category)
  
  return (
    <div>
      <h3>Top Rated Prompts</h3>
      {topPrompts.map(prompt => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  )
}
```

### Simulating API Calls
```typescript
import { simulateApiDelay, generateMockError } from '@/lib/mockData'

async function loadAssets() {
  try {
    await simulateApiDelay(800) // Simulate network delay
    
    // Simulate random error (10% chance)
    if (Math.random() < 0.1) {
      throw generateMockError('network')
    }
    
    return MOCK_ASSET_LIBRARY
  } catch (error) {
    console.error(error)
    throw error
  }
}
```

## Statistics Dashboard

Get comprehensive stats:
```typescript
import { getAllMockDataStats } from '@/lib/mockData'

const stats = getAllMockDataStats()

console.log(stats)
// {
//   assets: { total: 30, cleared: 12, pending: 9, ... },
//   personas: { total: 12, authorized: 5, ... },
//   prompts: { total: 20, averageRating: 4.5, ... },
//   datasets: { total: 8, totalAssets: 3567, ... },
//   timestamp: '2025-01-24T...'
// }
```

## Best Practices

### 1. Always Use Helper Functions
Don't filter manually - use provided helpers:
```typescript
// ❌ Bad
const cleared = MOCK_ASSET_LIBRARY.filter(a => a.clearanceStatus === 'cleared')

// ✅ Good
const cleared = getAssetsByStatus('cleared')
```

### 2. Simulate Realistic Delays
Add delays for realistic UX:
```typescript
await simulateApiDelay(500) // Simulate network
```

### 3. Use Test Scenarios
Test edge cases with generators:
```typescript
const invalidMedia = getTestScenarioMedia('invalid')
// Use for testing validation error handling
```

### 4. Validate Data Integrity
Run validation in tests:
```typescript
const validation = validateMockData()
expect(validation.isValid).toBe(true)
```

### 5. Use Appropriate Sample Data
Match creation method:
```typescript
// ✅ Good - matches creation method
const humanMadeData = getSampleMediaData('human-made')

// ❌ Bad - using wrong sample
const aiData = getSampleMediaData('human-made') // Should use 'ai-generated'
```

## Extending Mock Data

### Adding New Assets
1. Open `assetLibrary.ts`
2. Add new object to `MOCK_ASSET_LIBRARY` array
3. Maintain clearance status distribution
4. Use next sequential ID
5. Add realistic metadata

### Adding New Personas
1. Open `personaLibrary.ts`
2. Add new object to `MOCK_PERSONA_LIBRARY` array
3. Use next sequential NILP ID
4. Maintain authorization status distribution
5. Include contact info and specialties

### Adding New Prompts
1. Open `promptLibrary.ts`
2. Add new object to `MOCK_PROMPT_LIBRARY` array
3. Write detailed, realistic prompt text
4. Add appropriate tags and category
5. Set realistic metrics (rating, usage, success rate)

## Data Relationships

### Assets → Tasks
Assets can be linked to tasks via Media Manager. When a task is created:
```typescript
const mediaPayload = {
  assets: mediaData.assets.map(a => a.id),
  // ... other fields
}
```

### Personas → Tasks → Authorization
Personas must have valid authorization for advertising use:
```typescript
if (intendedUse.includes('Advertising')) {
  // Check all assigned personas
  const invalid = personas.filter(p => 
    p.authorizationStatus === 'expired' || 
    p.authorizationStatus === 'pending'
  )
  if (invalid.length > 0) {
    throw new Error('Valid authorization required for advertising')
  }
}
```

### Prompts → Library
Prompts can be saved to library for reuse:
```typescript
if (promptData.saveToLibrary) {
  // Save to MOCK_PROMPT_LIBRARY (in production, save to DB)
  const newPrompt = {
    id: generateId(),
    title: promptData.title,
    text: promptData.text,
    tags: promptData.tags,
    // ... other fields
  }
}
```

### Training Datasets → Tasks
Training datasets are collections of cleared assets:
```typescript
const dataset = MOCK_TRAINING_DATASETS[0]
console.log(`${dataset.name} contains ${dataset.assetCount} cleared assets`)
```

## Testing with Mock Data

### Unit Tests
```typescript
import { getAssetsByStatus, validateMockData } from '@/lib/mockData'

describe('Asset Library', () => {
  it('should have correct number of cleared assets', () => {
    const cleared = getAssetsByStatus('cleared')
    expect(cleared.length).toBe(12)
  })
  
  it('should have valid data structure', () => {
    const validation = validateMockData()
    expect(validation.isValid).toBe(true)
  })
})
```

### Integration Tests
```typescript
import { getTaskWithMedia, getSampleMediaData } from '@/lib/mockData'
import { validateAllTabs } from '@/utils/mediaValidation'

describe('Media Manager Integration', () => {
  it('should validate sample human-made data', () => {
    const mediaData = getSampleMediaData('human-made')
    const validation = validateAllTabs(mediaData, 'human-made', [])
    expect(validation.isValid).toBe(true)
  })
})
```

### E2E Tests
```typescript
import { generateSampleTasks } from '@/lib/mockData'

describe('Task List View', () => {
  it('should render tasks with media', () => {
    const tasks = generateSampleTasks(10)
    const withMedia = tasks.filter(t => t.media)
    expect(withMedia.length).toBeGreaterThan(0)
  })
})
```

## Performance Considerations

### Lazy Loading
For large datasets, load on demand:
```typescript
// ✅ Good - load only when needed
const [assets, setAssets] = useState<LinkedAsset[]>([])

useEffect(() => {
  if (showAssetPicker) {
    setAssets(MOCK_ASSET_LIBRARY)
  }
}, [showAssetPicker])
```

### Memoization
Memoize expensive filters:
```typescript
const clearedAssets = useMemo(() => 
  getAssetsByStatus('cleared'),
  []
)
```

### Pagination
For UI with many items:
```typescript
const pageSize = 12
const paginatedAssets = MOCK_ASSET_LIBRARY.slice(
  page * pageSize,
  (page + 1) * pageSize
)
```

## Transition to Backend

When backend is ready:

### 1. Replace Imports
```typescript
// Before (mock)
import { MOCK_ASSET_LIBRARY } from '@/lib/mockData'

// After (real API)
import { fetchAssets } from '@/lib/api/assets'
```

### 2. Replace Functions
```typescript
// Before
const assets = getAssetsByStatus('cleared')

// After
const assets = await fetchAssets({ clearanceStatus: 'cleared' })
```

### 3. Update Types
Ensure backend types match mock data types:
```typescript
// Mock types should match backend API response
interface ApiAssetResponse {
  id: string
  filename: string
  // ... matches LinkedAsset interface
}
```

### 4. Remove Delays
```typescript
// Remove simulation delays
// await simulateApiDelay(500) // DELETE THIS
```

### 5. Keep Helper Functions
Many helpers can be adapted for real data:
```typescript
// searchAssets can work with both mock and real data
export function searchAssets(assets: LinkedAsset[], query: string) {
  return assets.filter(asset => 
    asset.filename.toLowerCase().includes(query.toLowerCase())
  )
}
```

## Troubleshooting

### Issue: Duplicate IDs
Run validation:
```typescript
const validation = validateMockData()
if (!validation.isValid) {
  console.error(validation.issues)
}
```

### Issue: Wrong Data Count
Check expected counts:
- Assets: 30
- Personas: 12
- Prompts: 20
- Datasets: 8
- References: 15

### Issue: Type Errors
Ensure all required fields present:
```typescript
// All assets must have these fields
interface RequiredFields {
  id: string
  filename: string
  fileType: string
  fileSize: number
  thumbnailUrl: string
  clearanceStatus: 'cleared' | 'pending' | 'uncleared'
  source: 'library' | 'upload'
  uploadedAt: Date
}
```

## Contributors

Mock data created for comprehensive Media Manager testing and development. All data is fictional and for development purposes only.

**Last Updated:** January 24, 2025

**Data Version:** 1.0.0
