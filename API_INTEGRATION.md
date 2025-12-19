# API Integration Guide - Creation Rights Dashboard

## API Endpoints Required

This document outlines all API endpoints needed to integrate the frontend with your backend.

---

## Base Configuration

**Base URL:** `process.env.NEXT_PUBLIC_API_URL`  
**Authentication:** Bearer token in headers  
**Format:** JSON  

**Example Headers:**
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

---

## 1. Projects API

### **GET /api/projects**
Get list of all projects

**Response:**
```typescript
{
  projects: [
    {
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
  ]
}
```

---

### **GET /api/projects/:id**
Get single project by ID

**Response:**
```typescript
{
  project: {
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
}
```

---

### **POST /api/projects**
Create new project

**Request Body:**
```typescript
{
  name: string;              // required
  description: string;       // optional
  owner: string;            // required
  status: "Draft" | "Active" | "Review" | "Approved";
  risk: "Low" | "Medium" | "High";
}
```

**Response:**
```typescript
{
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    assets: 0;
    compliance: 0;
    risk: string;
    updated: string;
    createdDate: string;
    owner: string;
  }
}
```

---

### **PUT /api/projects/:id**
Update existing project

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  status?: "Draft" | "Active" | "Review" | "Approved";
  risk?: "Low" | "Medium" | "High";
  owner?: string;
}
```

**Response:**
```typescript
{
  project: { /* updated project */ }
}
```

---

### **DELETE /api/projects/:id**
Delete project and all associated assets

**Response:**
```typescript
{
  success: true,
  message: "Project deleted successfully"
}
```

**Note:** Should cascade delete all assets

---

### **PATCH /api/projects/bulk-approve**
Bulk approve multiple projects

**Request Body:**
```typescript
{
  projectIds: string[];
}
```

**Response:**
```typescript
{
  updated: number,
  projects: Project[]
}
```

---

### **DELETE /api/projects/bulk-delete**
Bulk delete multiple projects

**Request Body:**
```typescript
{
  projectIds: string[];
}
```

**Response:**
```typescript
{
  deleted: number,
  success: true
}
```

---

## 2. Assets API

### **GET /api/projects/:projectId/assets**
Get all assets for a project

**Response:**
```typescript
{
  assets: [
    {
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
  ]
}
```

---

### **GET /api/projects/:projectId/assets/:assetId**
Get single asset

**Response:**
```typescript
{
  asset: { /* asset object */ }
}
```

---

### **POST /api/projects/:projectId/assets**
Create new asset

**Request Body:**
```typescript
{
  name: string;              // required
  type: "Image" | "Video" | "Audio" | "Text" | "AR/VR";
  aiMethod: "AI Augmented" | "AI Generative" | "Multimodal";
  creator: string;           // required
  status: "Draft" | "Review" | "Approved" | "Rejected";
  risk: "Low" | "Medium" | "High";
  compliance: number;        // 0-100
}
```

**Response:**
```typescript
{
  asset: { /* created asset */ }
}
```

---

### **PUT /api/projects/:projectId/assets/:assetId**
Update asset

**Request Body:** Partial asset data

**Response:**
```typescript
{
  asset: { /* updated asset */ }
}
```

---

### **DELETE /api/projects/:projectId/assets/:assetId**
Delete asset

**Response:**
```typescript
{
  success: true,
  message: "Asset deleted successfully"
}
```

---

## 3. Creators API

### **GET /api/creators**
Get list of all creators

**Response:**
```typescript
{
  creators: [
    {
      id: string;
      fullName: string;
      email: string;
      creatorRightsId: string; // Format: CR-YYYY-#####
      creatorType: "Real Person" | "Character" | "Brand Mascot";
      rightsStatus: "Authorized" | "Expiring Soon" | "Expired";
      validFrom: string; // ISO 8601 date
      validThrough: string; // ISO 8601 date
      riskLevel: "Low" | "Medium" | "High";
      profileCompletion: number; // 0-100
      avatarUrl?: string;
      // ... other creator fields
    }
  ]
}
```

---

### **GET /api/creators/:id**
Get single creator

**Response:**
```typescript
{
  creator: { /* creator object */ }
}
```

---

### **POST /api/creators/invite**
Invite a new creator

**Request Body:**
```typescript
{
  email: string; // required
  creatorType: "Real Person" | "Character" | "Brand Mascot"; // required
  validFrom: string; // ISO 8601 date
  validThrough: string; // ISO 8601 date
}
```

**Response:**
```typescript
{
  invitation: {
    id: string;
    email: string;
    token: string;
    status: "pending" | "accepted" | "expired";
    expiresAt: string; // ISO 8601 date
  }
}
```

---

### **POST /api/creators/:id/credit**
Credit creator to asset or project

**Request Body:**
```typescript
{
  assetId?: string; // Either assetId or projectId required
  projectId?: string;
  role?: string; // e.g., "Photographer", "Designer", "Voice Actor"
}
```

**Response:**
```typescript
{
  success: true,
  credit: {
    id: string;
    creatorId: string;
    assetId?: string;
    projectId?: string;
    role?: string;
  }
}
```

---

### **DELETE /api/creators/:id/credit**
Remove credit from asset or project

**Request Body:**
```typescript
{
  assetId?: string;
  projectId?: string;
}
```

---

### **GET /api/creators/:id/credits**
Get all credits for a creator

**Response:**
```typescript
{
  credits: [
    {
      id: string;
      assetId?: string;
      projectId?: string;
      role?: string;
      createdAt: string; // ISO 8601 date
    }
  ]
}
```

---

### **GET /api/assets/:assetId/creators**
Get all creators credited to an asset

**Response:**
```typescript
{
  creators: [ /* creator objects */ ]
}
```

---

### **GET /api/projects/:projectId/creators**
Get all creators credited to a project

**Response:**
```typescript
{
  creators: [ /* creator objects */ ]
}
```

---

## 4. Creator Account API (Self-Service)

### **POST /api/creators/auth/register**
Register a new creator account

**Request Body:**
```typescript
{
  email: string;
  password: string;
  fullName: string;
  creatorType: "Real Person" | "Character" | "Brand Mascot";
  token?: string; // If registering from invitation
}
```

**Response:**
```typescript
{
  creator: { /* creator object */ },
  token: string; // Auth token
}
```

---

### **POST /api/creators/auth/login**
Login as creator

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  creator: { /* creator object */ },
  token: string; // Auth token
}
```

---

### **GET /api/creators/me**
Get current creator's profile (requires auth)

**Response:**
```typescript
{
  creator: { /* creator object */ }
}
```

---

### **PUT /api/creators/me**
Update current creator's profile

**Request Body:**
```typescript
{
  fullName?: string;
  avatarUrl?: string;
  contactInformation?: string;
  // ... other updatable fields
}
```

---

### **POST /api/creators/me/rights/extend**
Extend creator rights

**Request Body:**
```typescript
{
  newValidThrough: string; // ISO 8601 date
}
```

---

### **POST /api/creators/auth/forgot-password**
Request password reset

**Request Body:**
```typescript
{
  email: string;
}
```

---

### **POST /api/creators/auth/reset-password**
Reset password with token

**Request Body:**
```typescript
{
  token: string;
  password: string;
}
```

---

## 5. Notifications API

### **GET /api/notifications**
Get user notifications

**Response:**
```typescript
{
  notifications: [
    {
      id: string;
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
      timestamp: string; // ISO 8601
      read: boolean;
      action?: {
        label: string;
        href?: string;
      };
    }
  ]
}
```

---

### **PATCH /api/notifications/:id/read**
Mark notification as read

**Response:**
```typescript
{
  success: true
}
```

---

### **PATCH /api/notifications/mark-all-read**
Mark all notifications as read

**Response:**
```typescript
{
  updated: number
}
```

---

### **DELETE /api/notifications/:id**
Delete notification

**Response:**
```typescript
{
  success: true
}
```

---

### **DELETE /api/notifications/clear-all**
Delete all notifications

**Response:**
```typescript
{
  deleted: number
}
```

---

## 6. Legal Review API

### **GET /api/legal/issues**
Get legal issues/flags

**Response:**
```typescript
{
  issues: [
    {
      id: number;
      asset: string;
      type: string;
      severity: "Critical" | "High" | "Medium" | "Low";
      project: string;
      flagged: string;
    }
  ]
}
```

---

### **POST /api/legal/issues/:id/approve**
Approve legal issue

---

### **POST /api/legal/issues/:id/reject**
Reject legal issue

---

### **GET /api/legal/export**
Export legal package (CSV)

---

## 7. Insurance/Risk API

### **GET /api/insurance/risk-data**
Get risk assessment data

**Response:**
```typescript
{
  riskIndex: string;         // "A", "B", "C", etc.
  provenanceScore: number; // score value (0-100)
  totalAssets: number;
  compliancePercentage: number; // percentage (0-100)
  trends: Array<{day: string, score: number}>;
}
```

---

### **GET /api/insurance/export**
Export risk report (JSON)

---

## 8. Integrations API

### **GET /api/integrations**
Get AI tool integrations

**Response:**
```typescript
{
  tools: [
    {
      id: string;
      name: string;
      connected: boolean;
      apiCalls?: number;
      lastSync?: string;
    }
  ]
}
```

---

### **POST /api/integrations/:toolId/connect**
Connect AI tool

**Request Body:**
```typescript
{
  apiKey: string;
}
```

---

### **DELETE /api/integrations/:toolId/disconnect**
Disconnect AI tool

---

## 9. Settings API

### **GET /api/settings**
Get company settings

---

### **PUT /api/settings/policies**
Update policy settings

---

### **PUT /api/settings/risk-thresholds**
Update risk thresholds

---

### **POST /api/team/invite**
Invite team member

**Request Body:**
```typescript
{
  name: string;
  email: string;
  role: "Company Admin" | "Legal Reviewer" | "Insurance Analyst" | "Content Creator";
}
```

---

## 10. Export API

### **GET /api/export/projects**
Export projects as CSV

**Query Params:**
- `status` - filter by status
- `risk` - filter by risk
- `format` - csv | json

---

### **GET /api/export/legal**
Export legal issues as CSV

---

### **GET /api/export/risk-report**
Export risk report as JSON

---

## Integration Helper Functions

### Create API Client (`src/lib/api.ts`)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

---

## Migration Steps

### Step 1: Update Data Context

Replace simulated delays with real API calls:

```typescript
// Before:
await new Promise(resolve => setTimeout(resolve, 500));

// After:
const response = await apiRequest<{project: Project}>(
  '/api/projects',
  {
    method: 'POST',
    body: JSON.stringify(projectData),
  }
);
```

### Step 2: Add Error Handling

```typescript
try {
  const data = await apiRequest(...);
  return data;
} catch (error) {
  console.error('API Error:', error);
  throw error; // Component will show toast
}
```

### Step 3: Add Loading States

Already implemented in UI - just ensure API calls respect them.

---

## Data Flow

```
User Action → Component → Context Method → API Call → Update State → Re-render
```

Example: Create Project
1. User fills New Project form
2. Clicks "Create Project"
3. `createProject()` called in Data Context
4. API POST to `/api/projects`
5. Response updates local state
6. Project appears in table
7. Toast shows success

---

## Testing Endpoints

### Recommended Tools:
- Postman/Insomnia for API testing
- Mock Service Worker (MSW) for development
- React Query DevTools for debugging

### Mock Data Available:
Initial data in Context files can be used as test data.

---

## Critical Integration Points

### Must Integrate First:
1. Authentication (protects all routes)
2. Projects CRUD (core functionality)
3. Assets CRUD (core functionality)
4. Creators API (creator management and crediting)
5. Notifications API (user engagement)

### Can Wait:
5. Export API (client-side works for now)
6. Analytics data
7. Advanced search
8. Real-time updates

---

## Additional Resources

- **Type Definitions:** See `src/contexts/data-context.tsx`
- **Export Utils:** See `src/lib/export-utils.ts`
- **Component Patterns:** See `src/components/cr/`
- **Context Usage:** All dashboard pages use `useData()` hook

---

**Questions? Check the inline comments in the Context files or review component implementations for usage examples.**

