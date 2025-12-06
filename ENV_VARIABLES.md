# Environment Variables Guide

This document describes all environment variables used in the Creation Rights Dashboard.

---

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

### 2. Add Required Variables

Copy the following into your `.env.local` file:

```env
# Required: API Base URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Optional: Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### 3. Restart Development Server

After adding or changing environment variables:

```bash
npm run dev
```

---

## Required Variables

### `NEXT_PUBLIC_API_URL`

**Type:** String  
**Required:** Yes  
**Example:** `http://localhost:4000/api`

The backend API endpoint for all API calls.

- **Development:** `http://localhost:4000/api`
- **Staging:** `https://api-staging.creationrights.com`
- **Production:** `https://api.creationrights.com`

**Usage in code:**
```typescript
import { api } from '@/lib/api'
// api client uses NEXT_PUBLIC_API_URL automatically
```

---

## Optional Variables

### `NEXT_PUBLIC_ENVIRONMENT`

**Type:** String  
**Default:** `development`  
**Options:** `development` | `staging` | `production`

Used for conditional logic (analytics, error tracking, etc.)

**Usage in code:**
```typescript
if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
  // Enable analytics
}
```

---

### `NEXT_PUBLIC_ANALYTICS_ID`

**Type:** String  
**Required:** No  
**Example:** `G-XXXXXXXXXX`

Google Analytics or similar analytics tracking ID.

**Usage in code:**
```typescript
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID
if (analyticsId) {
  // Initialize analytics
}
```

---

### `SENTRY_DSN`

**Type:** String  
**Required:** No (recommended for production)  
**Example:** `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

Sentry DSN for error tracking in production.

**Usage in code:**
```typescript
import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}
```

---

## Authentication Variables (To Be Implemented)

When implementing authentication, you'll need these variables:

### NextAuth Example

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-a-strong-one

# OAuth Providers (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Supabase Example

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Clerk Example

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

---

## Feature Flags

Enable/disable features without code changes:

```env
# Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Error Tracking
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=false

# WebSockets
NEXT_PUBLIC_ENABLE_WEBSOCKETS=false

# Creative Workspace
NEXT_PUBLIC_ENABLE_CREATIVE_WORKSPACE=true
```

**Usage in code:**
```typescript
const enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'

if (enableAnalytics) {
  // Initialize analytics
}
```

---

## Development Only Variables

### `DEBUG`

```env
DEBUG=true
```

Enables additional logging and debug information.

### `NEXT_PUBLIC_USE_MOCK_API`

```env
NEXT_PUBLIC_USE_MOCK_API=true
```

Use mock data instead of real API (useful for development without backend).

---

## Environment Variable Rules

### Security

1. **NEVER commit `.env.local` to version control**
   - Already in `.gitignore`
   - Contains sensitive secrets

2. **Server-side vs. Client-side**
   - Variables starting with `NEXT_PUBLIC_` are exposed to the browser
   - Server-only variables should NOT start with `NEXT_PUBLIC_`

3. **Secrets**
   - API keys, passwords, secrets should NEVER use `NEXT_PUBLIC_`
   - Keep them server-side only

### Best Practices

1. **Restart Required**
   - Restart dev server after changing environment variables
   - Next.js loads them on startup

2. **Deployment**
   - Set variables in hosting platform (Vercel, AWS, etc.)
   - Use platform's environment variable management

3. **Documentation**
   - Document all variables in this file
   - Include examples and usage

---

## Platform-Specific Setup

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate value
3. Select environments (Production, Preview, Development)
4. Redeploy after adding variables

### Docker

Create a `.env` file for Docker:

```env
NEXT_PUBLIC_API_URL=http://api:4000/api
```

Use in `docker-compose.yml`:

```yaml
services:
  web:
    build: .
    env_file:
      - .env
```

### AWS / EC2

Set variables in:
- **Elastic Beanstalk:** Environment properties
- **ECS:** Task definition environment variables
- **EC2:** Export in startup script

---

## Validation

### Check Current Variables

```bash
# Development
echo $NEXT_PUBLIC_API_URL

# In code
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Required Variables Check

The app will warn if required variables are missing. Check browser console on startup.

---

## Example `.env.local` Files

### Development

```env
# Development setup with local API
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_ENVIRONMENT=development
DEBUG=true
```

### Staging

```env
# Staging setup
NEXT_PUBLIC_API_URL=https://api-staging.creationrights.com
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_ANALYTICS_ID=G-STAGING-ID
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Production

```env
# Production setup
NEXT_PUBLIC_API_URL=https://api.creationrights.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=G-PRODUCTION-ID
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

---

## Troubleshooting

### Variable Not Working

1. **Check spelling** - Must match exactly
2. **Restart dev server** - Changes require restart
3. **Check prefix** - Client-side needs `NEXT_PUBLIC_`
4. **Check file location** - Must be in project root

### Variable is `undefined`

- Not set in environment
- Dev server needs restart
- Wrong prefix (missing `NEXT_PUBLIC_` for client)

### Security Warning

- Don't use `NEXT_PUBLIC_` for secrets
- Keep API keys server-side
- Never commit `.env.local`

---

## Checklist

Before deploying:

- [ ] All required variables set
- [ ] API URL points to correct environment
- [ ] Environment is set to production
- [ ] Analytics configured (if using)
- [ ] Error tracking configured (if using)
- [ ] Authentication variables set (when implemented)
- [ ] Secrets are NOT using `NEXT_PUBLIC_` prefix
- [ ] Variables tested in staging first

---

**Last Updated:** December 2024

