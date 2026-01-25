# Prompt Suggestion System

## Overview

The Prompt Suggestion System is an intelligent recommendation engine that suggests relevant prompts to users based on their task context (creative type, AI tool selection, and intended use). It learns from past usage patterns and helps users create better prompts faster.

## Location

### Core Files
- **Algorithm**: `src/lib/promptSuggestions.ts` - Scoring and matching logic
- **Main Component**: `src/components/PromptSuggestions.tsx` - Suggestion UI
- **Preview Modal**: `src/components/PromptPreviewModal.tsx` - Detailed prompt view

### Integration Points
- **Media Manager**: `src/components/media-manager/media-manager.tsx` (Prompts tab)
- **Task Creation**: `src/app/(dashboard)/projects/[id]/tasks/page.tsx`

## Features

### ✅ Intelligent Scoring Algorithm

Prompts are scored based on multiple relevance factors (0-100 points):

| Factor | Points | Description |
|--------|--------|-------------|
| **Creative Type Match** | +40 | Exact match on creative type (e.g., "Product Photography") |
| **Tool Match** | +30 | Same AI tool used (e.g., "Midjourney v6") |
| **Intended Use Match** | +20 | Same intended use (e.g., "Advertising") |
| **High Rating** | +10 | Effectiveness rating ≥ 4.0 stars |
| **High Usage** | +5 | Usage count > 10 |
| **Recent Usage** | +5 | Used within last 30 days |
| **Similar Tags** | +2 each | Matching tags beyond main categories |

**Total possible score**: 100 (capped)

### ✅ Match Indicators

Visual indicators based on relevance score:

- **🎯 Perfect match** (80-100 points) - Green badge
- **✓ Good match** (50-79 points) - Blue badge
- **· Related** (1-49 points) - Gray badge

### ✅ Smart Sorting

Users can sort suggestions by:
- **Relevance** (default) - By calculated score
- **Rating** - By effectiveness rating (stars)
- **Usage** - By total usage count
- **Recent** - By last used date

### ✅ Usage Tracking

Automatically tracks:
- Prompt ID
- Usage timestamp
- Task type (creative type)
- Tool used
- Stores in localStorage for future ML training

### ✅ Empty States

Handles three scenarios gracefully:

1. **No Context**: Prompts user to complete task details
2. **No Matches**: Provides tips for creating effective prompts
3. **Has Suggestions**: Shows top 5 most relevant prompts

## Architecture

### Data Flow

```
Task Form Data
    ↓
MediaManager Props
    ↓
PromptSuggestions Component
    ↓
getRelevantPrompts()
    ↓
MOCK_PROMPT_LIBRARY (filtered & scored)
    ↓
Display Top 5 Suggestions
    ↓
User Selects → trackPromptUsage() → localStorage
```

### Scoring Algorithm

```typescript
function getRelevantPrompts(params: {
  creativeType?: string
  toolUsed?: string
  intendedUse?: string
  limit?: number
}): PromptSuggestion[]
```

**Process:**
1. Iterate through all prompts in library
2. Calculate score for each based on context match
3. Generate match reasons (for display)
4. Filter out prompts with score = 0
5. Sort by score (descending)
6. Return top N (default 5)

**Example Output:**
```typescript
{
  prompt: PromptLibraryItem,
  relevanceScore: 87,
  matchReasons: [
    'Same creative type',
    'Same tool',
    'Highly rated'
  ]
}
```

## Component APIs

### PromptSuggestions Component

```typescript
interface PromptSuggestionsProps {
  creativeType?: string       // From task form (e.g., "Product Photography")
  toolUsed?: string          // From AI tool selection (e.g., "Midjourney v6")
  intendedUse?: string       // From intended uses (e.g., "Advertising")
  onSelectPrompt: (promptText: string) => void  // Callback when prompt selected
  className?: string         // Optional styling
}
```

**Usage:**
```typescript
<PromptSuggestions
  creativeType={taskFormData.designType}
  toolUsed={taskFormData.selectedTools[0]}
  intendedUse={taskFormData.intendedUses[0]}
  onSelectPrompt={(text) => setPromptText(text)}
/>
```

### PromptPreviewModal Component

```typescript
interface PromptPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  prompt: PromptLibraryItem | null
  onUsePrompt: (promptText: string) => void
}
```

**Features:**
- Full prompt text display
- Complete metadata (creator, dates, stats)
- Star rating visualization
- Success rate percentage
- Tag badges
- NILP component indicators
- Use/Cancel actions

## User Experience

### Typical Flow

1. **User opens task modal** → Fills in creative type, tool, intended use
2. **User opens Media Manager** → Navigates to Prompts tab
3. **Suggestions auto-appear** → Based on task context
4. **User reviews suggestions** → Sees relevance scores and match reasons
5. **User selects a prompt** → Either "Use This Prompt" or "Preview Full"
6. **Prompt populates editor** → User can edit or use as-is
7. **Usage tracked** → Increments count, updates last used date

### Interaction Patterns

#### Suggestion Card Actions
- **Use This Prompt** - Immediate copy to editor, closes suggestions
- **Preview Full** - Opens modal with complete details

#### Preview Modal Actions
- **Cancel** - Close without action
- **Use This Prompt** - Copy to editor and close

#### Expandable Section
- Click header to collapse/expand suggestions
- Saves screen space when not needed
- Badge shows suggestion count

## Mock Data Integration

### Source Data

Uses `MOCK_PROMPT_LIBRARY` with 20 prompts:
- Various creative types (Product Photography, Social Media, Video Production)
- Multiple AI tools (Midjourney, DALL-E, Stable Diffusion, RunwayML)
- Different intended uses (Advertising, Editorial, Social Media)
- Realistic ratings (3.5 - 5.0 stars)
- Varied usage counts (2 - 47 uses)
- Recent usage dates

### Data Structure

```typescript
interface PromptLibraryItem {
  id: string
  title: string
  promptText: string
  creativeType: string
  toolUsed: string
  intendedUse: string
  tags: string[]
  effectivenessRating: number  // 1-5 stars
  usageCount: number
  successfulOutputs: number
  createdBy: string
  createdDate: Date
  lastUsedDate: Date
}
```

## Usage Tracking

### LocalStorage Schema

**Key**: `prompt-usage-history`

**Value**: Array of usage records
```typescript
{
  promptId: 'prompt-001',
  usedAt: '2025-01-24T10:30:00Z',
  taskType: 'Product Photography',
  tool: 'Midjourney v6'
}
```

**Features:**
- Keeps last 100 usages
- FIFO (First In, First Out) when limit reached
- Used for future ML training
- Helps identify user's favorite prompts

### Tracking Functions

```typescript
// Track a prompt usage
trackPromptUsage(promptId, taskType, tool?)

// Get usage history
getPromptUsageHistory(): UsageRecord[]

// Get user's favorite prompts
getUserFavoritePrompts(limit: number): PromptLibraryItem[]
```

## Visual Design

### Suggestion Card Layout

```
┌─────────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐ (4.8)          Used 23 times ↗       │
│                                                 │
│ Product Photography - Lifestyle Shot            │
│ 🎯 Perfect match: Same creative type, Same tool │
│                                                 │
│ "Create a warm, lifestyle product photo..."    │
│                                                 │
│ 👤 Sarah Johnson  🕒 Last used 3 days ago       │
│                                                 │
│ [lifestyle] [product] [kitchen]                 │
│                                                 │
│ [Use This Prompt]  [Preview Full]               │
└─────────────────────────────────────────────────┘
```

### Color Coding

- **Perfect match** - Green text (`text-green-600`)
- **Good match** - Blue text (`text-blue-600`)
- **Related** - Gray text (`text-gray-600`)
- **Selected action** - Blue button (`bg-blue-600`)
- **Secondary action** - White button with border

### Responsive Design

- **Desktop**: Full cards with all details
- **Tablet**: Maintains card layout, wraps tags
- **Mobile**: Stacks elements vertically, maintains readability

## Empty State Messaging

### No Context Provided

```
💡 Prompt Suggestions

Complete the task details above to see
relevant prompt suggestions:
• Creative Type
• Approved Tools (if AI method)
• Intended Use
```

### No Matches Found

```
💡 No similar prompts found

You'll be creating a new prompt for this
combination. Make it great and it'll help
future projects!

Tips for effective prompts:
• Be specific about style and mood
• Include technical details (lighting, etc.)
• Reference examples when helpful
• Specify output format and dimensions
```

## Performance Considerations

### Current (Mock Data)
- **20 prompts**: Instant scoring (<5ms)
- **Filtering**: Real-time with debounce
- **LocalStorage**: Minimal overhead

### Future (Production)
- **1000+ prompts**: Consider indexing
- **Search**: Implement fuzzy matching
- **Caching**: Cache scored results
- **API**: Paginated prompt fetching
- **ML**: Server-side recommendation engine

## Testing Scenarios

### Scenario 1: Perfect Match
```typescript
creativeType: 'Product Photography'
toolUsed: 'Midjourney v6'
intendedUse: 'Advertising'

Expected: 
- Top prompt scores 80-100
- Shows "🎯 Perfect match"
- All three match reasons displayed
```

### Scenario 2: Partial Match
```typescript
creativeType: 'Product Photography'
toolUsed: undefined
intendedUse: undefined

Expected:
- Prompts score 40-50
- Shows "✓ Good match" or "· Related"
- Only creative type match reason
```

### Scenario 3: No Context
```typescript
creativeType: undefined
toolUsed: undefined
intendedUse: undefined

Expected:
- Empty state message
- Prompts user to complete form
- No suggestions shown
```

### Scenario 4: No Matches
```typescript
creativeType: 'Rare Creative Type XYZ'
toolUsed: 'Unknown Tool'
intendedUse: 'Obscure Use'

Expected:
- Empty state with tips
- Encouragement message
- Prompt creation guidance
```

## Integration Guide

### Step 1: Add Props to MediaManager

```typescript
interface MediaManagerProps {
  // ... existing props
  creativeType?: string
  toolUsed?: string
  intendedUse?: string
}
```

### Step 2: Pass Props from Task Form

```typescript
<MediaManager
  // ... existing props
  creativeType={taskFormData.designType}
  toolUsed={taskFormData.selectedTools[0]}
  intendedUse={taskFormData.intendedUses[0]}
/>
```

### Step 3: Add to Prompts Tab

```typescript
{activeTab === 'prompts' && (
  <div className="space-y-6">
    <PromptSuggestions
      creativeType={creativeType}
      toolUsed={toolUsed}
      intendedUse={intendedUse}
      onSelectPrompt={(text) => setPromptText(text)}
    />
    
    {/* Existing prompt editor */}
  </div>
)}
```

## Future Enhancements

### Phase 2: ML-Powered Recommendations
- Train on actual usage data
- Collaborative filtering (users like you also used...)
- Context-aware embeddings
- A/B test recommendation algorithms

### Phase 3: Advanced Features
- Prompt versioning and comparison
- Team-wide prompt templates
- Industry-specific prompt libraries
- Auto-complete as user types
- Prompt effectiveness feedback loop

### Phase 4: Analytics
- Most effective prompts dashboard
- Usage analytics per team/user
- ROI tracking (time saved)
- Quality metrics correlation

## API Migration Plan

When backend is ready:

### 1. Replace Mock Data
```typescript
// Before
import { MOCK_PROMPT_LIBRARY } from '@/lib/mockData'

// After
const { data: prompts } = await fetch('/api/prompts/library')
```

### 2. Track Usage Server-Side
```typescript
// POST /api/prompts/track-usage
{
  promptId: string
  taskId: string
  creativeType: string
  toolUsed?: string
}
```

### 3. Get Suggestions from API
```typescript
// GET /api/prompts/suggest?creativeType=X&tool=Y&use=Z
Response: PromptSuggestion[]
```

### 4. Save New Prompts
```typescript
// POST /api/prompts/library
{
  title: string
  promptText: string
  metadata: {
    creativeType: string
    toolUsed: string
    intendedUse: string
    tags: string[]
  }
}
```

## Troubleshooting

### Issue: No suggestions showing
**Check:**
1. Are task form fields filled in?
2. Is MOCK_PROMPT_LIBRARY imported correctly?
3. Do any prompts match the context?
4. Check browser console for errors

### Issue: Suggestions not updating
**Check:**
1. Are props being passed correctly?
2. Is creativeType/toolUsed/intendedUse changing?
3. Is the component re-rendering?
4. Check React DevTools for prop values

### Issue: Preview modal not opening
**Check:**
1. Is Dialog component imported?
2. Is isOpen state being set?
3. Are there z-index conflicts?
4. Check browser console for errors

### Issue: Usage not tracking
**Check:**
1. Is localStorage available?
2. Is trackPromptUsage() being called?
3. Check localStorage in DevTools
4. Verify prompt ID exists in library

## Best Practices

### For Users
1. **Complete task details first** - Better suggestions
2. **Review match reasons** - Understand why suggested
3. **Preview before using** - See full context
4. **Edit as needed** - Suggestions are starting points
5. **Save effective prompts** - Help future projects

### For Developers
1. **Keep scoring weights tuned** - Based on user feedback
2. **Monitor performance** - Especially with large libraries
3. **Update mock data** - Keep realistic and diverse
4. **Test edge cases** - Empty states, no matches
5. **Gather usage metrics** - Improve algorithm over time

## Status

✅ **Complete and Integrated**
- Scoring algorithm implemented
- Components created and styled
- Integrated with Media Manager
- Mock data connected
- Usage tracking functional
- Documentation complete
- No linter errors
- Ready for testing

---

**Created:** January 24, 2025  
**Last Updated:** January 24, 2025  
**Status:** Production-ready with mock data  
**Lines of Code:** ~800 (algorithm + components)
