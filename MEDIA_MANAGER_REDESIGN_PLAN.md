# Media Manager Redesign Plan - Linear Style

## Current Issues
1. ❌ Gray background doesn't match the clean white of other dialogs
2. ❌ Tabs have gray background pills - not Linear style
3. ❌ "Creator DNA" should be "Talent Rights"
4. ❌ Content area styling is inconsistent
5. ❌ Empty states are not visually appealing
6. ❌ Buttons lack Linear's clean, minimal aesthetic
7. ❌ Overall UX feels cluttered compared to the rest of the app

## Design Goals
- Match the clean, minimal Linear aesthetic
- Pure white background with clean borders
- Simple underline tabs (no background pills)
- Consistent spacing and typography
- Better visual hierarchy
- Cleaner empty states
- More intuitive action buttons

## Implementation Steps

### 1. Fix Dialog Background & Styling
**File**: `src/components/media-manager/media-manager.tsx`
- Apply same `!important` style overrides as Task Dialog
- Change from `max-w-6xl` to `max-w-5xl` for better proportions
- Add inline styles to override glass-card backdrop blur
- Ensure pure white background, no transparency

**Changes**:
```typescript
// Before:
className="bg-white dark:bg-[#0d0e14] border border-gray-200 dark:border-gray-800 p-0 w-full max-w-6xl max-h-[90vh] rounded-xl"

// After:
className="!bg-white dark:!bg-[#0d0e14] !border-gray-200 dark:!border-gray-800 !p-0 !gap-0 !w-full !max-w-5xl !max-h-[90vh] !rounded-xl !shadow-xl"
style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' } as React.CSSProperties}
```

### 2. Redesign Tab Navigation - Linear Style
**Current**: Rounded pills with gray backgrounds
**New**: Clean underline tabs like Linear

**Changes**:
- Remove rounded backgrounds from tabs
- Add bottom border to tab container
- Active tab: blue underline + bold text
- Inactive tabs: gray text, hover effect
- Remove the blue dot indicator (use checkmark badge instead)
- Simplify required tab indication

**Visual Structure**:
```
┌─────────────────────────────────────────────┐
│ Assets    Prompts    Training    References │  ← Underlined active tab
│ ━━━━━━                          Talent Rights│  ← Blue underline
└─────────────────────────────────────────────┘
```

### 3. Rename "Creator DNA" to "Talent Rights"
**Files**:
- `src/components/media-manager/media-manager.tsx`
- Any types/interfaces referencing "creator-dna"

**Changes**:
- Update tab label: `'Creator DNA'` → `'Talent Rights'`
- Update tab ID can stay as `'creator-dna'` for backwards compatibility
- Update all UI text references
- Update variable names where appropriate (assignedCreators → assignedTalent)

### 4. Improve Content Area Styling
**Goals**:
- Remove gray backgrounds from content cards
- Use subtle borders instead
- Better spacing and padding
- Cleaner hover states

**Changes**:
- Asset cards: White background with border, subtle shadow on hover
- Replace `bg-gray-50 dark:bg-gray-800` with `border border-gray-200`
- Add hover effects: `hover:border-blue-300 hover:shadow-sm`
- Improve empty state icons and text

### 5. Redesign Action Buttons
**Current**: Multiple styled buttons (white, blue, borders)
**New**: Linear-style consistency

**Primary Actions** (Upload, Create):
- Blue background
- Rounded-lg
- Icon + text

**Secondary Actions** (Link from library):
- White background
- Border
- Icon + text
- Hover: slight gray background

### 6. Improve Empty States
**Changes**:
- Larger, cleaner icons
- Better typography hierarchy
- Add subtle help text
- More inviting call-to-action

### 7. Enhance Individual Tab UX

#### Assets Tab
- Cleaner asset cards with better thumbnails
- Improve clearance status badges
- Better file type icons

#### Prompts Tab
- Cleaner textarea styling
- Better save-to-library toggle
- Improve prompt suggestions UI

#### Training Tab
- Grid layout for training datasets
- Better visual indicators for cleared status
- Cleaner dataset cards

#### References Tab
- Simplified reference cards
- Better reordering UI
- Cleaner notes expansion

#### Talent Rights Tab (formerly Creator DNA)
- Cleaner creator cards
- Better authorization status display
- Simplified NILP components UI
- Improved role selection dropdown

### 8. Polish Footer Actions
- Match button styles with new task dialog
- Better spacing
- Clearer visual hierarchy

## Expected Outcome
✅ Clean, pure white background matching task dialog
✅ Linear-style underline tabs
✅ "Talent Rights" replaces "Creator DNA"
✅ Consistent styling throughout
✅ Better UX with cleaner interactions
✅ More intuitive button hierarchy
✅ Professional, modern appearance

## Testing Checklist
- [ ] Dialog opens with clean white background
- [ ] Tabs switch smoothly with underline animation
- [ ] All tabs display content correctly
- [ ] Empty states are clear and helpful
- [ ] Buttons respond to hover/click appropriately
- [ ] Dark mode works correctly
- [ ] All functionality preserved
- [ ] Mobile/responsive behavior
