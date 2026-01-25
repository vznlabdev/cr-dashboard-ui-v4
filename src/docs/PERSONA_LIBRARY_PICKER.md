# Persona Library Picker Component

## Overview

The `PersonaLibraryPicker` is a full-featured modal component for selecting creators and personas from the library, with support for authorization tracking, role filtering, and quick persona creation.

## Location

`src/components/PersonaLibraryPicker.tsx`

## Features

### ✅ Core Functionality
- **Multi-select Mode**: Select multiple creators (default)
- **Single-select Mode**: Radio button behavior for one creator
- **Search**: Real-time filtering by name, NILP ID, or role
- **Status Filter**: Filter by authorization status
- **Role Filter**: Filter by creator role
- **Quick Create**: Create new personas without leaving the picker
- **Authorization Warnings**: Special handling for advertising use
- **Keyboard Shortcuts**: Escape, Enter, and navigation

### ✅ Authorization Status Tracking

**Four Status Types:**

1. **🟢 Authorized** (Green)
   - Valid authorization
   - Not expiring soon (>30 days)
   - Safe to use for all purposes

2. **🟡 Expires Soon** (Yellow)
   - Authorization expires within 30 days
   - Shows days remaining
   - Warning for advertising use

3. **🔴 Expired** (Red)
   - Authorization has expired
   - Cannot be used for advertising
   - Requires renewal

4. **⚪ Pending** (Gray)
   - Authorization awaiting approval
   - Cannot be used for advertising
   - Legal/compliance review in progress

### ✅ Persona Card Display

Each persona card shows:
- ☑️ Checkbox (multi-select) or radio (single-select)
- 🖼️ Avatar (80x80, circular)
- 👤 Name (bold, prominent)
- 🔢 NILP ID (clickable, opens profile)
- 🎯 Authorization status with color indicator
- 🎭 Role badge (Model, Actor, Voice Actor, etc.)
- 📅 Expiration date or "No expiration"
- 🔤 NILP Components: N I L P badges (Name, Image, Likeness, Personality)

### ✅ Search & Filters

**Search Bar:**
- Searches: name, NILP ID, role
- Debounced (300ms)
- Clear button when active

**Status Filter:**
- All Statuses
- 🟢 Authorized Only
- 🟡 Expiring Soon
- 🔴 Expired
- ⚪ Pending Approval

**Role Filter:**
- All Roles
- Dynamically populated from available roles
- Model, Actor, Voice Actor, Brand Ambassador, Influencer, etc.

### ✅ Advertising Mode

When `intendedUse` includes "Advertising":
- Shows warning banner at top
- Highlights expired/pending personas
- Shows selection warnings in footer
- Prevents compliance issues

### ✅ Quick Create Persona

**[+ Create New]** button opens inline form:

**Required Fields:**
- Name
- Authorization Document (.pdf, .doc, .docx)

**Optional Fields:**
- Role (dropdown)
- Photo upload
- NILP Components (checkboxes: Name, Image, Likeness, Personality)
- Expiration Date
- Notes

**Behavior:**
- NILP ID auto-generated: `CR-YYYY-XXXXX`
- Status set to "Pending" automatically
- Auto-selects the new persona
- Adds to MOCK_PERSONA_LIBRARY (simulated)
- Shows success toast

### ✅ Selection Warnings

Footer shows aggregate warnings:
- "1 creator has expired authorization"
- "2 creators expire soon"
- "1 creator has pending authorization"
- Compliance warning for advertising use

## Props

```typescript
interface PersonaLibraryPickerProps {
  isOpen: boolean                      // Modal visibility
  onClose: () => void                  // Close handler
  onSelect: (selectedPersonas: AssignedCreator[]) => void  // Confirm handler
  multiSelect?: boolean                // Default: true
  intendedUse?: string                 // For advertising warnings
  selectedPersonaIds?: string[]        // Currently assigned (shows checkmarks)
}
```

## Usage

### Basic Usage
```typescript
import { PersonaLibraryPicker } from '@/components/PersonaLibraryPicker'

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false)
  const [assignedCreators, setAssignedCreators] = useState([])

  const handleSelect = (personas) => {
    setAssignedCreators([...assignedCreators, ...personas])
  }

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Add Creator
      </button>

      <PersonaLibraryPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiSelect={true}
        selectedPersonaIds={assignedCreators.map(c => c.id)}
      />
    </>
  )
}
```

### With Advertising Warnings
```typescript
<PersonaLibraryPicker
  isOpen={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={handleSelect}
  intendedUse="Advertising/Campaigns"  // ← Triggers warnings
  selectedPersonaIds={assignedIds}
/>
```

### Single-Select Mode
```typescript
<PersonaLibraryPicker
  isOpen={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={(personas) => setCreator(personas[0])}
  multiSelect={false}  // ← Only one selection
/>
```

## Integration with Media Manager

In `src/components/media-manager/media-manager.tsx`:

```typescript
<PersonaLibraryPicker
  isOpen={showPersonaPicker}
  onClose={() => setShowPersonaPicker(false)}
  onSelect={handleAssignPersonas}
  multiSelect={true}
  selectedPersonaIds={assignedCreators.map(ac => ac.persona.id)}
/>
```

The `handleAssignPersonas` callback receives the selected personas and adds them to the assigned creators list.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close modal (cancel) |
| `Enter` | Confirm selection |
| `Space` | Toggle selection (when focused) |
| `Tab` | Navigate between fields |

## Visual States

### Default State
```
┌────────────────────────────────────────────┐
│ Select Creators/Personas            [X]    │
├────────────────────────────────────────────┤
│ [Search...] [Status ▼] [Role ▼] [+Create] │
├────────────────────────────────────────────┤
│ [ ] 🧑 Sarah Johnson  CR-2025-00001        │
│     🟢 Authorized • Model                   │
│     Expires: Dec 31, 2026                   │
│     NILP: [N][I][L][P]                      │
└────────────────────────────────────────────┘
```

### Selected State
```
┌────────────────────────────────────────────┐
│ [✓] 🧑 Marcus Chen  CR-2025-00002          │
│     🟡 Expires Soon (18 days) • Actor       │
│     Expires: Feb 12, 2025                   │
│     NILP: [N][I][L][P]                      │
│     ← Blue border, blue background          │
└────────────────────────────────────────────┘
```

### With Warnings (Footer)
```
┌────────────────────────────────────────────┐
│ ⚠ 1 creator has expired authorization      │
│ ⚠ 1 creator expires soon                   │
│ This may cause compliance issues.           │
│                                             │
│ 2 creators selected  [Cancel] [Select]     │
└────────────────────────────────────────────┘
```

## Authorization Status Colors

| Status | Color | Border | Background |
|--------|-------|--------|------------|
| Authorized | Green (`text-green-600`) | `border-green-200` | `bg-green-50` |
| Expires Soon | Yellow (`text-yellow-600`) | `border-yellow-200` | `bg-yellow-50` |
| Expired | Red (`text-red-600`) | `border-red-200` | `bg-red-50` |
| Pending | Gray (`text-gray-600`) | `border-gray-200` | `bg-gray-50` |

## NILP Component Badges

Small colored badges showing which components are included:

- **N** (Blue) - Name
- **I** (Green) - Image
- **L** (Purple) - Likeness
- **P** (Orange) - Personality

## Empty States

### No Personas in Library
```
       👤
No creators registered yet
Create your first creator profile to get started
    [Create New Persona]
```

### No Search Results
```
       🔍
No creators match your filters
Try adjusting your search or filters
     [Clear Filters]
```

## Quick Create Form

### Layout
```
┌────────────────────────────────────────────┐
│ Create New Persona                  [X]    │
├────────────────────────────────────────────┤
│ Name *                                     │
│ [________________]                         │
│                                             │
│ Role                                        │
│ [Select role... ▼]                         │
│                                             │
│ NILP ID (auto-generated)                   │
│ [CR-2025-XXXXX]                            │
│                                             │
│ Photo                                       │
│ [Choose photo...]                          │
│                                             │
│ NILP Components                            │
│ ☑ Name     ☑ Image                         │
│ ☑ Likeness ☑ Personality                   │
│                                             │
│ Authorization Document *                   │
│ [Choose document...]                       │
│                                             │
│ Expiration Date                            │
│ [YYYY-MM-DD]                               │
│                                             │
│ Notes                                       │
│ [________________]                         │
│                                             │
│                 [Cancel] [Create & Select] │
└────────────────────────────────────────────┘
```

### Validation
- Name: required
- Authorization Document: required
- All other fields: optional
- Button disabled until required fields filled

### On Create
1. Generates NILP ID: `CR-2025-[random 5 digits]`
2. Sets status to "Pending"
3. Adds to MOCK_PERSONA_LIBRARY
4. Auto-selects the new persona
5. Closes create form
6. Shows in main picker list

## Data Structure

### Input (from MOCK_PERSONA_LIBRARY)
```typescript
{
  id: 'persona-001',
  name: 'Sarah Johnson',
  nilpId: 'CR-2025-00001',
  avatarUrl: 'https://i.pravatar.cc/150?img=1',
  authorizationStatus: 'authorized',
  expirationDate: new Date('2026-12-31'),
  role: 'Brand Ambassador',
  nilpComponents: {
    name: true,
    image: true,
    likeness: true,
    personality: true
  }
}
```

### Output (onSelect callback)
```typescript
// Array of selected personas
[
  {
    id: 'persona-001',
    name: 'Sarah Johnson',
    nilpId: 'CR-2025-00001',
    avatarUrl: '...',
    authorizationStatus: 'authorized',
    expirationDate: Date,
    role: 'Brand Ambassador',
    nilpComponents: { ... }
  }
]
```

## Styling

### Design System
- **Font Sizes**: 
  - Header: `text-lg` (18px)
  - Persona name: `text-base` (16px)
  - Body text: `text-sm` (14px)
  - Metadata: `text-xs` (12px)
- **Spacing**: Consistent with Linear's minimal style
- **Colors**: Full dark mode support
- **Borders**: Subtle, color-coded by status
- **Transitions**: Smooth hover and selection effects

### Responsive Design
- Mobile: Single column, stacked layout
- Tablet: 2-column grid maintained
- Desktop: 2-column grid with comfortable spacing

## Performance

### Optimizations
- ✅ Debounced search (300ms)
- ✅ Memoized filtered results
- ✅ Lazy avatar loading
- ✅ Efficient re-renders with useMemo
- ✅ Set-based selection tracking

### Mock Data
Uses `MOCK_PERSONA_LIBRARY` with 12 personas:
- 5 Authorized
- 3 Expires Soon
- 2 Expired
- 2 Pending

## Testing Scenarios

### 1. Happy Path
```typescript
// Select authorized creators
const authorized = MOCK_PERSONA_LIBRARY.filter(
  p => p.authorizationStatus === 'authorized'
)
// Should show 5 creators with green status
```

### 2. Warning Path
```typescript
// Select expiring creators
intendedUse="Advertising/Campaigns"
// Should show yellow warning banner
// Footer shows expiration warnings
```

### 3. Error Path
```typescript
// Select expired creators for advertising
intendedUse="Advertising/Campaigns"
// Shows red warning banner
// Compliance warning in footer
```

### 4. Empty State
```typescript
// Clear all filters with no results
statusFilter="expired"
roleFilter="Dancer" // Role that doesn't exist
// Shows "No creators match your filters"
```

### 5. Create New
```typescript
// Click [+ Create New]
// Fill name and upload auth doc
// Click [Create & Select]
// New persona appears in list, auto-selected
```

## Accessibility

- ✅ Keyboard navigation
- ✅ Focus management
- ✅ ARIA labels on interactive elements
- ✅ Screen reader friendly
- ✅ High contrast mode support

## Integration Points

### 1. Media Manager (Creator DNA Tab)
```typescript
<button onClick={() => setShowPersonaPicker(true)}>
  <Plus /> Add Creator/Persona
</button>

<PersonaLibraryPicker
  isOpen={showPersonaPicker}
  onClose={() => setShowPersonaPicker(false)}
  onSelect={handleAssignPersonas}
  multiSelect={true}
  selectedPersonaIds={assignedCreators.map(ac => ac.persona.id)}
/>
```

### 2. Task Creation Modal
Could be used directly in task modal if needed:
```typescript
<PersonaLibraryPicker
  isOpen={showCreatorPicker}
  onClose={() => setShowCreatorPicker(false)}
  onSelect={(personas) => setTaskCreator(personas[0])}
  multiSelect={false}  // Single creator for task
/>
```

## Validation Rules

### Selection Validation
- At least one creator must be selected to enable "Select" button
- Warns about expired authorizations
- Warns about pending authorizations for advertising
- Warns about expiring authorizations (< 30 days)

### Create Form Validation
- **Name**: Required, non-empty
- **Authorization Document**: Required
- **Role**: Optional
- **Photo**: Optional
- **NILP Components**: At least one must be checked (all checked by default)
- **Expiration**: Optional
- **Notes**: Optional

## Mock Data Integration

Uses centralized mock data:
```typescript
import { MOCK_PERSONA_LIBRARY } from '@/lib/mockData'
```

12 mock personas with varied statuses:
- CR-2025-00001 through CR-2025-00012
- Realistic names, roles, and authorization states
- Avatar placeholders from pravatar.cc
- Complete metadata

## Future Enhancements

### Backend Integration
When backend is ready:
1. Replace MOCK_PERSONA_LIBRARY with API call
2. Implement real persona creation
3. Add authorization document upload to S3
4. Real-time authorization status updates
5. Fetch persona profile on NILP ID click

### Additional Features
- Bulk operations (assign multiple to multiple tasks)
- Authorization renewal workflow
- Expiration notifications
- Persona profile modal (full view)
- Authorization history
- Advanced filters (specialties, social media followers)
- Sort options (name, expiration date, status)

## Troubleshooting

### Issue: Personas not showing
**Solution:** Check MOCK_PERSONA_LIBRARY import
```typescript
import { MOCK_PERSONA_LIBRARY } from '@/lib/mockData'
console.log(MOCK_PERSONA_LIBRARY.length) // Should be 12
```

### Issue: Selection not working
**Solution:** Ensure selectedPersonaIds prop is array of strings
```typescript
selectedPersonaIds={assignedCreators.map(ac => ac.persona.id)}
// Not: selectedPersonaIds={assignedCreators} ❌
```

### Issue: Warnings not showing
**Solution:** Check intendedUse prop
```typescript
intendedUse="Advertising/Campaigns"  // Must include "Advertising"
// intendedUse="advertising" also works (case-insensitive)
```

### Issue: Create button always disabled
**Solution:** Check required fields
```typescript
// Both must be filled:
newPersonaName.trim() && newPersonaAuthDoc
```

## Complete Example

```typescript
import { PersonaLibraryPicker } from '@/components/PersonaLibraryPicker'
import { useState } from 'react'

export function CreatorDNATab() {
  const [showPicker, setShowPicker] = useState(false)
  const [assignedCreators, setAssignedCreators] = useState([])

  const handleSelect = (personas) => {
    // Filter out already assigned
    const newPersonas = personas.filter(
      p => !assignedCreators.find(ac => ac.id === p.id)
    )
    
    setAssignedCreators([...assignedCreators, ...newPersonas])
    console.log('Selected:', newPersonas)
  }

  return (
    <div>
      <button 
        onClick={() => setShowPicker(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Creator/Persona
      </button>

      <PersonaLibraryPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiSelect={true}
        intendedUse="Advertising/Campaigns"
        selectedPersonaIds={assignedCreators.map(c => c.id)}
      />

      {/* Display assigned creators */}
      <div>
        {assignedCreators.map(creator => (
          <div key={creator.id}>
            <img src={creator.avatarUrl} alt={creator.name} />
            <p>{creator.name}</p>
            <p>{creator.nilpId}</p>
            <p>{creator.authorizationStatus}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Status

✅ **Complete and Integrated**
- Component created
- Integrated with Media Manager
- Mock data connected
- No linter errors
- Documentation complete
- Ready for testing

---

**Created:** January 24, 2025
**Last Updated:** January 24, 2025
**Status:** Production-ready with mock data
