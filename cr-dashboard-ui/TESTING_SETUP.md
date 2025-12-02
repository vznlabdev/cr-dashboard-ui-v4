# Testing Setup Instructions

Quick guide to set up testing for the Creation Rights Dashboard.

---

## Step 1: Install Dependencies

**Note:** Testing dependencies are not included in package.json by default to keep the initial install lightweight.

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest
```

**Or install all at once:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

---

## Step 2: Add Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Step 3: Verify Setup

```bash
# Run example tests
npm test

# Expected: 3 test suites, 15+ tests passing
```

---

## Configuration Files

Already created:
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup

---

## Example Tests Included

1. **src/lib/__tests__/export-utils.test.ts**
   - Tests for CSV/JSON export functions
   - 7 test cases

2. **src/lib/__tests__/type-guards.test.ts**
   - Tests for type validators
   - 10+ test cases

3. **src/components/cr/__tests__/EmptyState.test.tsx**
   - Component rendering tests
   - 4 test cases

4. **src/contexts/__tests__/data-context.test.tsx**
   - Integration tests for CRUD operations
   - 6 test cases

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Next Steps

1. Verify tests run successfully
2. Add more test files as needed
3. Aim for 70%+ code coverage
4. See TESTING.md for detailed guide

---

**All test infrastructure is ready to use!**

