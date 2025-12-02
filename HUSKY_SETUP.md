# Git Hooks Setup with Husky

Optional but highly recommended for maintaining code quality.

---

## What Are Git Hooks?

Git hooks automatically run scripts before commits, pushes, etc. to:
- Format code automatically
- Check for linting errors
- Run type checks
- Prevent broken code from being committed

---

## Quick Setup (5 minutes)

### Step 1: Install Dependencies

**Note:** These are optional developer tools. Install only if you want automatic code formatting and pre-commit checks.

```bash
npm install --save-dev husky lint-staged prettier prettier-plugin-tailwindcss
```

Configuration files (`.prettierrc`, `.lintstagedrc.js`) are already included in the repository.

### Step 2: Initialize Husky

```bash
# Initialize husky
npx husky init

# This creates .husky/ folder
```

### Step 3: Create Pre-Commit Hook

**Windows (PowerShell):**
```powershell
New-Item -Path .husky/pre-commit -ItemType File -Force
Set-Content -Path .husky/pre-commit -Value "npx lint-staged"
```

**Mac/Linux:**
```bash
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### Step 4: Test It Works

```bash
# Make a change
echo "// test" >> src/app/page.tsx

# Try to commit
git add .
git commit -m "test: husky setup"

# Should see:
# > Preparing lint-staged...
# > Running tasks for staged files...
# > Applying modifications...
```

---

## What Happens on Commit

With the configuration in `.lintstagedrc.js`:

1. **Prettier** formats your code automatically
2. **ESLint** fixes auto-fixable issues
3. **TypeScript** checks for type errors
4. If everything passes, commit proceeds
5. If errors found, commit is blocked

---

## Configuration Files

### `.prettierrc` (Already Created)
Code formatting rules

### `.lintstagedrc.js` (Already Created)
What to run on staged files

### `.husky/pre-commit`
Runs lint-staged before commit

---

## Additional Hooks (Optional)

### Pre-Push Hook

Run tests before pushing:

```bash
# .husky/pre-push
npm test
```

### Commit Message Hook

Enforce commit message format:

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

---

## Skipping Hooks (Emergency Only)

```bash
# Skip pre-commit hooks
git commit --no-verify -m "emergency fix"
```

**Note:** Only use in emergencies! Hooks are there to help.

---

## Troubleshooting

### Hooks not running

```bash
# Make sure hooks are executable
chmod +x .husky/pre-commit  # Mac/Linux

# Reinstall husky
rm -rf .husky
npx husky init
```

### Lint-staged fails

```bash
# Run manually to see errors
npx lint-staged

# Fix errors and try again
```

---

## Benefits

- **Consistent formatting** - All code looks the same  
- **Catch errors early** - Before committing  
- **Faster PR reviews** - No formatting debates  
- **Better code quality** - Automatic checks  
- **Less bugs** - Type checking before commit  

---

**Recommended for all developers on the team!**

