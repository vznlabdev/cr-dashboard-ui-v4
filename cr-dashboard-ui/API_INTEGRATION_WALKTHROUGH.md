# API Integration Walkthrough - Step by Step

This guide walks you through integrating the backend API with the frontend, step by step.

---

## Prerequisites

1. Backend API running and accessible
2. API base URL (e.g., `http://localhost:8000/api`)
3. Authentication method chosen (NextAuth, Clerk, custom)
4. Environment variables configured

---

## Step 1: Configure Environment (5 minutes)

### 1.1 Create .env.local file

```bash
# Copy the template
cp ENV_SETUP.md .env.local

# Edit and add your values
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 1.2 Verify API is accessible

```typescript
// Test in browser console or create a test page
import { checkAPIHealth } from '@/lib/api';

const isHealthy = await checkAPIHealth();
console.log('API Health:', isHealthy);
```

---

## Step 2: Set Up Authentication (30-60 minutes)

### Option A: Using NextAuth.js

**Install:**
```bash
npm install next-auth
```

**Create auth route:**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Call your backend API to validate credentials
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
  pages: {
    signIn: '/login',
  }
});

export { handler as GET, handler as POST };
```

**Enable middleware:**
```typescript
// Rename middleware.ts.example to middleware.ts
// Uncomment NextAuth section
```

### Option B: Using Clerk

**Install:**
```bash
npm install @clerk/nextjs
```

**Wrap app:**
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

---

## Step 3: Connect Data Context to API (1-2 hours)

### 3.1 Update createProject

**File:** `src/contexts/data-context.tsx`

**Before:**
```typescript
const createProject = useCallback(async (projectData) => {
  // TODO: Replace with API call
  await new Promise(resolve => setTimeout(resolve, 500));
  // ... mock implementation
}, []);
```

**After:**
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

### 3.2 Update updateProject

```typescript
const updateProject = useCallback(async (id, updates) => {
  try {
    const { project } = await api.projects.update(id, updates);
    setProjects(prev => prev.map(p => p.id === id ? project : p));
  } catch (error) {
    showErrorToast(error);
    throw error;
  }
}, []);
```

### 3.3 Update deleteProject

```typescript
const deleteProject = useCallback(async (id) => {
  try {
    await api.projects.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setAssets(prev => {
      const newAssets = { ...prev };
      delete newAssets[id];
      return newAssets;
    });
  } catch (error) {
    showErrorToast(error);
    throw error;
  }
}, []);
```

### 3.4 Fetch initial data on mount

Add to DataProvider:

```typescript
export function DataProvider({ children }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const { projects } = await api.projects.getAll();
        setProjects(projects);
      } catch (error) {
        showErrorToast(error, "Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  // ... rest of implementation
}
```

---

## Step 4: Add Error Boundaries (15 minutes)

### 4.1 Wrap dashboard layout

```typescript
// src/app/(dashboard)/layout.tsx
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <DataProvider>
          <ErrorBoundary>
            <MainLayout>{children}</MainLayout>
          </ErrorBoundary>
        </DataProvider>
      </NotificationProvider>
    </SidebarProvider>
  );
}
```

### 4.2 Wrap individual pages (optional)

```typescript
// For pages with heavy data operations
export default function ProjectsPage() {
  return (
    <ErrorBoundary fallback={<ProjectsErrorFallback />}>
      <ProjectsContent />
    </ErrorBoundary>
  );
}
```

---

## Step 5: Implement File Upload (1-2 hours)

### 5.1 Update Add Asset Dialog

```typescript
// src/components/cr/add-asset-dialog.tsx
import { uploadFile } from '@/lib/api';

const [file, setFile] = useState<File | null>(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!file) {
    toast.error("Please select a file");
    return;
  }

  setIsSubmitting(true);
  
  try {
    // Upload file
    const uploadResult = await uploadFile(
      `/projects/${projectId}/assets/upload`,
      file,
      {
        name: formData.name,
        type: formData.type,
        creator: formData.creator,
        // ... other metadata
      }
    );

    toast.success(`Asset "${formData.name}" uploaded successfully!`);
    onOpenChange(false);
  } catch (error) {
    showErrorToast(error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 5.2 Add file input to form

```tsx
<div className="space-y-2">
  <Label htmlFor="file-upload">
    Upload File <span className="text-destructive">*</span>
  </Label>
  <Input
    id="file-upload"
    type="file"
    accept="image/*,video/*,audio/*,.txt,.pdf"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    disabled={isSubmitting}
    required
  />
  {file && (
    <p className="text-sm text-muted-foreground">
      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
    </p>
  )}
</div>
```

---

## Step 6: Connect Notifications (30 minutes)

### Option A: WebSocket (Recommended for real-time)

```typescript
// src/contexts/notification-context.tsx
import { useEffect } from 'react';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast for new notifications
      toast.info(notification.title);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  // ... rest of implementation
}
```

### Option B: Polling (Simpler alternative)

```typescript
useEffect(() => {
  async function fetchNotifications() {
    try {
      const { notifications } = await api.notifications.getAll();
      setNotifications(notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }

  // Fetch immediately
  fetchNotifications();

  // Poll every 30 seconds
  const interval = setInterval(fetchNotifications, 30000);

  return () => clearInterval(interval);
}, []);
```

---

## Step 7: Testing Integration (30 minutes)

### 7.1 Test CRUD operations

```typescript
// Test create
const newProject = await api.projects.create({
  name: "Test Project",
  description: "Testing API",
  owner: "Test User",
  status: "Draft",
  risk: "Low"
});
console.log("Created:", newProject);

// Test update
await api.projects.update(newProject.project.id, {
  status: "Active"
});

// Test delete
await api.projects.delete(newProject.project.id);
```

### 7.2 Test error handling

```typescript
// Test 404
try {
  await api.projects.getById("invalid-id");
} catch (error) {
  console.log("Caught 404:", error);
}

// Test validation error
try {
  await api.projects.create({ name: "" });
} catch (error) {
  console.log("Caught validation error:", error);
}
```

---

## Step 8: Optimizations (Optional)

### 8.1 Add React Query (Recommended)

```bash
npm install @tanstack/react-query
```

```typescript
// src/app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 8.2 Use queries in components

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function ProjectsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.getAll()
  });

  const createMutation = useMutation({
    mutationFn: api.projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created!');
    }
  });

  // ... render
}
```

---

## Troubleshooting

### Issue: CORS errors

**Solution:**
```typescript
// Backend needs to allow your frontend origin
// Express example:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Issue: 401 Unauthorized

**Check:**
1. Is auth token being sent? (Check Network tab)
2. Is token format correct? (`Bearer <token>`)
3. Is token expired?
4. Is API expecting different header?

### Issue: Network errors

**Check:**
1. Is backend running?
2. Is API_URL correct in .env.local?
3. Check browser console for CORS errors
4. Try API health check: `await checkAPIHealth()`

---

## Checklist

After integration, verify:

- [ ] Projects: Create, Read, Update, Delete
- [ ] Assets: Create, Delete
- [ ] Bulk operations work
- [ ] Notifications load
- [ ] Export functions work
- [ ] Error messages are user-friendly
- [ ] Loading states show correctly
- [ ] Authentication redirects work
- [ ] File uploads work (if implemented)
- [ ] All toast notifications appropriate

---

## Next Steps

1. Deploy to staging environment
2. Test with real users
3. Monitor error logs
4. Optimize performance
5. Add analytics tracking
6. Plan for production deployment

---

**Need help? Check:**
- `API_INTEGRATION.md` - Complete endpoint specs
- `src/lib/api-errors.ts` - Error handling utilities
- `src/hooks/useAsync.ts` - Loading state hook
- `src/components/error-boundary.tsx` - Error UI

Good luck with the integration!

