# Developer Setup Guide

Quick setup guide for developers joining the Creation Rights Dashboard project.

---

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repo-url>
cd cr-dashboard-ui-v4
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Create environment file
# See ENV_VARIABLES.md for complete documentation

# Create .env.local and add:
# NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Optional: Developer Tools

### Install Prettier & ESLint Extensions

**VS Code:**
- ESLint extension
- Prettier extension
- Tailwind CSS IntelliSense

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Install Git Hooks (Optional but Recommended)

This sets up automatic code formatting and linting before commits.

**Note:** Configuration files are already included. You just need to install packages.

```bash
# Install husky, lint-staged, and prettier
npm install --save-dev husky lint-staged prettier prettier-plugin-tailwindcss

# Initialize husky
npx husky init

# Create pre-commit hook
# Windows (PowerShell):
New-Item -Path .husky/pre-commit -ItemType File -Force
Set-Content -Path .husky/pre-commit -Value "npx lint-staged"

# Mac/Linux:
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit
```

**What it does:**
- Automatically formats code with Prettier
- Runs ESLint and fixes issues
- Type-checks TypeScript
- Prevents committing broken code

**What Happens on Commit:**
1. Prettier formats your code automatically
2. ESLint fixes auto-fixable issues
3. TypeScript checks for type errors
4. If everything passes, commit proceeds
5. If errors found, commit is blocked

**Skipping Hooks (Emergency Only):**
```bash
git commit --no-verify -m "emergency fix"
```

**Troubleshooting:**
- If hooks not running, make sure hooks are executable: `chmod +x .husky/pre-commit` (Mac/Linux)
- Run manually to see errors: `npx lint-staged`

---

## Available Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npx prettier --write .  # Format code with Prettier
npx tsc --noEmit    # TypeScript type checking

# Testing (after installing test dependencies)
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Note:** Test scripts require installing testing dependencies first. See `TESTING.md` for setup instructions.

---

## Project Structure Overview

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── cr/          # Custom CR components
│   ├── layout/      # Layout components
│   └── ui/          # shadcn/ui components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
└── types/           # TypeScript type definitions
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation if needed

### 3. Test Locally

```bash
# Run tests
npm test

# Check build
npm run build

# Verify in browser
npm run dev
```

### 4. Commit Changes

```bash
# If git hooks installed:
git add .
git commit -m "feat: your feature description"

# Hooks will automatically:
# - Format code with Prettier
# - Fix ESLint issues
# - Run type check
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name

# Create PR on GitHub
# Request review from team
```

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find and kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors

```bash
# Check for errors
npx tsc --noEmit

# Often fixed by restarting TypeScript server in VS Code
# Cmd+Shift+P > "TypeScript: Restart TS Server"
```

---

## Code Style Guidelines

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_URL`)
- **Types:** PascalCase (`ProjectStatus`)

### File Organization

- One component per file
- Co-locate tests with code (`__tests__/` folder)
- Group related components in folders
- Keep files under 300 lines when possible

### Import Order

```typescript
// 1. React & Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. External libraries
import { toast } from 'sonner';

// 3. Internal - absolute imports
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/data-context';

// 4. Relative imports
import { helper } from './utils';

// 5. Types
import type { Project } from '@/types';
```

---

## Getting Help

### Documentation
- Start with `README.md` for project overview
- Check `API_INTEGRATION.md` for API details
- See `TESTING.md` for testing help
- Review `ARCHITECTURE.md` for code structure

### Common Questions

**Q: How do I add a new page?**  
A: Create file in `src/app/(dashboard)/page-name/page.tsx`, add to sidebar

**Q: How do I use the API?**  
A: Import `useData()` hook from `@/contexts/data-context`

**Q: How do I show notifications?**  
A: Use `toast.success()`, `toast.error()`, etc. from `sonner`

**Q: Where are the types?**  
A: All types in `src/types/index.ts`

---

**Welcome to the team! Happy coding!**

