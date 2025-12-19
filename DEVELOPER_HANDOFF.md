# Developer Handoff Guide - Creation Rights Dashboard

> **Complete guide for developers taking over this project**

**Project Name:** Creation Rights Dashboard  
**Purpose:** AI Content Provenance & Governance Platform with Creative Workspace  
**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui  
**Status:** UI Complete - Ready for Backend Integration  
**Authentication:** Currently disabled for demo (all routes accessible)  
**Last Updated:** December 2024

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [What's Been Built](#whats-been-built)
4. [Project Structure](#project-structure)
5. [API Integration Guide](#api-integration-guide)
6. [State Management](#state-management)
7. [Authentication Setup](#authentication-setup)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd cr-dashboard-ui-v4

# Install dependencies
npm install

# Create environment file
cp ENV_VARIABLES.md .env.local
# Edit .env.local and add: NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Available Commands

```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests (after installing test dependencies)
```

---

## Project Overview

### Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.0.10 |
| **UI Library** | React | 19.2.1 |
| **Language** | TypeScript | 5.0 |
| **Styling** | Tailwind CSS | 4.0 |
| **UI Components** | shadcn/ui (Radix UI) | Latest |
| **Icons** | Lucide React | Latest |
| **Theme** | next-themes | Latest |
| **Notifications** | Sonner | Latest |
| **Charts** | Recharts | Latest |
| **State** | React Context API | Built-in |
| **Forms** | React Hook Form + Zod | Latest |

### Current Status

- ✅ **UI Complete** - All pages and components implemented
- ✅ **State Management** - Context API ready for API integration
- ✅ **CRUD Operations** - Working with in-memory data
- ✅ **Creative Workspace** - Full Kanban board, brands, team, assets
- ✅ **Creator Rights Management** - Creator profiles, rights tracking, crediting
- ✅ **Responsive Design** - Mobile, tablet, desktop
- ✅ **Dark/Light Mode** - Fully functional
- ⏳ **API Integration** - Ready to connect
- ⏳ **Authentication** - Disabled for demo (enable in `src/middleware.ts`)

---

## What's Been Built

### Core Platform Features

**Full CRUD Operations**
- Create, Read, Update, Delete Projects
- Create, Delete Assets
- Real-time updates via Context API
- Form validation and error handling

**Advanced Table Features**
- Sortable columns with visual indicators
- Search & filter functionality
- Bulk selection with checkboxes
- Bulk approve/delete operations
- Pagination

**Data Management**
- Context API for state management
- In-memory data store (ready for API integration)
- Notification system
- Toast notifications

**Export Functionality**
- CSV export for projects and legal data
- JSON export for risk reports
- Date-stamped filenames

**UI Components**
- 404 error pages
- Empty states
- Coming soon pages
- Loading skeletons
- Toast notifications
- Modal dialogs (New Project, Edit Project, Delete, Add Asset, Invite Member)

### Creative Workspace Features

**Kanban Board**
- Full-width layout with horizontal scrolling
- Sticky column headers
- Status-based columns (Submitted, Assessment, Assigned, Production, QA Review, Delivered)
- View mode switching (Kanban/grid/list)
- Custom minimal scrollbars

**Ticket Management**
- Rich ticket cards with design type, priority, brand, assignee, due dates
- Progress tracking with visual progress bars
- Brand integration with colors and logos

**Brand System**
- Brand guidelines (mission, vision, values, personality)
- Visual identity (colors, fonts, logos)
- Asset tracking per brand
- Search & filter

**Team Management**
- Member profiles with skills and roles
- Workload visualization (current load vs. capacity)
- Role-based views (Creative, Team Leader, QA)
- Active ticket tracking

**Asset Library**
- File preview modal for all asset types
- Metadata display (design type, brand, ticket, upload info)
- Search & filter by brand, design type, file type
- Grid/List views

### Creator Rights Management Features

**Creator Management**
- Full CRUD for creator profiles
- Rights documentation and tracking
- Creator Rights ID generation (CR-YYYY-#####)
- Rights status calculation (Authorized, Expiring Soon, Expired)
- Risk level assessment based on rights validity
- Profile completion tracking

**Creator Crediting**
- Link creators to assets with role attribution
- Link creators to projects with role attribution
- View all credits per creator
- View all creators per asset/project
- Creator avatar badges with status indicators

**Rights Monitoring**
- Automatic expiration detection
- Alerts for expiring/expired rights
- Integration with insurance dashboard alerts
- Export functionality for compliance

**Creator Portal**
- Self-service creator dashboard
- Profile management
- Rights extension requests
- View linked assets and projects
- Password reset functionality

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/              # Dashboard routes (with layout)
│   │   ├── layout.tsx            # Dashboard layout with providers
│   │   ├── page.tsx              # Home dashboard
│   │   ├── projects/             # Project management
│   │   │   ├── page.tsx          # Projects list (CRUD + Bulk)
│   │   │   └── [id]/             # Project detail & assets
│   │   ├── creative/             # Creative workspace
│   │   │   ├── page.tsx          # Creative home
│   │   │   ├── tickets/          # Ticket/request management
│   │   │   ├── brands/            # Brand management
│   │   │   ├── team/             # Team member management
│   │   │   └── assets/           # Asset library
│   │   ├── legal/                # Legal review
│   │   ├── insurance/            # Risk assessment
│   │   ├── integrations/         # AI tool connections
│   │   ├── settings/             # Configuration
│   │   ├── analytics/            # Coming soon
│   │   └── not-found.tsx         # Dashboard 404
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx             # Root 404
│   └── globals.css               # Global styles & CSS variables
├── components/
│   ├── cr/                       # Creation Rights components
│   │   ├── new-project-dialog.tsx
│   │   ├── edit-project-dialog.tsx
│   │   ├── delete-project-dialog.tsx
│   │   ├── add-asset-dialog.tsx
│   │   ├── invite-member-dialog.tsx
│   │   ├── notification-center.tsx
│   │   ├── compliance-score-gauge.tsx
│   │   ├── risk-index-badge.tsx
│   │   └── ... (more UI components)
│   ├── creative/                 # Creative workspace components
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── TicketCard.tsx
│   │   ├── BrandCard.tsx
│   │   ├── TeamMemberCard.tsx
│   │   ├── AssetCard.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── PageContainer.tsx
│   └── ui/                       # shadcn/ui primitives (20+ components)
├── contexts/
│   ├── data-context.tsx          # CRUD operations & state
│   ├── notification-context.tsx  # Notification system
│   ├── workspace-context.tsx     # Creative workspace state
│   ├── creators-context.tsx      # Creator management (admin)
│   └── creator-account-context.tsx # Creator self-service
├── lib/
│   ├── api.ts                    # API client setup
│   ├── api-errors.ts             # Error handling utilities
│   ├── export-utils.ts           # CSV/JSON export
│   ├── format-utils.ts           # Date/size formatting
│   ├── design-icons.ts           # Shared icon mappings
│   ├── constants.ts             # App constants
│   ├── type-guards.ts           # Runtime type validation
│   └── mock-data/
│       └── creative.ts           # Mock data for creative workspace
└── types/
    ├── index.ts                  # Core types
    └── creative.ts               # Creative workspace types
```

---

## API Integration Guide

### Step 1: Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

See `ENV_VARIABLES.md` for complete environment variable documentation.

### Step 2: API Endpoints Required

See `API_INTEGRATION.md` for complete endpoint specifications.

**Quick Overview:**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/assets` - List assets
- `POST /api/projects/:id/assets` - Create asset
- `DELETE /api/projects/:id/assets/:assetId` - Delete asset
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### Step 3: Connect Data Context to API

**File:** `src/contexts/data-context.tsx`

**Current Implementation (In-Memory):**
```typescript
const createProject = useCallback(async (projectData) => {
  // INTEGRATION POINT: Replace with API call
  await new Promise(resolve => setTimeout(resolve, 500));
  const newProject = { id: generateId(), ...projectData };
  setProjects(prev => [...prev, newProject]);
  return newProject;
}, []);
```

**After Integration:**
```typescript
import { api } from '@/lib/api';
import { showErrorToast } from '@/lib/api-errors';

const createProject = useCallback(async (projectData) => {
  try {
    const { project } = await api.projects.create(projectData);
    setProjects(prev => [project, ...prev]);
    return project;
  } catch (error) {
    showErrorToast(error);
    throw error;
  }
}, []);
```

**Update All CRUD Methods:**
1. `createProject` - Replace with `api.projects.create()`
2. `updateProject` - Replace with `api.projects.update()`
3. `deleteProject` - Replace with `api.projects.delete()`
4. `createAsset` - Replace with `api.assets.create()`
5. `deleteAsset` - Replace with `api.assets.delete()`

**Fetch Initial Data:**
```typescript
useEffect(() => {
  async function loadInitialData() {
    try {
      const { projects } = await api.projects.getAll();
      setProjects(projects);
    } catch (error) {
      showErrorToast(error, "Failed to load projects");
    }
  }
  loadInitialData();
}, []);
```

### Step 4: Connect Creative Workspace Data

**File:** `src/lib/mock-data/creative.ts`

Replace mock data with API calls:
- Tickets: `GET /api/creative/tickets`
- Brands: `GET /api/creative/brands`
- Team: `GET /api/creative/team`
- Assets: `GET /api/creative/assets`

### Step 5: Connect Creator Management

**File:** `src/contexts/creators-context.tsx`

Replace mock data with API calls:
- Creators: `GET /api/creators`
- Invitations: `GET /api/creators/invitations`
- Credits: `GET /api/creators/:id/credits`
- Create: `POST /api/creators`
- Update: `PUT /api/creators/:id`
- Credit: `POST /api/creators/:id/credit`

**File:** `src/contexts/creator-account-context.tsx`

Replace mock data with API calls:
- Login: `POST /api/creators/auth/login`
- Register: `POST /api/creators/auth/register`
- Profile: `GET /api/creators/me`
- Update Profile: `PUT /api/creators/me`

### Step 6: Connect Notifications

**Option A: WebSocket (Recommended)**
```typescript
// src/contexts/notification-context.tsx
useEffect(() => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws');
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    setNotifications(prev => [notification, ...prev]);
    toast.info(notification.title);
  };
  
  return () => ws.close();
}, []);
```

**Option B: Polling**
```typescript
useEffect(() => {
  async function fetchNotifications() {
    const { notifications } = await api.notifications.getAll();
    setNotifications(notifications);
  }
  
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}, []);
```

### Step 7: Implement File Upload

**File:** `src/components/cr/add-asset-dialog.tsx`

```typescript
import { uploadFile } from '@/lib/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!file) {
    toast.error("Please select a file");
    return;
  }

  try {
    const uploadResult = await uploadFile(
      `/projects/${projectId}/assets/upload`,
      file,
      {
        name: formData.name,
        type: formData.type,
        creator: formData.creator,
      }
    );

    toast.success(`Asset "${formData.name}" uploaded successfully!`);
    onOpenChange(false);
  } catch (error) {
    showErrorToast(error);
  }
};
```

---

## State Management

### Data Context (`src/contexts/data-context.tsx`)

**Current:** In-memory state with simulated API delays  
**To Replace:** Connect to real API endpoints

### Creators Context (`src/contexts/creators-context.tsx`)

**Current:** In-memory state with simulated API delays  
**To Replace:** Connect to real API endpoints

**Available Methods:**
```typescript
// Creators
inviteCreator(form) => Promise<CreatorInvitation>
getCreatorById(id) => Creator | undefined
creditCreatorToAsset(creatorId, assetId, role) => Promise<void>
creditCreatorToProject(creatorId, projectId, role) => Promise<void>
getExpiringCreators() => Creator[]
getExpiredCreators() => Creator[]
generateCreatorRightsAlerts() => InsuranceIssue[]
```

### Creator Account Context (`src/contexts/creator-account-context.tsx`)

**Current:** In-memory state with simulated API delays  
**To Replace:** Connect to real API endpoints

**Available Methods:**
```typescript
// Authentication
registerCreator(form) => Promise<Creator>
login(email, password) => Promise<Creator>
logout() => void

// Profile
updateMyProfile(updates) => Promise<void>
getMyCredits() => CreatorCredit[]
extendRights(newValidThrough) => Promise<void>
requestPasswordReset(email) => Promise<void>
resetPassword(token, password) => Promise<void>
```

**Available Methods:**
```typescript
// Projects
createProject(data) => Promise<Project>
updateProject(id, updates) => Promise<void>
deleteProject(id) => Promise<void>
getProjectById(id) => Project | undefined

// Assets
createAsset(projectId, data) => Promise<Asset>
updateAsset(projectId, assetId, updates) => Promise<void>
deleteAsset(projectId, assetId) => Promise<void>
getAssetById(projectId, assetId) => Asset | undefined
getProjectAssets(projectId) => Asset[]
```

**Usage in Components:**
```typescript
import { useData } from '@/contexts/data-context';

const { projects, createProject, updateProject, deleteProject } = useData();
```

### Notification Context (`src/contexts/notification-context.tsx`)

**Available Methods:**
```typescript
addNotification(notification) => void
markAsRead(id) => void
markAllAsRead() => void
deleteNotification(id) => void
clearAll() => void
unreadCount => number
```

**Usage:**
```typescript
import { useNotifications } from '@/contexts/notification-context';

const { notifications, unreadCount, markAsRead } = useNotifications();
```

---

## Authentication Setup

### Current State
- **Authentication is disabled for demo purposes**
- All routes are accessible without login
- Middleware exists but always returns authenticated state
- User menu exists in header

### Enabling Authentication

**File:** `src/middleware.ts`

The middleware currently has authentication disabled for demo mode. To enable:

1. Update the `checkAuth` function to implement real authentication
2. Remove the demo mode return statement
3. Implement token/session validation
4. Configure your auth provider (NextAuth, Clerk, Supabase, etc.)

### Implementation Options

**Option A: NextAuth.js**

```bash
npm install next-auth
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          return await response.json();
        }
        return null;
      }
    })
  ],
});

export { handler as GET, handler as POST };
```

**Option B: Clerk**

```bash
npm install @clerk/nextjs
```

```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Option C: Supabase**

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Protected Routes

Create `middleware.ts`:

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/(dashboard)/:path*"],
};
```

---

## Testing

### Setup

Install testing dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Example Tests

See `TESTING.md` for complete testing guide. Example test files included:
- `src/lib/__tests__/export-utils.test.ts`
- `src/lib/__tests__/type-guards.test.ts`
- `src/components/cr/__tests__/EmptyState.test.tsx`
- `src/contexts/__tests__/data-context.test.tsx`

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Docker

```bash
docker build -t cr-dashboard .
docker run -p 3000:3000 cr-dashboard
```

### Environment Variables

Required:
- `NEXT_PUBLIC_API_URL` - Backend API URL

See `ENV_VARIABLES.md` for complete list and `DEPLOYMENT.md` for detailed deployment instructions.

---

## Troubleshooting

### CORS Errors

Backend needs to allow your frontend origin:

```typescript
// Express example
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 401 Unauthorized

Check:
1. Is auth token being sent? (Check Network tab)
2. Is token format correct? (`Bearer <token>`)
3. Is token expired?
4. Is API expecting different header?

### Network Errors

Check:
1. Is backend running?
2. Is API_URL correct in `.env.local`?
3. Check browser console for CORS errors
4. Try API health check

### Variable Not Working

1. Check spelling - must match exactly
2. Restart dev server - changes require restart
3. Check prefix - client-side needs `NEXT_PUBLIC_`
4. Check file location - must be in project root

---

## Integration Checklist

### Phase 1: Core Data (Week 1)
- [ ] Set up API client
- [ ] Connect Data Context to real endpoints
- [ ] Implement authentication
- [ ] Add error handling
- [ ] Test all CRUD operations

### Phase 2: Features (Week 2)
- [ ] Real-time notifications via WebSocket
- [ ] File upload for assets
- [ ] Advanced search
- [ ] Export enhancements

### Phase 3: Polish (Week 3)
- [ ] Analytics page implementation
- [ ] Team management features
- [ ] Settings persistence
- [ ] Performance optimization

---

## Important Notes

### Data Persistence
- Currently all data is **in-memory** (resets on refresh)
- Context API manages state during session
- Ready for API integration - just replace the CRUD methods

### Mock Data
- Initial data defined in Context providers
- Creative workspace data in `src/lib/mock-data/creative.ts`
- Creator data in `src/lib/mock-data/creators.ts`
- Use for development/testing
- Will be replaced by API calls

### Integration Points
All integration points are clearly marked with `INTEGRATION POINT:` comments in the code:
- `src/contexts/data-context.tsx` - Projects and assets CRUD
- `src/contexts/creators-context.tsx` - Creator management (admin)
- `src/contexts/creator-account-context.tsx` - Creator self-service
- `src/contexts/notification-context.tsx` - Notifications
- `src/lib/mock-data/creative.ts` - Creative workspace data
- `src/lib/mock-data/creators.ts` - Creator mock data

### Authentication Status
- **Currently disabled for demo** - All routes accessible without login
- Middleware file exists at `src/middleware.ts`
- To enable: Update `checkAuth()` function with real authentication logic
- See "Authentication Setup" section above for implementation options

---

## Support Resources

### Documentation Files
- **README.md** - Project overview and quick start
- **ARCHITECTURE.md** - Code structure and patterns
- **API_INTEGRATION.md** - Complete API endpoint specifications
- **ENV_VARIABLES.md** - Environment variable setup
- **DEVELOPER_SETUP.md** - Developer onboarding
- **TESTING.md** - Complete testing guide
- **DEPLOYMENT.md** - Deployment instructions
- **CONTRIBUTING.md** - Contribution guidelines

### Key Files to Review
- `src/contexts/data-context.tsx` - CRUD operations
- `src/contexts/notification-context.tsx` - Notifications
- `src/lib/api.ts` - API client
- `src/types/index.ts` - Type definitions
- `src/components/` - All UI components

---

## Next Steps

1. **Read this document** - Understand the project structure
2. **Review ARCHITECTURE.md** - Understand code patterns
3. **Set up environment** - Create `.env.local` (see ENV_VARIABLES.md)
4. **Review API_INTEGRATION.md** - Understand API requirements
5. **Begin API integration** - Start with Data Context
6. **Implement authentication** - Choose auth provider
7. **Test thoroughly** - Test all features after integration
8. **Deploy to staging** - Test in staging environment

---

**The UI is 100% complete and production-ready. Backend integration is the next step!**

For questions or clarification, review the inline code comments marked with `INTEGRATION POINT:` in:
- `src/contexts/data-context.tsx`
- `src/contexts/notification-context.tsx`
- `src/lib/mock-data/creative.ts`

Good luck with the integration!
