# Deployment Checklist

Use this checklist before deploying to staging or production.

---

## Pre-Deployment

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed or documented

### Dependencies
- [ ] All dependencies up to date
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Production dependencies only in package.json
- [ ] Lock file committed (package-lock.json)

### Environment
- [ ] .env.local created (not committed)
- [ ] All required env variables set
- [ ] API URL points to correct backend
- [ ] Auth secrets configured
- [ ] Feature flags set appropriately

### Configuration
- [ ] next.config.ts reviewed
- [ ] Image domains configured
- [ ] Headers configured (security, caching)
- [ ] Redirects configured if needed

---

## Security

### Environment & Secrets
- [ ] No secrets in code
- [ ] .env files in .gitignore
- [ ] Different secrets per environment
- [ ] Secrets rotated if previously exposed

### Headers & CORS
- [ ] Security headers configured
- [ ] CORS properly configured on backend
- [ ] CSP (Content Security Policy) reviewed
- [ ] HTTPS enforced in production

### Authentication
- [ ] Auth provider configured
- [ ] Routes protected by middleware
- [ ] Session timeout configured
- [ ] Password policies enforced (backend)

---

## Performance

### Optimization
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting enabled
- [ ] Dynamic imports for heavy components
- [ ] Bundle size acceptable (<500KB initial)

### Caching
- [ ] Static assets cached
- [ ] API responses cached where appropriate
- [ ] CDN configured (if applicable)
- [ ] Browser caching headers set

### Monitoring
- [ ] Lighthouse score >90 (all categories)
- [ ] Core Web Vitals passing
- [ ] Time to Interactive <3s
- [ ] First Contentful Paint <1.5s

---

## Backend Integration

### API
- [ ] Backend API accessible from frontend
- [ ] All endpoints implemented
- [ ] API returns correct data structures
- [ ] Error responses standardized
- [ ] Rate limiting configured

### Database
- [ ] Migrations run
- [ ] Seed data loaded (if needed)
- [ ] Backups configured
- [ ] Connection pooling set up

### File Storage
- [ ] S3/Cloudinary configured
- [ ] Upload limits set
- [ ] File types validated
- [ ] CDN configured for assets

---

## Testing

### Manual Testing
- [ ] Create project works
- [ ] Edit project works
- [ ] Delete project works
- [ ] Add asset works
- [ ] Delete asset works
- [ ] Bulk operations work
- [ ] Notifications display
- [ ] Export functions work
- [ ] Search & filter work
- [ ] All modals open/close

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Responsive Testing
- [ ] Mobile (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)
- [ ] Ultra-wide (1920px+)

---

## Deployment

### Vercel
- [ ] Project connected to GitHub
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Preview deployments working

### Docker
- [ ] Dockerfile builds successfully
- [ ] Image size reasonable (<500MB)
- [ ] Health check working
- [ ] Container starts correctly
- [ ] Logs accessible

### Server
- [ ] Node.js 18+ installed
- [ ] PM2 configured for auto-restart
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Firewall rules configured

---

## Post-Deployment

### Verification
- [ ] App accessible at production URL
- [ ] All pages load correctly
- [ ] Authentication working
- [ ] API calls successful
- [ ] No console errors
- [ ] 404 page displays correctly

### Monitoring Setup
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (Vercel/PostHog) working
- [ ] Uptime monitoring active
- [ ] Log aggregation configured
- [ ] Alerts configured for errors

### Documentation
- [ ] Deployment documented
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

---

## Rollback Plan

### If Deployment Fails

**Vercel:**
1. Go to Deployments tab
2. Find last working deployment
3. Click "Promote to Production"

**Docker:**
```bash
docker stop cr-dashboard
docker run -d --name cr-dashboard cr-dashboard:previous-tag
```

**PM2:**
```bash
git reset --hard previous-commit
npm run build
pm2 restart cr-dashboard
```

---

## Sign-Off

### Team Approvals
- [ ] Frontend lead approved
- [ ] Backend lead approved
- [ ] QA team approved
- [ ] Product owner approved
- [ ] DevOps approved

### Final Checks
- [ ] All checklist items completed
- [ ] Deployment plan reviewed
- [ ] Rollback plan tested
- [ ] Team notified
- [ ] Monitoring active

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version/Commit:** _______________  
**Environment:** [ ] Staging [ ] Production  

---

**Ready to deploy!**

