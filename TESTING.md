# Testing Guide - Creation Rights Dashboard

Complete guide for testing the Creation Rights Dashboard application.

---

## Setup

### Step 1: Install Testing Dependencies

**Note:** Testing dependencies are not included in package.json by default to keep the initial install lightweight.

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

### Step 2: Add Test Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Step 3: Verify Setup

```bash
# Run example tests
npm test

# Expected: 3 test suites, 15+ tests passing
```

### Configuration Files

Already created:
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup

### Example Tests Included

1. **src/lib/__tests__/export-utils.test.ts** - Tests for CSV/JSON export functions (7 test cases)
2. **src/lib/__tests__/type-guards.test.ts** - Tests for type validators (10+ test cases)
3. **src/components/cr/__tests__/EmptyState.test.tsx** - Component rendering tests (4 test cases)
4. **src/contexts/__tests__/data-context.test.tsx** - Integration tests for CRUD operations (6 test cases)

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run in CI environment
npm run test:ci
```

---

## Test Structure

```
src/
├── components/
│   └── cr/
│       └── __tests__/
│           └── EmptyState.test.tsx
├── contexts/
│   └── __tests__/
│       └── data-context.test.tsx
└── lib/
    └── __tests__/
        ├── export-utils.test.ts
        └── type-guards.test.ts
```

---

## Writing Tests

### Unit Test Example (Utility Function)

```typescript
// src/lib/__tests__/utils.test.ts
import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });
});
```

### Component Test Example

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Context Test Example

```typescript
// src/contexts/__tests__/notification-context.test.tsx
import { renderHook, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../notification-context';

describe('Notification Context', () => {
  const wrapper = ({ children }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  it('should add notification', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({
        title: 'Test',
        message: 'Message',
        type: 'info',
      });
    });

    expect(result.current.notifications).toHaveLength(5); // 4 initial + 1 new
    expect(result.current.unreadCount).toBeGreaterThan(0);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    const firstNotificationId = result.current.notifications[0]?.id;

    act(() => {
      result.current.markAsRead(firstNotificationId!);
    });

    const notification = result.current.notifications.find(n => n.id === firstNotificationId);
    expect(notification?.read).toBe(true);
  });
});
```

### Integration Test Example (Page)

```typescript
// src/app/(dashboard)/projects/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import ProjectsPage from '../page';
import { DataProvider } from '@/contexts/data-context';

describe('Projects Page', () => {
  const wrapper = ({ children }) => (
    <DataProvider>{children}</DataProvider>
  );

  it('should render projects list', async () => {
    render(<ProjectsPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('should show New Project button', () => {
    render(<ProjectsPage />, { wrapper });
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });
});
```

---

## Testing Best Practices

### 1. Test User Interactions

```typescript
import { fireEvent, waitFor } from '@testing-library/react';

it('should submit form on button click', async () => {
  render(<MyForm />);
  
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Test Name' }
  });
  
  fireEvent.click(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
});
```

### 2. Test Error States

```typescript
it('should show error message on failure', async () => {
  // Mock API to return error
  jest.spyOn(api.projects, 'create').mockRejectedValue(new Error('API Error'));

  render(<CreateProjectForm />);
  
  fireEvent.click(screen.getByText('Create'));
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### 3. Test Loading States

```typescript
it('should show loading spinner while submitting', async () => {
  render(<MyComponent />);
  
  fireEvent.click(screen.getByText('Submit'));
  
  expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
```

### 4. Mock API Calls

```typescript
jest.mock('@/lib/api', () => ({
  api: {
    projects: {
      getAll: jest.fn().mockResolvedValue({
        projects: [
          { id: '1', name: 'Test Project', /* ... */ }
        ]
      }),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  }
}));
```

---

## Test Coverage Goals

### Target Coverage:
- **Overall:** 70%+
- **Components:** 80%+
- **Utils/Lib:** 90%+
- **Context:** 75%+

### View Coverage Report:

```bash
npm run test:coverage

# Open in browser
open coverage/lcov-report/index.html
```

---

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

---

## E2E Testing (Optional)

### Using Playwright

**Install:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Config:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Example E2E Test:**
```typescript
// e2e/projects.spec.ts
import { test, expect } from '@playwright/test';

test('should create new project', async ({ page }) => {
  await page.goto('/projects');
  
  await page.click('text=New Project');
  await page.fill('input[name="name"]', 'E2E Test Project');
  await page.fill('input[name="owner"]', 'Test User');
  await page.click('text=Create Project');
  
  await expect(page.locator('text=E2E Test Project')).toBeVisible();
});
```

---

## What to Test

### Priority 1: Critical Paths
- [ ] User can create a project
- [ ] User can edit a project
- [ ] User can delete a project
- [ ] User can add an asset
- [ ] User can delete an asset
- [ ] Bulk operations work
- [ ] Export functions work

### Priority 2: User Interactions
- [ ] Forms validate input
- [ ] Buttons show loading states
- [ ] Errors display correctly
- [ ] Toasts appear on actions
- [ ] Modals open and close

### Priority 3: Edge Cases
- [ ] Empty states display
- [ ] 404 pages work
- [ ] Network errors handled
- [ ] Invalid data rejected
- [ ] Loading skeletons show

---

## Troubleshooting

### Issue: Tests fail with module not found

**Solution:**
Check `jest.config.js` moduleNameMapper matches your tsconfig paths.

### Issue: Can't test hooks

**Solution:**
```bash
npm install --save-dev @testing-library/react-hooks
```

Use `renderHook` from `@testing-library/react`.

### Issue: Async tests timeout

**Solution:**
Increase timeout or use `waitFor`:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 5000 });
```

---

## Next Steps

1. **Run example tests** to verify setup
2. **Add tests for your components**
3. **Aim for 70%+ coverage**
4. **Set up CI/CD** to run tests automatically
5. **Add E2E tests** for critical user journeys

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright](https://playwright.dev/)

---

**Happy Testing!**

