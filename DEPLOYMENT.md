# Deployment Guide - Creation Rights Dashboard

Complete guide for deploying the Creation Rights Dashboard to production.

---

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)
**Time:** 5 minutes  
**Cost:** Free tier available  
**Best for:** Quick deployment, automatic CI/CD

### Option 2: Docker (Self-Hosted)
**Time:** 15 minutes  
**Cost:** Infrastructure costs  
**Best for:** Custom infrastructure, full control

### Option 3: Traditional Server (VPS/EC2)
**Time:** 30 minutes  
**Cost:** Server costs  
**Best for:** Existing infrastructure

---

## Option 1: Vercel Deployment

### Step 1: Prepare Repository

```bash
# Ensure latest code is pushed
git push origin handoff

# Merge to main (or deploy from handoff branch)
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select `vznlabdev/cr-dashboard-ui`

### Step 3: Configure Project

**Framework Preset:** Next.js  
**Root Directory:** ./  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

### Step 4: Environment Variables

Add these in Vercel dashboard under "Environment Variables":

```bash
# Required
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Authentication (if using NextAuth)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret-here

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_BULK_ACTIONS=true
```

### Step 5: Deploy

Click "Deploy" - Vercel will:
1. Clone repository
2. Install dependencies
3. Run build
4. Deploy to production

**Your app will be live at:** `https://your-app.vercel.app`

### Step 6: Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your domain (e.g., `dashboard.creationrights.com`)
3. Update DNS records as instructed
4. SSL certificate automatically provisioned

---

## Option 2: Docker Deployment

### Step 1: Create Dockerfile

Already created at `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Step 3: Build and Run

```bash
# Build image
docker build -t cr-dashboard:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.your-domain.com \
  -e NEXTAUTH_SECRET=your-secret \
  cr-dashboard:latest

# Or use docker-compose
docker-compose up -d
```

### Step 4: Deploy to Server

```bash
# Save image
docker save cr-dashboard:latest | gzip > cr-dashboard.tar.gz

# Copy to server
scp cr-dashboard.tar.gz user@server:/path/

# On server
docker load < cr-dashboard.tar.gz
docker run -d -p 3000:3000 cr-dashboard:latest
```

---

## Option 3: VPS/EC2 Deployment

### Step 1: Server Setup

```bash
# SSH into server
ssh user@your-server.com

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Clone & Build

```bash
# Clone repository
git clone https://github.com/vznlabdev/cr-dashboard-ui.git
cd cr-dashboard-ui

# Install dependencies
npm ci

# Create .env.local
nano .env.local
# Add your environment variables

# Build
npm run build
```

### Step 3: Run with PM2

```bash
# Start application
pm2 start npm --name "cr-dashboard" -- start

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Step 4: Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/cr-dashboard
server {
    listen 80;
    server_name dashboard.creationrights.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cr-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Add SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.creationrights.com
```

---

## Environment Configuration

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_DEBUG=true
```

### Staging (.env.staging)
```bash
NEXT_PUBLIC_API_URL=https://api-staging.creationrights.com
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Production (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.creationrights.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SENTRY_DSN=your-sentry-dsn
```

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] No console errors
- [ ] No linting errors
- [ ] TypeScript types correct

### Configuration
- [ ] Environment variables set
- [ ] API URL configured
- [ ] Auth provider configured
- [ ] Domain DNS configured
- [ ] SSL certificate ready

### Security
- [ ] Environment secrets secure
- [ ] API keys not in code
- [ ] Authentication working
- [ ] CORS configured
- [ ] Rate limiting enabled (backend)

### Performance
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Lazy loading implemented
- [ ] Bundle size acceptable
- [ ] Lighthouse score >90

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Vercel/PostHog)
- [ ] Uptime monitoring
- [ ] Log aggregation

---

## Post-Deployment Steps

### 1. Smoke Tests

Visit these URLs and verify:
- [ ] `/` - Dashboard loads
- [ ] `/projects` - Projects page works
- [ ] `/legal` - Legal page loads
- [ ] `/insurance` - Insurance page loads
- [ ] Create a test project
- [ ] Edit and delete test project

### 2. Monitor Errors

Check:
- Browser console for errors
- Server logs for crashes
- Sentry/error tracking dashboard
- Network tab for failed requests

### 3. Performance Check

```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse https://your-app.vercel.app

# Target scores:
# Performance: >90
# Accessibility: >95
# Best Practices: >90
# SEO: >90
```

### 4. Set Up Monitoring

**Vercel Analytics:**
- Enabled by default on Vercel
- View in Vercel dashboard

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**PostHog (Product Analytics):**
```bash
npm install posthog-js
```

---

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." > "Promote to Production"

### Docker
```bash
# Stop current container
docker stop cr-dashboard

# Start previous version
docker run -d --name cr-dashboard cr-dashboard:previous-tag
```

### PM2
```bash
# Rollback to previous version
git pull origin previous-commit
npm run build
pm2 restart cr-dashboard
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

**Vercel:**
- Automatic scaling included
- No configuration needed

**Docker:**
```yaml
# docker-compose.yml
services:
  app:
    build: .
    deploy:
      replicas: 3
    ports:
      - "3000-3002:3000"
```

**Load Balancer:**
```nginx
upstream cr_dashboard {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    location / {
        proxy_pass http://cr_dashboard;
    }
}
```

---

## Troubleshooting

### Build Fails

**Check:**
- Node version (must be 18+)
- TypeScript errors: `npm run build`
- Missing dependencies: `npm install`
- Environment variables set correctly

### App Won't Start

**Check:**
- Port 3000 available: `lsof -i :3000`
- Environment variables loaded
- API accessible from server
- Logs: `pm2 logs` or `docker logs`

### 404 on Routes

**Check:**
- Build includes all routes
- Server rewrites configured
- `.next` folder deployed
- Static generation succeeded

### API Not Connecting

**Check:**
- NEXT_PUBLIC_API_URL is correct
- CORS enabled on backend
- Network can reach API
- SSL/TLS certificates valid

---

## Best Practices

### 1. Use Environment-Specific Configs

```javascript
// next.config.ts
const config = {
  env: {
    ENVIRONMENT: process.env.NODE_ENV,
  },
  images: {
    domains: ['cdn.creationrights.com'],
  },
};
```

### 2. Enable Caching

```javascript
// Cache static assets
const nextConfig = {
  headers: async () => [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

### 3. Monitor Performance

```typescript
// Add analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Security Considerations

### 1. Environment Variables
- Never commit secrets to git
- Use different secrets per environment
- Rotate secrets regularly
- Use secret management tools (Vault, AWS Secrets Manager)

### 2. Headers
```javascript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
];
```

### 3. Rate Limiting
- Implement on backend
- Use Vercel Edge Config for frontend rate limiting
- Monitor for abuse

---

## Cost Optimization

### Vercel
- **Free:** 100GB bandwidth, unlimited pages
- **Pro:** $20/month, more bandwidth
- **Enterprise:** Custom pricing

### AWS/VPS
- **t3.small:** ~$15/month
- **t3.medium:** ~$30/month
- Add CloudFront CDN: ~$10/month

### Recommendations
- Start with Vercel free tier
- Upgrade as needed
- Monitor usage in dashboard

---

## Support & Maintenance

### Updating the App

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Build
npm run build

# Restart
pm2 restart cr-dashboard  # Or deploy on Vercel
```

### Monitoring Checklist
- [ ] Weekly: Check error logs
- [ ] Weekly: Review analytics
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security audit
- [ ] Quarterly: Performance review

---

**Ready to deploy! Choose your platform and follow the guide above.**

