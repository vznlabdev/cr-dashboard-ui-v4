# Creation Rights Dashboard

> **AI Content Provenance & Governance Platform**

A modern, professional dashboard for managing AI-generated content with full provenance tracking, legal compliance, and risk assessment.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8) ![Build](https://img.shields.io/badge/build-passing-success)

---

## Features

### Complete CRUD Operations
- Create, edit, and delete projects
- Add and manage AI-generated assets
- Real-time updates across all pages
- Form validation with error handling

### Advanced Data Management
- Sortable tables with visual indicators
- Advanced search & filtering
- Bulk selection and operations
- Bulk approve/delete projects
- CSV/JSON export functionality

### Notification System
- Real-time notification center
- Unread badge with count
- Mark as read/unread
- Action links in notifications
- 4 notification types (info, success, warning, error)

### Professional UI/UX
- Dark/Light mode with smooth transitions
- Responsive design (mobile, tablet, desktop)
- Loading states & skeletons
- Empty states with helpful messaging
- Toast notifications for all actions
- 404 error pages

### Dashboard Pages
- **Home** - Overview with metrics, charts, and quick actions
- **Projects** - Full CRUD with bulk operations
- **Project Detail** - Assets, workflow, audit trail, AI metadata
- **Asset Detail** - Lineage, rights, compliance tracking
- **Legal Review** - Compliance percentages, issue tracking, approvals
- **Insurance Risk** - Risk assessment, coverage analysis
- **Integrations** - AI tool connections (Midjourney, ChatGPT, etc.)
- **Settings** - Policies, team management, configurations, integration settings (6 tabs)
- **Analytics** - Coming soon page

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Radix UI) |
| **Icons** | Lucide React |
| **Theme** | next-themes |
| **Notifications** | Sonner (toast) |
| **Charts** | Recharts |
| **State** | React Context API |

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd cr-dashboard-ui

# Install dependencies
npm install

# Set up environment (see ENV_SETUP.md)
# Create .env.local with your API URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests (after installing test dependencies)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Note:** Testing dependencies not included by default. See `TESTING_SETUP.md` for installation.

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Dashboard routes (with layout)
│   │   ├── page.tsx          # Home dashboard
│   │   ├── projects/         # Project management
│   │   ├── legal/            # Legal review
│   │   ├── insurance/        # Risk assessment
│   │   ├── integrations/     # AI tool connections
│   │   ├── settings/         # Configuration
│   │   ├── analytics/        # Coming soon
│   │   └── layout.tsx        # Dashboard layout + providers
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + theme
│   └── not-found.tsx         # 404 pages
├── components/
│   ├── cr/                   # Creation Rights components
│   │   ├── new-project-dialog.tsx
│   │   ├── edit-project-dialog.tsx
│   │   ├── delete-project-dialog.tsx
│   │   ├── add-asset-dialog.tsx
│   │   ├── invite-member-dialog.tsx
│   │   ├── notification-center.tsx
│   │   └── ... (15+ components)
│   ├── layout/               # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── ui/                   # shadcn/ui primitives
├── contexts/
│   ├── data-context.tsx      # CRUD state management
│   └── notification-context.tsx  # Notification state
└── lib/
    ├── export-utils.ts       # CSV/JSON export
    └── utils.ts              # Utility functions
```

---

## Key Features Deep Dive

### **1. Full CRUD for Projects**

```typescript
// Using the Data Context
import { useData } from '@/contexts/data-context';

const { createProject, updateProject, deleteProject } = useData();

// Create
const newProject = await createProject({
  name: "Project Name",
  description: "Description",
  owner: "Owner Name",
  status: "Draft",
  risk: "Low"
});

// Update
await updateProject(projectId, { status: "Approved" });

// Delete
await deleteProject(projectId);
```

### **2. Notification System**

```typescript
// Using the Notification Context
import { useNotifications } from '@/contexts/notification-context';

const { addNotification, markAsRead } = useNotifications();

// Add notification
addNotification({
  title: "Project Approved",
  message: "Your project is ready",
  type: "success",
  action: { label: "View", href: "/projects/1" }
});
```

### **3. Bulk Operations**

- Select multiple projects with checkboxes
- Bulk approve changes status to "Approved"
- Bulk delete removes all selected
- Dynamic action toolbar
- Clear selection button

### **4. Export Data**

- **CSV:** Projects list, Legal issues
- **JSON:** Risk reports, Raw data
- Respects current filters/sorting
- Auto-generated filenames with timestamps

---

## Backend Integration

**Status:** Ready for API integration  
**Current:** In-memory state management  
**Next Steps:** See `DEVELOPER_HANDOFF.md` and `API_INTEGRATION.md`

### Integration Points:

1. **Data Context** (`src/contexts/data-context.tsx`)
   - Replace simulated delays with API calls
   - Add error handling
   - Implement optimistic updates

2. **Notification Context** (`src/contexts/notification-context.tsx`)
   - Connect to WebSocket or polling
   - Persist to backend

3. **Authentication**
   - Add auth provider to layout
   - Protect routes
   - User session management

See detailed integration guide in `DEVELOPER_HANDOFF.md`

---

## Component Library

All UI components built with **shadcn/ui** and available in `src/components/ui/`

### **Custom Components:**

| Component | Purpose |
|-----------|---------|
| `NewProjectDialog` | Create project modal |
| `EditProjectDialog` | Edit project modal |
| `DeleteProjectDialog` | Delete confirmation |
| `AddAssetDialog` | Add asset form |
| `InviteMemberDialog` | Team invitation |
| `NotificationCenter` | Notification dropdown |
| `ComplianceScoreGauge` | Compliance visualization |
| `RiskIndexBadge` | Risk level display |
| `EmptyState` | No data placeholder |
| `ComingSoon` | Feature placeholder |
| `TableSkeleton` | Loading state |

---

## Theming

### Color Customization

Edit `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.65 0.19 166);  /* Supabase green */
  --background: oklch(0.07 0 0);    /* Dark background */
  /* ... customize as needed */
}
```

### Dark/Light Mode
- Fully supported across all pages
- Toggle in header
- System preference detection
- Smooth transitions

---

## Data Types

All TypeScript interfaces defined in `src/contexts/data-context.tsx`:

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Review" | "Draft" | "Approved";
  assets: number;
  compliance: number;
  risk: "Low" | "Medium" | "High";
  updated: string;
  createdDate: string;
  owner: string;
}

interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: "Image" | "Video" | "Audio" | "Text" | "AR/VR";
  aiMethod: "AI Augmented" | "AI Generative" | "Multimodal";
  status: "Draft" | "Review" | "Approved" | "Rejected";
  risk: "Low" | "Medium" | "High";
  compliance: number;
  updated: string;
  createdDate: string;
  creator: string;
}
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

### Environment Variables

Set all variables from `ENV_SETUP.md` in your hosting platform.

---

## Documentation Files

**Main Guides:**
- `DEVELOPER_HANDOFF.md` - **START HERE** - Complete integration guide
- `README.md` - This file - Project overview
- `FINAL_HANDOFF_SUMMARY.md` - Complete handoff summary

**Integration:**
- `API_INTEGRATION.md` - API endpoint specifications
- `API_INTEGRATION_WALKTHROUGH.md` - Step-by-step integration
- `ENV_SETUP.md` - Environment variables guide

**Development:**
- `DEVELOPER_SETUP.md` - Developer onboarding
- `CONTRIBUTING.md` - Contribution guidelines
- `QUICK_REFERENCE.md` - Quick commands

**Testing:**
- `TESTING.md` - Complete testing guide
- `TESTING_SETUP.md` - Quick testing setup
- `HUSKY_SETUP.md` - Git hooks setup

**Deployment:**
- `DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre/post deployment checklist

---

## Development Workflow

### Adding a New Page:

1. Create page component in `src/app/(dashboard)/new-page/page.tsx`
2. Add route to sidebar in `src/components/layout/Sidebar.tsx`
3. Use Context hooks for data
4. Follow existing patterns

### Adding a New Component:

```bash
# Add shadcn component
npx shadcn@latest add <component-name>

# Import and use
import { ComponentName } from "@/components/ui/component-name"
```

---

## Quality Checklist

- [x] All pages responsive (mobile, tablet, desktop)
- [x] Dark/Light mode fully functional
- [x] Forms with validation
- [x] Error states handled
- [x] Loading states implemented
- [x] Toast notifications everywhere
- [x] Keyboard navigation supported
- [x] TypeScript strict mode
- [x] Zero build errors
- [x] Zero linting errors

---

## Known Limitations

### By Design (Awaiting Backend):
1. **No data persistence** - All data in-memory (resets on refresh)
2. **No authentication** - Open dashboard
3. **No file uploads** - UI only, no storage
4. **Mock notifications** - Static initial data
5. **Client-side export** - Should use API for large datasets

### To Be Implemented:
- Real-time WebSocket updates
- Advanced search (Cmd+K)
- User preferences persistence
- Audit logging
- Role-based permissions

---

## Support & Next Steps

### For Developers:

1. **Read First:** `DEVELOPER_HANDOFF.md`
2. **API Specs:** `API_INTEGRATION.md`
3. **Environment:** `ENV_SETUP.md`
4. **Start Coding:** Replace Context methods with API calls

### Questions?

Check inline comments in:
- `src/contexts/data-context.tsx` - CRUD operations
- `src/contexts/notification-context.tsx` - Notifications
- Component files for usage examples

---

## What's Production-Ready

- Complete UI - All pages built and interactive  
- State Management - Context API ready for API integration  
- CRUD Operations - Create, Read, Update, Delete working  
- Bulk Actions - Multi-select and batch operations  
- Notifications - Full notification center  
- Export - CSV/JSON downloads  
- Forms - All dialogs with validation  
- Responsive - Mobile, tablet, desktop  
- Accessible - ARIA labels, keyboard navigation  
- Type-Safe - Full TypeScript coverage  

**Ready for backend integration and deployment!**

---

## License

Copyright (c) 2024 Creation Rights. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

---

## Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Built for the Creation Rights team**
