# Architecture Documentation

> **Code Structure, Patterns, and Best Practices**

This document provides a comprehensive overview of the codebase architecture, design patterns, and conventions used in the Creation Rights Dashboard.

---

## 📐 Architecture Overview

### High-Level Structure

```
┌─────────────────────────────────────────┐
│           Next.js App Router            │
│         (React Server Components)       │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼─────┐    ┌─────▼──────┐
│  Dashboard│    │  Creative  │
│  Workspace│    │  Workspace │
└─────┬─────┘    └─────┬──────┘
      │                │
      └────────┬───────┘
               │
   ┌───────────▼───────────┐
   │   Shared Components   │
   │   Layout & UI         │
   └───────────┬───────────┘
               │
   ┌───────────▼───────────┐
   │   State Management    │
   │   (Context API)       │
   └───────────┬───────────┘
               │
   ┌───────────▼───────────┐
   │   Utilities & Types   │
   └───────────────────────┘
```

---

## 🗂️ Directory Structure

### `/src/app` - Application Routes

```
app/
├── layout.tsx                 # Root layout (theme provider, fonts)
├── globals.css                # Global styles, theme variables
├── not-found.tsx              # 404 page
│
└── (dashboard)/               # Dashboard route group
    ├── layout.tsx             # Dashboard layout (sidebar, header)
    ├── page.tsx               # Main dashboard home
    │
    ├── projects/              # Project management
    │   ├── page.tsx           # Project list
    │   └── [id]/
    │       ├── page.tsx       # Project detail
    │       └── assets/
    │           └── [assetId]/
    │               └── page.tsx # Asset detail
    │
    ├── creative/              # Creative workspace
    │   ├── page.tsx           # Creative home
    │   ├── tickets/           # Ticket/request management
    │   │   ├── page.tsx       # Kanban board
    │   │   ├── new/
    │   │   └── [id]/
    │   ├── brands/            # Brand management
    │   ├── team/              # Team management
    │   └── assets/            # Asset library
    │
    ├── legal/                 # Legal review
    ├── insurance/             # Risk assessment
    ├── integrations/          # AI tool connections
    ├── settings/              # Configuration
    └── analytics/             # Coming soon
```

**Patterns:**
- **Route groups** `(dashboard)` - Group routes without affecting URL structure
- **Dynamic segments** `[id]` - Dynamic route parameters
- **Nested layouts** - Each level can have its own layout

---

### `/src/components` - Reusable Components

```
components/
│
├── ui/                        # shadcn/ui primitives
│   ├── button.tsx             # Base button component
│   ├── card.tsx               # Card component
│   ├── dialog.tsx             # Modal dialog
│   └── ...                    # 20+ base components
│
├── layout/                    # Layout components
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── Header.tsx             # Top header bar
│   ├── MainLayout.tsx         # Main content wrapper
│   ├── PageContainer.tsx      # Consistent page container
│   ├── WorkspaceSwitcher.tsx  # Workspace selection
│   └── sidebar-context.tsx    # Sidebar state management
│
├── cr/                        # Creation Rights components
│   ├── new-project-dialog.tsx # Create project modal
│   ├── notification-center.tsx # Notification dropdown
│   ├── compliance-score-gauge.tsx # Compliance gauge
│   ├── empty-state.tsx        # Empty state placeholder
│   └── ...                    # 15+ components
│
└── creative/                  # Creative workspace components
    ├── KanbanBoard.tsx        # Kanban board container
    ├── KanbanColumn.tsx       # Individual Kanban column
    ├── TicketCard.tsx         # Ticket display card
    ├── BrandCard.tsx          # Brand display card
    ├── TeamMemberCard.tsx     # Team member profile
    ├── AssetCard.tsx          # Asset display card
    └── ...                    # 10+ components
```

**Component Categories:**
1. **UI Components** - Base primitives from shadcn/ui
2. **Layout Components** - Page structure and navigation
3. **Feature Components** - Business logic and domain-specific
4. **Workspace Components** - Creative workspace specific

**Naming Conventions:**
- **PascalCase** for component files (e.g., `Button.tsx`)
- **Descriptive names** that reflect purpose (e.g., `DeleteProjectDialog.tsx`)
- **Index files** for barrel exports (e.g., `components/cr/index.ts`)

---

### `/src/contexts` - State Management

```
contexts/
├── data-context.tsx           # CRUD operations for projects/assets
├── notification-context.tsx   # Notification state management
└── workspace-context.tsx      # Creative workspace state
```

**State Management Pattern:**

```typescript
// 1. Define context and provider
const DataContext = createContext<DataContextType | undefined>(undefined)

// 2. Create provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  
  const createProject = async (data: Partial<Project>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const newProject = { id: generateId(), ...data }
    setProjects(prev => [...prev, newProject])
    return newProject
  }
  
  return (
    <DataContext.Provider value={{ projects, createProject }}>
      {children}
    </DataContext.Provider>
  )
}

// 3. Export custom hook
export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
```

**When to use Context vs. Props:**
- **Context** - Global state, cross-cutting concerns (theme, auth, data)
- **Props** - Component-specific data, one-level deep passing

---

### `/src/lib` - Utilities & Helpers

```
lib/
├── index.ts                   # Barrel export for all utilities
├── utils.ts                   # Core utilities (cn, etc.)
├── design-icons.ts            # Shared icon mappings
├── format-utils.ts            # Date/size formatting
├── export-utils.ts            # CSV/JSON export
├── api.ts                     # API client setup
├── api-errors.ts              # Error handling
├── constants.ts               # App constants
├── type-guards.ts             # Runtime type validation
└── mock-data/
    └── creative.ts            # Mock data for creative workspace
```

**Key Utilities:**

1. **`cn()` - Class Name Utility**
```typescript
import { cn } from "@/lib/utils"

// Merge Tailwind classes with conditions
<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)} />
```

2. **Icon Mappings**
```typescript
import { getDesignTypeIcon } from "@/lib/design-icons"

const Icon = getDesignTypeIcon("BarChart3") // Returns Lucide icon
```

3. **Format Utilities**
```typescript
import { formatDateShort, formatFileSize, getInitials } from "@/lib/format-utils"

formatDateShort(new Date()) // "Dec 6"
formatFileSize(2400000) // "2.3 MB"
getInitials("John Doe") // "JD"
```

4. **Export Utilities**
```typescript
import { downloadCSV, downloadJSON } from "@/lib/export-utils"

downloadCSV(data, "filename")
downloadJSON(data, "filename")
```

---

### `/src/types` - TypeScript Types

```
types/
├── index.ts                   # Core types (Project, Asset, etc.)
└── creative.ts                # Creative workspace types
```

**Type Organization:**
- **Interfaces** for object shapes
- **Type aliases** for unions and primitives
- **Enums** avoided (use const objects instead)
- **Exported** from barrel files

Example:
```typescript
// Core types
export interface Project {
  id: string
  name: string
  status: ProjectStatus
  // ...
}

export type ProjectStatus = "Active" | "Review" | "Draft" | "Approved"

// Constants for validation
export const PROJECT_STATUSES = ["Active", "Review", "Draft", "Approved"] as const
```

---

## 🎨 Design Patterns

### 1. Container Component Pattern

**PageContainer** - Consistent max-width layout
```typescript
// Use for standard pages with max-width constraint
<PageContainer className="space-y-6">
  <h1>Page Title</h1>
  {/* Page content */}
</PageContainer>

// Exception: Kanban board uses full width, doesn't use PageContainer
```

### 2. Compound Components

**Tabs Example:**
```typescript
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### 3. Render Props Pattern

**Used in Context providers:**
```typescript
<DataProvider>
  {children}
</DataProvider>
```

### 4. Custom Hooks

**Example: useAsync**
```typescript
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(() => {
    setStatus('pending')
    setValue(null)
    setError(null)

    return asyncFunction()
      .then((response) => {
        setValue(response)
        setStatus('success')
      })
      .catch((error) => {
        setError(error)
        setStatus('error')
      })
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, value, error }
}
```

---

## 🔄 Data Flow

### CRUD Operations Flow

```
User Action (Button Click)
       ↓
 Dialog Component
       ↓
 Form Submission
       ↓
Context Method (e.g., createProject)
       ↓
[Future: API Call]
       ↓
State Update
       ↓
Re-render Components
       ↓
Toast Notification
```

### Notification Flow

```
User Action / System Event
       ↓
Add Notification (Context)
       ↓
Notification State Update
       ↓
Badge Count Update
       ↓
Notification Center Re-renders
       ↓
User Clicks Notification
       ↓
Mark as Read / Navigate
```

---

## 🎯 Best Practices

### Component Design

1. **Single Responsibility** - Each component does one thing well
2. **Composition over Inheritance** - Build complex UIs from simple components
3. **Props over State** - Prefer controlled components
4. **TypeScript First** - Type everything, use strict mode

### File Organization

1. **Co-locate related files** - Keep tests, styles near components
2. **Barrel exports** - Use index.ts for cleaner imports
3. **Consistent naming** - PascalCase for components, camelCase for utilities

### Performance

1. **Use `useCallback`** for functions passed to child components
2. **Use `useMemo`** for expensive computations
3. **Lazy load** heavy components with `React.lazy`
4. **Optimize images** with Next.js Image component

### Styling

1. **Tailwind First** - Use utility classes
2. **Consistent spacing** - Use Tailwind spacing scale
3. **Responsive by default** - Mobile-first approach
4. **Dark mode support** - Use theme variables

### State Management

1. **Local state first** - Use useState for component-specific state
2. **Context for global** - Use Context for app-wide state
3. **Avoid prop drilling** - Use Context or composition
4. **Optimistic updates** - Update UI immediately, sync with API

---

## 🔌 Integration Points

### API Integration (Future)

Replace Context methods with API calls:

```typescript
// Current (Mock)
const createProject = async (data: Partial<Project>) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const newProject = { id: generateId(), ...data }
  setProjects(prev => [...prev, newProject])
  return newProject
}

// Future (API)
const createProject = async (data: Partial<Project>) => {
  try {
    const response = await api.projects.create(data)
    setProjects(prev => [...prev, response.project])
    return response.project
  } catch (error) {
    handleAPIError(error)
    throw error
  }
}
```

### Authentication (Future)

Add authentication provider:

```typescript
// app/layout.tsx
<AuthProvider>
  <ThemeProvider>
    <DataProvider>
      {children}
    </DataProvider>
  </ThemeProvider>
</AuthProvider>

// Protect routes
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect('/login')
  }
}
```

---

## 📚 Code Examples

### Creating a New Page

```typescript
// 1. Create page file
// src/app/(dashboard)/my-page/page.tsx
"use client"

import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"

export default function MyPage() {
  return (
    <PageContainer className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">My Page</h1>
        <p className="text-muted-foreground">Page description</p>
      </div>
      
      {/* Page content */}
    </PageContainer>
  )
}

// 2. Add to sidebar
// src/components/layout/Sidebar.tsx
const routes = [
  // ... existing routes
  {
    title: "My Page",
    href: "/my-page",
    icon: MyIcon,
  },
]
```

### Creating a New Component

```typescript
// src/components/cr/my-component.tsx
"use client"

import { cn } from "@/lib/utils"

interface MyComponentProps {
  title: string
  description?: string
  className?: string
}

export function MyComponent({ 
  title, 
  description, 
  className 
}: MyComponentProps) {
  return (
    <div className={cn("p-4 rounded-lg border", className)}>
      <h3 className="font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

// Export from index
// src/components/cr/index.ts
export { MyComponent } from "./my-component"
```

### Adding a New Context Method

```typescript
// src/contexts/data-context.tsx
export function DataProvider({ children }: { children: React.ReactNode }) {
  // ... existing state

  const myNewMethod = async (param: string) => {
    try {
      // [Future: API call]
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update state
      setProjects(prev => {
        // ... state logic
        return updatedProjects
      })
      
      // Show success notification
      toast.success("Operation completed")
      
      return result
    } catch (error) {
      toast.error("Operation failed")
      throw error
    }
  }

  return (
    <DataContext.Provider value={{ 
      /* ... existing values */
      myNewMethod 
    }}>
      {children}
    </DataContext.Provider>
  )
}
```

---

## 🧪 Testing Patterns

### Component Testing

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './my-component'

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
  
  it('renders description when provided', () => {
    render(<MyComponent title="Test" description="Description" />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
```

### Context Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { DataProvider, useData } from './data-context'

describe('useData', () => {
  it('creates project', async () => {
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    await act(async () => {
      await result.current.createProject({ name: 'Test Project' })
    })
    
    expect(result.current.projects).toHaveLength(1)
  })
})
```

---

## 🚀 Deployment Considerations

### Build Optimization

- ✅ **Tree-shaking** - Unused code removed
- ✅ **Code splitting** - Components lazy loaded
- ✅ **Image optimization** - Next.js Image component
- ✅ **Font optimization** - next/font

### Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=https://api.example.com

# Optional
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Performance Monitoring

Add performance monitoring in production:
- Web Vitals tracking
- Error monitoring (Sentry)
- Analytics (Google Analytics, Vercel Analytics)

---

## 📖 Additional Resources

### Internal Documentation
- `README.md` - Project overview
- `DEVELOPER_HANDOFF.md` - Integration guide
- `API_INTEGRATION.md` - API specifications
- `TESTING.md` - Testing guide

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

**Last Updated:** December 2024  
**Version:** 2.0

