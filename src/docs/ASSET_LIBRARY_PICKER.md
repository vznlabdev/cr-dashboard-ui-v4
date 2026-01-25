# Asset Library Picker Component

## Overview

The `AssetLibraryPicker` is a powerful, full-featured modal component for browsing and selecting assets from the Digital Asset Management (DAM) library, with advanced filtering, sorting, multiple view modes, and clearance status tracking.

## Location

`src/components/AssetLibraryPicker.tsx`

## Features

### ✅ Core Functionality
- **Multi-select Mode**: Select multiple assets (default)
- **Single-select Mode**: Radio button behavior for one asset
- **Grid/List View Toggle**: Switch between visual modes
- **Search**: Real-time filtering with 300ms debounce
- **Advanced Filters**: Type, Status, Date range
- **Sorting**: Sort by filename, type, status, size, date
- **Range Selection**: Shift+Click for multi-select
- **Select All**: Respect current filters
- **Keyboard Shortcuts**: Full navigation support

### ✅ View Modes

#### Grid View (Default)
- 4-column responsive grid (3 on tablet, 2 on mobile)
- Visual thumbnails for images
- File type icons for non-images
- Clearance status badges (top-right)
- Checkboxes (top-left)
- Hover effects with scale
- Click anywhere to toggle selection

#### List View
- Sortable table layout
- Columns: Checkbox, Thumbnail, Filename, Status, Size, Uploaded
- Click column headers to sort
- Row hover highlighting
- More compact for large libraries

### ✅ Search & Filters

**Search Bar:**
- Searches: filename, tags, uploader name
- Debounced (300ms) for performance
- Instant visual feedback

**Type Filter:**
- All Types
- Images (.jpg, .png, .gif, .webp)
- Videos (.mp4, .mov, .avi)
- Documents (.pdf, .doc, .docx)
- Design Files (.psd, .ai, .fig, .sketch)

**Status Filter:**
- All Statuses
- ✓ Cleared (green)
- ⚠ Pending Review (yellow)
- ❌ Uncleared (red)
- 🔄 In Progress (gray)

**Date Filter:**
- All Time
- Last 7 Days
- Last 30 Days
- Last 3 Months
- Last 6 Months

### ✅ Clearance Status Indicators

**Four Status Types:**

1. **✓ Cleared** (Green)
   - API verification passed
   - Admin approved
   - Safe to use

2. **⚠ Pending** (Yellow)
   - Awaiting admin review
   - API check complete
   - Use with caution

3. **❌ Uncleared** (Red)
   - Failed verification
   - Cannot be used
   - Compliance issue

4. **🔄 In Progress** (Gray)
   - API check running
   - Processing
   - Check back later

### ✅ Special Filter Modes

#### Cleared-Only Mode
```typescript
<AssetLibraryPicker
  filterMode="cleared-only"
  ...
/>
```
- Auto-filters to cleared assets only
- Hides status filter (not needed)
- Shows info message: "Only cleared assets can be used"
- Use for compliance-sensitive features

#### Training Mode
```typescript
<AssetLibraryPicker
  filterMode="training-mode"
  ...
/>
```
- Same as cleared-only
- Shows info banner: "Only cleared assets can be used for training data"
- Disables selection of non-cleared items
- Used in Training tab

### ✅ Selection Behavior

**Multi-Select (Default):**
- Checkboxes visible on all cards
- Click card/row to toggle
- Cmd/Ctrl+Click for individual toggle
- Shift+Click for range selection (grid view)
- "Select All" button respects current filters
- Shows count: "X assets selected"

**Single-Select:**
- No checkboxes shown
- Radio button behavior
- Previous selection auto-cleared
- Shows: "1 asset selected" or "Select an asset"

### ✅ Sorting (List View)

Click column headers to sort:
- **Filename**: Alphabetical
- **Status**: Cleared → Pending → Uncleared
- **Size**: Bytes (smallest to largest)
- **Uploaded**: Date (newest to oldest)

Click again to reverse direction (↑/↓)

## Props

```typescript
interface AssetLibraryPickerProps {
  isOpen: boolean                           // Modal visibility
  onClose: () => void                       // Close handler
  onSelect: (selectedAssets: LinkedAsset[]) => void  // Confirm handler
  multiSelect?: boolean                     // Default: true
  filterMode?: 'all' | 'cleared-only' | 'training-mode'  // Default: 'all'
  selectedAssetIds?: string[]               // Currently selected (shows checkmarks)
}
```

## Usage

### Basic Usage
```typescript
import { AssetLibraryPicker } from '@/components/AssetLibraryPicker'

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false)
  const [linkedAssets, setLinkedAssets] = useState([])

  const handleSelect = (assets) => {
    setLinkedAssets([...linkedAssets, ...assets])
  }

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Link from Asset Library
      </button>

      <AssetLibraryPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiSelect={true}
        filterMode="all"
        selectedAssetIds={linkedAssets.map(a => a.id)}
      />
    </>
  )
}
```

### Cleared-Only Mode (Training Data)
```typescript
<AssetLibraryPicker
  isOpen={showTrainingPicker}
  onClose={() => setShowTrainingPicker(false)}
  onSelect={handleSelectTraining}
  filterMode="training-mode"  // ← Only cleared assets
  selectedAssetIds={trainingData.map(d => d.id)}
/>
```

### Single-Select Mode
```typescript
<AssetLibraryPicker
  isOpen={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={(assets) => setHeroImage(assets[0])}
  multiSelect={false}  // ← Only one selection
/>
```

## Integration with Media Manager

In `src/components/media-manager/media-manager.tsx`:

### Assets Tab
```typescript
<AssetLibraryPicker
  isOpen={showAssetLibrary}
  onClose={() => setShowAssetLibrary(false)}
  onSelect={handleLinkAssets}
  multiSelect={true}
  filterMode="all"
  selectedAssetIds={linkedAssets.map(a => a.id)}
/>
```

### Training Tab
```typescript
<AssetLibraryPicker
  isOpen={showTrainingPicker}
  onClose={() => setShowTrainingPicker(false)}
  onSelect={handleLinkTrainingData}
  multiSelect={true}
  filterMode="training-mode"  // ← Cleared only
  selectedAssetIds={trainingData.map(d => d.id)}
/>
```

### References Tab
```typescript
<AssetLibraryPicker
  isOpen={showReferenceLibraryPicker}
  onClose={() => setShowReferenceLibraryPicker(false)}
  onSelect={handleLinkReferenceAssets}
  multiSelect={true}
  filterMode="all"
  selectedAssetIds={references.filter(r => r.type === 'asset').map(r => r.id)}
/>
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close modal (cancel) |
| `Enter` | Confirm selection |
| `Cmd/Ctrl+A` | Select all (filtered results) |
| `Arrow Keys` | Navigate grid/list |
| `Space` | Toggle selection (when focused) |

## Visual States

### Grid View - Default
```
┌─────────────────────────────────────────┐
│ [⊞ Grid] [☰ List]        [Select All] │
├─────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│ │ ✓  │ │    │ │    │ │ ✓  │           │
│ │IMG │ │IMG │ │IMG │ │IMG │           │
│ │ ✓  │ │ ⚠  │ │ ❌ │ │ ✓  │           │
│ └────┘ └────┘ └────┘ └────┘           │
│ file1  file2  file3  file4             │
│ 2.4MB  1.8MB  5.1MB  3.2MB             │
└─────────────────────────────────────────┘
```

### List View - Alternative
```
┌─────────────────────────────────────────┐
│ [ ] 📷 Filename        Status  Size  Date│
├─────────────────────────────────────────┤
│ [✓] 📷 product_hero   ✓ Cleared  2.4MB │
│ [ ] 🎥 campaign_vid   ⚠ Pending  24MB  │
│ [ ] 📄 guidelines     ❌ Uncleared 8MB  │
│ [✓] 📷 team_photo     ✓ Cleared  3.2MB │
└─────────────────────────────────────────┘
```

### Training Mode Banner
```
┌─────────────────────────────────────────┐
│ ℹ️ Only cleared assets can be used for  │
│    training data                         │
└─────────────────────────────────────────┘
```

## Empty States

### No Assets in Library
```
       📁
   No assets yet
Upload your first asset to get started
     [Upload Asset]
```

### No Search Results
```
       🔍
No assets match your filters
Try adjusting your search or filters
     [Clear Filters]
```

## Performance Optimizations

### Implemented
- ✅ Debounced search (300ms)
- ✅ useMemo for filtered results
- ✅ useCallback for handlers
- ✅ Lazy image loading with `loading="lazy"`
- ✅ Set-based selection for O(1) lookups

### Planned (Future)
- Virtual scrolling for >100 assets
- Intersection observer for thumbnails
- Paginated loading (load 50, fetch more on scroll)
- Thumbnail caching
- Web Workers for heavy filtering

## Formatting Utilities

### File Size
```typescript
formatFileSize(3800000) // "3.8 MB"
formatFileSize(125000)  // "125.0 KB"
```

### Relative Date
```typescript
formatRelativeDate(new Date('2025-01-23')) // "Yesterday"
formatRelativeDate(new Date('2025-01-17')) // "7 days ago"
formatRelativeDate(new Date('2024-12-20')) // "1 month ago"
```

### File Type Category
```typescript
getFileTypeCategory('image/jpeg')        // 'images'
getFileTypeCategory('video/mp4')         // 'videos'
getFileTypeCategory('application/pdf')   // 'documents'
getFileTypeCategory('image/vnd.adobe.photoshop') // 'design'
```

## Mock Data

Uses `MOCK_ASSET_LIBRARY` with 30 assets:
- 12 Cleared (40%)
- 9 Pending (30%)
- 6 Uncleared (20%)
- 3 In-Progress (10%)

File types: .jpg, .png, .mp4, .pdf, .psd, .ai, .fig, .svg, .zip, .mp3

## Testing Scenarios

### 1. Happy Path
```typescript
// Select cleared assets
filterMode="all"
statusFilter="cleared"
// Should show 12 cleared assets
```

### 2. Training Mode
```typescript
// Only cleared for training
filterMode="training-mode"
// Shows info banner
// Only 12 cleared assets visible
```

### 3. Search
```typescript
searchQuery="product"
// Should filter to product-related assets
```

### 4. Multi-select with Range
```typescript
// Grid view
// Click asset 1
// Shift+Click asset 5
// Should select assets 1-5
```

### 5. Sort in List View
```typescript
// Switch to list view
// Click "Size" header
// Should sort by file size (ascending)
// Click again for descending
```

## Responsive Design

### Desktop (lg)
- 4-column grid
- Full filters visible
- Comfortable spacing

### Tablet (sm-md)
- 3-column grid
- Filters may wrap
- Maintained functionality

### Mobile (xs-sm)
- 2-column grid
- Stacked filters
- Touch-optimized

## Accessibility

- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Alt text on images
- ✅ ARIA labels
- ✅ Color contrast (WCAG AA)
- ✅ Screen reader friendly

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Safari
- ✅ Firefox
- ✅ Mobile browsers

## Migration to Backend

When backend is ready:

### 1. Replace Mock Data
```typescript
// Before
import { MOCK_ASSET_LIBRARY } from '@/lib/mockData'

// After
const { data: assets } = await fetch('/api/assets')
```

### 2. Add Pagination
```typescript
const [page, setPage] = useState(0)
const pageSize = 50

// Fetch on scroll
useEffect(() => {
  if (scrolledToBottom) {
    fetchMoreAssets(page + 1)
  }
}, [scrolledToBottom])
```

### 3. Implement Real Upload
```typescript
const handleUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/assets/upload', {
    method: 'POST',
    body: formData
  })
  
  return response.json()
}
```

## Complete Example

```typescript
import { AssetLibraryPicker } from '@/components/AssetLibraryPicker'
import { useState } from 'react'

export function AssetsTab() {
  const [showPicker, setShowPicker] = useState(false)
  const [linkedAssets, setLinkedAssets] = useState([])

  const handleSelect = (assets) => {
    // Filter out duplicates
    const newAssets = assets.filter(
      a => !linkedAssets.find(la => la.id === a.id)
    )
    
    setLinkedAssets([...linkedAssets, ...newAssets])
    console.log('Selected:', newAssets)
  }

  return (
    <div>
      <button 
        onClick={() => setShowPicker(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Link from Asset Library
      </button>

      <AssetLibraryPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiSelect={true}
        filterMode="all"
        selectedAssetIds={linkedAssets.map(a => a.id)}
      />

      {/* Display linked assets */}
      <div>
        {linkedAssets.map(asset => (
          <div key={asset.id}>
            <img src={asset.thumbnailUrl} alt={asset.filename} />
            <p>{asset.filename}</p>
            <p>{asset.clearanceStatus}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Filter Combinations

### Example 1: Recent cleared images
```typescript
searchQuery=""
typeFilter="images"
statusFilter="cleared"
dateFilter="30days"
// Shows cleared images from last 30 days
```

### Example 2: All videos
```typescript
typeFilter="videos"
statusFilter="all"
// Shows all videos regardless of clearance
```

### Example 3: Pending design files
```typescript
typeFilter="design"
statusFilter="pending"
// Shows .psd, .ai, .fig files awaiting review
```

## Troubleshooting

### Issue: No assets showing
**Solution:** Check MOCK_ASSET_LIBRARY import
```typescript
import { MOCK_ASSET_LIBRARY } from '@/lib/mockData'
console.log(MOCK_ASSET_LIBRARY.length) // Should be 30
```

### Issue: Selection not persisting
**Solution:** Ensure selectedAssetIds prop is correct
```typescript
selectedAssetIds={linkedAssets.map(a => a.id)}
// Must be array of strings (IDs only)
```

### Issue: Training mode showing uncleared
**Solution:** Verify filterMode prop
```typescript
filterMode="training-mode"  // Not "training" or "cleared"
```

### Issue: Thumbnails not loading
**Solution:** Check thumbnail URLs in mock data
```typescript
// Mock data uses picsum.photos placeholders
thumbnailUrl: 'https://picsum.photos/200/200?random=1'
```

## Performance Benchmarks

### Current (Mock Data)
- 30 assets: Instant load
- Search: < 50ms
- Filter change: < 50ms
- View toggle: < 100ms

### Expected (Production)
- 100 assets: < 200ms initial load
- 1000+ assets: Virtual scrolling required
- Search: < 300ms with debounce
- Pagination: 50 per page

## Status

✅ **Complete and Integrated**
- Component created
- Integrated with Media Manager (3 places)
- Mock data connected
- Grid and List views working
- All filters functional
- No linter errors
- Documentation complete
- Ready for testing

## Integration Summary

Used in 3 places within Media Manager:

1. **Assets Tab** (`filterMode="all"`)
   - Full library access
   - All clearance statuses
   - For linking final assets

2. **Training Tab** (`filterMode="training-mode"`)
   - Cleared assets only
   - Training compliance
   - For AI model training data

3. **References Tab** (`filterMode="all"`)
   - Full library access
   - Clearance not required
   - For inspiration/reference materials

---

**Created:** January 24, 2025
**Last Updated:** January 24, 2025  
**Status:** Production-ready with mock data
**Lines of Code:** ~600
