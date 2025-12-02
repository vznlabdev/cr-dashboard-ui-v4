/**
 * Lint-Staged Configuration
 * 
 * Runs linters on git staged files before commit.
 * Ensures code quality and consistent formatting.
 */

module.exports = {
  // TypeScript and TSX files
  '**/*.{ts,tsx}': [
    'prettier --write',
    'eslint --fix',
    () => 'tsc --noEmit', // Type check
  ],

  // JavaScript and JSX files
  '**/*.{js,jsx}': [
    'prettier --write',
    'eslint --fix',
  ],

  // JSON, CSS, and Markdown files
  '**/*.{json,css,scss,md}': [
    'prettier --write',
  ],

  // Package.json - sort dependencies
  'package.json': [
    'prettier --write',
  ],
}

