# Contributing Guidelines

Thank you for contributing to the Creation Rights Dashboard!

---

## Getting Started

See `DEVELOPER_SETUP.md` for initial setup instructions.

---

## Development Process

### 1. Pick an Issue or Feature

- Check GitHub Issues
- Discuss with team lead
- Get approval before starting large features

### 2. Create Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 3. Make Changes

- Write clean, readable code
- Follow existing patterns
- Add tests for new features
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run tests
npm test

# Build check
npm run build

# Manual testing
npm run dev
```

### 5. Commit

**Commit Message Format:**
```
type: brief description

Detailed explanation of what and why (if needed)
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

**Examples:**
```bash
git commit -m "feat: add bulk delete for projects"
git commit -m "fix: resolve notification badge count issue"
git commit -m "docs: update API integration guide"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

**Create PR on GitHub:**
- Clear title and description
- Link related issues
- Add screenshots if UI changes
- Request reviews

---

## Code Style

### Formatting

We use **Prettier** for automatic formatting.

**Manual format:**
```bash
npx prettier --write .
```

**Editor:** Enable format-on-save in your IDE

### Linting

We use **ESLint** for code quality.

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### TypeScript

- Use strict types (no `any`)
- Define interfaces for props
- Use type imports: `import type { ... }`

---

## Testing Requirements

### For New Features:
- [ ] Unit tests for utilities
- [ ] Component tests for UI
- [ ] Integration tests for complex features
- [ ] Manual testing completed

### Coverage Targets:
- Components: 80%+
- Utilities: 90%+
- Context: 75%+
- Overall: 70%+

```bash
# Check coverage
npm run test:coverage
```

---

## Pull Request Checklist

Before submitting PR:

**Code Quality:**
- [ ] Tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors
- [ ] Code formatted (Prettier)

**Testing:**
- [ ] New features have tests
- [ ] Existing tests still pass
- [ ] Manual testing done
- [ ] Edge cases considered

**Documentation:**
- [ ] README updated (if needed)
- [ ] Code commented (complex logic)
- [ ] API changes documented
- [ ] Types updated

**Review:**
- [ ] Self-reviewed code
- [ ] No console.logs in production code
- [ ] No commented-out code
- [ ] Screenshots added (UI changes)

---

## Common Tasks

### Adding a New Component

1. Create component file in appropriate folder
2. Export from index.ts if in component library
3. Add tests in `__tests__/` folder
4. Document props with TypeScript

### Adding a New Page

1. Create page in `src/app/(dashboard)/page-name/page.tsx`
2. Add route to sidebar in `src/components/layout/Sidebar.tsx`
3. Test navigation and page load

### Using Context/Hooks

```typescript
// CRUD operations
import { useData } from '@/contexts/data-context';
const { projects, createProject } = useData();

// Notifications
import { useNotifications } from '@/contexts/notification-context';
const { addNotification } = useNotifications();
```

---

## Getting Help

### Questions?

1. Check existing documentation
2. Search GitHub Issues
3. Ask in team chat
4. Tag relevant team member in PR

### Found a Bug?

1. Search existing issues first
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Browser/OS info

---

## Code Review Process

### As Author:
- Respond to feedback promptly
- Ask questions if unclear
- Make requested changes
- Mark conversations as resolved

### As Reviewer:
- Be constructive and kind
- Explain reasoning
- Approve when ready
- Test changes locally for major features

---

Thank you for contributing!

