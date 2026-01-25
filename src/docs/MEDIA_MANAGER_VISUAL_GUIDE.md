# Media Manager Visual Guide

## UI Components Overview

### 1. Attachment Button (Footer Left)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [📎] (3)  │  ☐ Create more   [Create Task]  ⌘↵          │
│   ↑                                                         │
│   Badge shows                                               │
│   item count                                                │
└─────────────────────────────────────────────────────────────┘
```

**States:**
- No media: Just paperclip icon, no badge
- With media: Paperclip + blue badge with count
- Hover: Gray background
- Click: Opens Media Manager modal

### 2. Media Summary Section (Above Footer)

#### Collapsed State
```
┌─────────────────────────────────────────────────────────────┐
│ 📎  Media Attached                           5 items    ▼  │
│     3 Assets, 1 Prompt, 1 Creator                          │
└─────────────────────────────────────────────────────────────┘
```

#### Expanded State
```
┌─────────────────────────────────────────────────────────────┐
│ 📎  Media Attached                           5 items    ▲  │
│     3 Assets, 1 Prompt, 1 Creator                          │
├─────────────────────────────────────────────────────────────┤
│  Assets:              3                                     │
│  Prompt:              247 characters                        │
│  Creator DNA:         1                                     │
│                                                             │
│  ⚠ 1 creator authorization expires soon                    │
│                                                             │
│  [Edit Media]                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Gray background (distinguishes from main content)
- Blue accents (count, edit button)
- Yellow warnings with ⚠ icon
- Click header to expand/collapse
- Full-width button

### 3. Task Modal Layout (Full View)

```
┌───────────────────────────────────────────────────────────────┐
│ New Task > Brand Refresh Campaign                    ⤢    ✕ │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Title: [______________________________]                      │
│                                                               │
│  Description:                                                 │
│  [_____________________________]                              │
│  [_____________________________]                              │
│                                                               │
│  Target Audience: [__________________________]                │
│                                                               │
│  🎯 Intended Uses: [+ Select...]                             │
│  [Advertising/Campaigns] [Social Media]                       │
│                                                               │
│  [Type: None ▼] [Mode: Manual ▼] [Priority ▼] ... [More ▼]  │
│                                                               │
├─ More Expanded (optional) ────────────────────────────────────┤
│  Client Visibility                                            │
│  ○ Internal only  ○ Visible  ○ Can comment                   │
│                                                               │
│  Budget Tracking                                              │
│  Estimated hours: [___]  ☐ Billable: Yes                     │
└───────────────────────────────────────────────────────────────┘
├─ Media Summary (when media exists) ───────────────────────────┤
│ 📎  Media Attached                           5 items    ▼    │
│     3 Assets, 1 Prompt, 1 Creator                            │
└───────────────────────────────────────────────────────────────┘
├─ Footer ──────────────────────────────────────────────────────┤
│ [📎] (5)  │  ☐ Create more   [Create Task]  ⌘↵             │
└───────────────────────────────────────────────────────────────┘
```

### 4. Validation Error State

```
┌───────────────────────────────────────────────────────────────┐
│ 📎  Media Attached                           5 items    ▲    │
│     3 Assets, 1 Prompt, 1 Creator                            │
├───────────────────────────────────────────────────────────────┤
│  Assets:              3                                       │
│  Prompt:              247 characters                          │
│  Creator DNA:         1                                       │
│                                                               │
│  ❌ 1 creator has expired authorization                       │
│  ⚠ 2 assets pending clearance review                         │
│                                                               │
│  [Edit Media]                                                 │
└───────────────────────────────────────────────────────────────┘

Toast: "❌ Please fix media errors before creating task"
```

### 5. Warning Confirmation Dialog

```
┌────────────────────────────────────────────────────────┐
│  Media validation warnings:                            │
│                                                        │
│  • 1 creator authorization expires soon                │
│  • 2 assets pending clearance review                   │
│                                                        │
│  Do you want to continue anyway?                       │
│                                                        │
│                          [Cancel]  [Continue]          │
└────────────────────────────────────────────────────────┘
```

## Interaction Flows

### Flow 1: Adding Media

```
1. Task Modal Open
   ↓
2. Click 📎 button
   ↓
3. Media Manager Opens
   ↓
4. Add Assets (3)
   ↓
5. Add Prompt (1)
   ↓
6. Add Creator (1)
   ↓
7. Click "Save & Close"
   ↓
8. Back to Task Modal
   - Badge shows: (5)
   - Summary appears
   ↓
9. Click "Create Task"
   ↓
10. Validation passes
    ↓
11. Task created ✓
```

### Flow 2: Validation Error

```
1. Task Modal Open
   ↓
2. Add media with expired creator
   ↓
3. Click "Create Task"
   ↓
4. Validation fails ❌
   ↓
5. Toast error appears
   ↓
6. Summary auto-expands
   ↓
7. Red errors shown
   ↓
8. Click "Edit Media"
   ↓
9. Fix issues in Media Manager
   ↓
10. Save & return
    ↓
11. Try "Create Task" again
    ↓
12. Validation passes ✓
```

### Flow 3: Warning Acceptance

```
1. Task Modal Open
   ↓
2. Add media with expiring creator
   ↓
3. Click "Create Task"
   ↓
4. Validation passes with warnings ⚠
   ↓
5. Confirmation dialog appears
   ↓
6. User reviews warnings
   ↓
7. User clicks "Continue"
   ↓
8. Task created (with warning logged) ✓
```

## Visual States

### Badge States

**No Media:**
```
[📎]
```

**With Media:**
```
[📎] (3)
     ↑
   Blue badge
   White text
   Round pill
```

**Hover:**
```
[📎] (3)
 ↑
Gray background
```

### Summary States

**Collapsed:**
- Single line
- Chevron down (▼)
- Item count on right
- Gray background

**Expanded:**
- Multiple lines
- Chevron up (▲)
- Detailed breakdown
- Warnings (if any)
- Edit button

**With Warnings:**
- Yellow ⚠ icons
- Yellow text
- Borders/backgrounds as needed

**With Errors:**
- Red ❌ icons
- Red text
- More prominent display

## Color Palette

### Light Mode
- **Background:** `bg-gray-50`
- **Border:** `border-gray-200`
- **Text Primary:** `text-gray-900`
- **Text Secondary:** `text-gray-600`
- **Accent (Blue):** `bg-blue-600`, `text-blue-600`
- **Warning (Yellow):** `text-yellow-600`
- **Error (Red):** `text-red-600`
- **Success (Green):** `text-green-600`

### Dark Mode
- **Background:** `dark:bg-gray-800/50`
- **Border:** `dark:border-gray-800`
- **Text Primary:** `dark:text-white`
- **Text Secondary:** `dark:text-gray-400`
- **Accent (Blue):** `dark:bg-blue-600`, `dark:text-blue-400`
- **Warning (Yellow):** `dark:text-yellow-400`
- **Error (Red):** `dark:text-red-400`
- **Success (Green):** `dark:text-green-400`

## Typography

- **Section Headers:** `text-sm font-medium`
- **Summary Text:** `text-xs`
- **Item Counts:** `text-xs font-medium`
- **Button Text:** `text-xs`
- **Warning Text:** `text-xs`
- **Badge Text:** `text-[10px] font-semibold`

## Spacing

- **Section Padding:** `px-6 py-3` or `px-6 py-4`
- **Item Gaps:** `gap-2` or `gap-3`
- **Border Radius:** `rounded-md` or `rounded-lg`
- **Badge Padding:** `px-1`
- **Button Padding:** `px-3 py-1.5`

## Responsive Behavior

### Desktop (default)
- Full width summary section
- All details visible when expanded
- Hover effects enabled

### Tablet
- Same layout
- Touch-friendly tap targets

### Mobile
- Full width maintained
- Increased tap target sizes
- Scroll in expanded content if needed

## Accessibility

### Keyboard Navigation
- Tab: Move between clickable elements
- Enter/Space: Toggle expand/collapse
- Enter: Activate buttons
- Esc: Close modals

### Screen Readers
- Summary header announces item count
- Warnings announced with "Warning" prefix
- Errors announced with "Error" prefix
- Expanded/collapsed state announced

### Focus Indicators
- Blue ring on focus: `focus:ring-2 focus:ring-blue-500`
- Visible focus on all interactive elements

### ARIA Labels
```html
<button 
  aria-label="Media Manager, 5 items attached"
  aria-expanded="false"
>
  ...
</button>
```

## Animation

### Transitions
- Collapse/expand: `transition-all duration-150`
- Hover effects: `transition`
- Badge appearance: Instant (no animation)

### Micro-interactions
- Hover: Background color change
- Click: Slight scale (optional)
- Expand: Smooth height transition

## Print Styles

When printing task:
- Media summary visible
- Show all details (auto-expanded)
- Hide interactive elements (Edit button)
- Show counts and warnings
- Maintain readable formatting
