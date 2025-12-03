
# Creation Rights – Project Logic Reference (UI-Only)

This document summarizes the operational logic and workflows of the Creation Rights system, with all UI-related details removed. Use this as a reference for UI architecture, component flows, and user-role behavior.

## 1. Platform Purpose
Creation Rights is a multi-tenant system designed for:
- Creative request management (ticketing)
- Controlled creative workflows
- Brand profile management
- Version and time tracking
- Team collaboration
- Compliance, rights, and licensing review
- External partner access

## 2. Subscription Logic
- Monthly subscription model (31-day cycle)
- Trial periods for select customers
- Active subscribers can create tickets, manage brands, approve work, view billing, and communicate via ticket threads

## 3. Brand Profile Logic
A brand profile includes:
- Name
- Target audience
- Description
- Brand values, mission, vision
- Personality
- Colors
- Fonts
- Images & reference files
- Inspirations
Organizations may create unlimited brands. Tickets reference brands as needed.

## 4. Ticket Workflow Logic

### Ticket Fields
- Title
- Design type
- Brand reference
- Project tag
- Target audience
- Description
- Optional stock photos
- Attachments
- Version history
- Status

### Ticket Lifecycle
1. **Submission** – client creates the request  
2. **Assessment** – reviewed for completeness, feasibility, and estimated time  
3. **Assignment** – team leader confirms assignment  
4. **Production** – designer works, tracks time, uploads versions  
5. **QA Review** – deliverable checked or returned  
6. **Delivery** – designer delivers final output and completes ticket  

## 5. Output Categories
Supported output categories:
- Digital marketing assets
- Social media creative
- Ecommerce graphics
- Email designs
- Logos & branding kits
- PDFs, whitepapers, eBooks
- Presentations
- Web design assets
- UX/UI assets
- Print and merch
- Packaging
- Posters, flyers
- Trade show materials
- Business cards
- Stickers, keychains
- Custom assets

## 6. Internal Workflow Roles

### Assessment Team
- Reviews tickets
- Ensures completeness
- Estimates work
- Assigns creatives

### Team Leader
- Balances workload
- Oversees progress

### Creative
- Executes tasks
- Uploads versions
- Handles revisions

### QA
- Reviews deliverables
- Approves or returns work

### External Contributor
- Restricted to assigned tasks only

## 7. Multi-Tenant Role Architecture

### Level 1 — Internal CR Team
- **Super Admin** – full platform-wide access  
- **Support Manager** – escalations, billing issues  
- **Support Agent** – customer inquiries, tickets  
- **Legal/Compliance** – rights, audit logs  
- **Sales Manager** – referral partner oversight  
- **Referral Partner** – lead + commission tracking  

### Level 2 — Subscriber Organizations
- **Subscriber Super Admin** – full org control except billing edits  
- **Company Manager** – full operational control; view-only billing  
- **Project Manager** – manages projects, team, communication  
- **Finance/Operations** – billing + financial reporting  
- **Accounting** – read-only financials; refunds  
- **HR Manager** – recruiting, onboarding, payroll  
- **Legal Officer** – invited access for legal risk review  

### Level 3 — Client Organizations
- **Client User** – submit tickets, approve/reject, request revisions, view/download assets  
- **Client Admin** – manages client team + brand profiles, sees billing for client org  

### Level 4 — Individual Creators (NILP Registry)
- Register likeness  
- Approve/deny usage  
- View analytics  
- Generate evidence packages  

## 8. External Partner Access
**Insurance & Risk Manager** (invited only):
- View risk metrics  
- Generate reports  
- Portfolio-level visibility  

## 9. Permission Summary

### Data Isolation
- Each subscriber org is fully isolated.
- Only CR Internal Team has global visibility.
- External partners receive limited, logged, invitation-based access.

### Access Matrix
| Capability | CR Team | Subscriber | Client | Partner |
|-----------|---------|------------|--------|---------|
| Cross-Tenant View | Full | None | None | Limited |
| Org Management | Full | Own | None | None |
| Project Access | Full | Full | Own Only | None |
| Team Permissions | Full | Full | Minimal | None |
| Brand Profiles | Full | Create/Edit | Create/Edit | None |
| Billing | Full | Role-Based | Own | None |
| Risk/Compliance | Full | Own | None | Portfolio |

## 10. Compliance & Privacy
- All actions must be logged
- Invitation-based access for legal & partner roles
- GDPR-style privacy model
- Strong tenant separation

## 11. Scalability
- Unlimited subscriber orgs  
- Unlimited clients per org  
- Unlimited team members  
- External partner roles scale independently  
