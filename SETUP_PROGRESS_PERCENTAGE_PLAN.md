# Setup Progress Percentage Display Plan

## Current Issue
The setup indicator shows "0/21" which feels overwhelming:
- 21 steps seems like a huge task
- Users see "21" and feel discouraged before starting
- The fraction format emphasizes the large total

## Goal
Change to percentage display which feels more achievable:
- "0%" feels like a fresh start, not a mountain to climb
- Percentages are psychologically easier (progress in small increments)
- More encouraging UX ("5% complete" vs "1/21")
- Matches modern app conventions (Linear, Notion, etc.)

## Implementation Plan

### 1. Update Setup Context Progress Calculation
**File**: `src/lib/contexts/setup-context.tsx`

**Current** (line 250-251):
```typescript
// Progress string for badge
const progress = `${completedTasks}/${totalTasks}`
```

**Change to**:
```typescript
// Progress string for badge - show as percentage
const progressPercentage = totalTasks > 0 
  ? Math.round((completedTasks / totalTasks) * 100) 
  : 0
const progress = `${progressPercentage}%`
```

**Why**:
- Calculate percentage: `(completedTasks / totalTasks) * 100`
- Round to whole number (no decimals like "4.76%")
- Handle edge case when totalTasks is 0
- Format with % symbol

### 2. Keep Detailed Progress Available
Add a new property to context for components that need detailed numbers:

```typescript
interface SetupContextType {
  // ... existing properties
  progress: string // Now shows "5%" instead of "1/21"
  progressPercentage: number // Raw percentage number (5)
  detailedProgress: string // "1/21" for places that need it
  totalTasks: number // Still available
  completedTasks: number // Still available
}
```

Return in provider:
```typescript
const value: SetupContextType = {
  setupState,
  isSetupComplete,
  isDismissed: setupState.isDismissed,
  progress, // "5%"
  progressPercentage, // 5
  detailedProgress: `${completedTasks}/${totalTasks}`, // "1/21"
  totalTasks,
  completedTasks,
  completeTask,
  dismissSetup,
  resetSetup,
}
```

### 3. Update Sidebar Badge Display (Optional Enhancement)
**File**: `src/components/layout/Sidebar.tsx`

Currently badge just shows the progress string. Could enhance with:
- Better styling for percentage
- Optionally show tooltip with detailed progress on hover
- Add color progression (red → yellow → green as percentage increases)

**Basic Change**:
Keep as is - it will automatically show "5%" instead of "1/21"

**Enhanced Change** (optional):
```typescript
badge: progress, // Will show "5%"
badgeTooltip: `${completedTasks} of ${totalTasks} tasks completed`, // Tooltip
```

### 4. Update Setup Page Display (Optional)
**File**: `src/app/(dashboard)/setup/page.tsx`

If the setup page shows progress, update it to show:
- Large percentage at top: "5% Complete"
- Small subtext: "1 of 21 tasks completed"
- Progress bar visual

## Visual Comparison

### Before:
```
Setup [0/21]
```
- Emphasis on large total (21)
- Feels like a lot of work
- Progress increments slowly (5% per task)

### After:
```
Setup [0%]
```
- Clean, simple number
- Feels achievable
- Psychological win with each completion

## Benefits

1. **Less Overwhelming**: "0%" vs "0/21" - smaller cognitive load
2. **Better UX**: Standard pattern users expect
3. **More Encouraging**: "5% complete!" feels like progress
4. **Cleaner UI**: Shorter text fits better in badge
5. **Professional**: Matches modern SaaS conventions

## Edge Cases Handled

1. **No tasks**: `0%` (handled by Math.round and ternary)
2. **Partial progress**: `5%` (1/21), `48%` (10/21), `95%` (20/21)
3. **Complete**: `100%` (21/21)
4. **Rounding**: Always rounds to whole number (no "4.76%")

## Implementation Steps

1. Update setup-context.tsx progress calculation
2. Add progressPercentage and detailedProgress to context type
3. Update provider value to include new properties
4. Test that Sidebar badge shows percentage
5. (Optional) Add tooltip with detailed progress
6. (Optional) Update setup page header to show percentage

## Testing

- [ ] Badge shows "0%" when no tasks complete
- [ ] Badge shows correct percentage after completing tasks
- [ ] Badge shows "100%" when all tasks complete
- [ ] No decimal places in percentage
- [ ] Detailed progress still available if needed elsewhere

## Result

Users will see:
- ✅ **"Setup 0%"** instead of **"Setup 0/21"**
- More encouragement to start
- Better sense of progress
- Cleaner, more professional UI
