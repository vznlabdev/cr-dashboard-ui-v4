# Quick Reference Guide

## Start Here

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
```

**Important Files:**
- `DEVELOPER_HANDOFF.md` - Start here!
- `API_INTEGRATION.md` - API endpoints
- `HANDOFF_SUMMARY.md` - Complete overview

---

## Common Tasks

### Use Data (Projects/Assets)
```typescript
import { useData } from '@/contexts/data-context';

const { projects, createProject, updateProject, deleteProject } = useData();
```

### Use Notifications
```typescript
import { useNotifications } from '@/contexts/notification-context';

const { notifications, addNotification, markAsRead } = useNotifications();
```

### Show Toast
```typescript
import { toast } from 'sonner';

toast.success("Success message");
toast.error("Error message");
toast.info("Info message");
```

### API Calls (After Integration)
```typescript
import { api } from '@/lib/api';

const { projects } = await api.projects.getAll();
const newProject = await api.projects.create(data);
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/contexts/data-context.tsx` | CRUD operations |
| `src/contexts/notification-context.tsx` | Notifications |
| `src/lib/api.ts` | API client |
| `src/types/index.ts` | All types |
| `src/lib/export-utils.ts` | CSV/JSON export |

---

## Integration Steps

1. Read `DEVELOPER_HANDOFF.md`
2. Set up `.env.local` (see `ENV_SETUP.md`)
3. Replace Context methods with API calls
4. Test all features
5. Deploy

---

## Feature Status

- UI Complete  
- State Management  
- CRUD Operations (in-memory)  
- API Integration (next step)  
- Authentication (next step)  

---

**Questions? Check the detailed guides!**

