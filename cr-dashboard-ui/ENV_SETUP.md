# Environment Variables Setup

Create a `.env.local` file in the root directory with these variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_BULK_ACTIONS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

See `API_INTEGRATION.md` for the complete list of environment variables.

**Note:** Never commit `.env.local` to git!

