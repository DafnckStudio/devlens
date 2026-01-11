# DevLens - Visual Feedback Loop for AI-Assisted Development

## Overview

DevLens is a SaaS product that creates a seamless visual feedback loop between end-users/clients and AI coding assistants (Claude Code). It captures screenshots, console errors, and user feedback from any website and routes them automatically to the correct project for AI-assisted fixes.

## Problem Statement

Developers using AI coding assistants like Claude Code lack a direct visual feedback mechanism from their clients or end-users. Currently:
- Clients send vague descriptions of bugs via email/Slack
- No automatic capture of console errors
- Screenshots are manual and context-less
- No direct integration with AI coding workflows
- Feedback gets lost across multiple channels

## Solution

A Chrome extension + cloud backend that:
1. Captures visual context (screenshots, pointed elements)
2. Auto-captures console errors
3. Routes feedback to correct project based on URL
4. Generates structured markdown files Claude Code can read
5. Integrates directly with Claude Code via MCP plugin

## Target Users

### Primary: Freelance Developers & Agencies
- Work with multiple clients
- Use Claude Code or similar AI assistants
- Need efficient client feedback collection
- Want automated bug reproduction context

### Secondary: Individual Developers
- Personal projects feedback
- Self-QA workflow
- Visual debugging aid

## Core Features

### 1. Chrome Extension
- **Screenshot Capture**: Full page or pointed element
- **Element Pointer**: Highlight and capture specific elements
- **Feedback Form**: Quick text input for issue description
- **Console Error Capture**: Automatic JS error collection
- **Session Recording**: Short video clips (future)
- **One-click Submit**: Send feedback instantly

### 2. Cloud Backend (Vercel)
- **User Authentication**: Email/password or OAuth
- **Subscription Management**: Stripe integration
- **Project Registry**: Map domains to projects
- **Feedback Storage**: Images + metadata in cloud
- **API for Claude Code**: REST/MCP endpoints
- **Webhook Support**: Notify on new feedback

### 3. Claude Code Integration
- **MCP Plugin**: Native integration
- **Auto-fetch Feedback**: Pull pending issues
- **Mark as Resolved**: Update feedback status
- **Project Mapping**: Link local paths to cloud projects

### 4. Developer Dashboard (Web)
- **Feedback Queue**: View all pending feedback
- **Project Management**: Configure domain mappings
- **Team Access**: Invite clients/collaborators
- **Analytics**: Feedback trends, resolution time

## User Stories

### US-001: Developer Onboarding
**As a** developer
**I want to** sign up and connect my projects
**So that** I can receive structured feedback

**Acceptance Criteria:**
- Sign up with email or GitHub
- Create first project with domain mapping
- Get API key for Claude Code plugin
- Install Chrome extension

### US-002: Client Feedback Submission
**As a** client/end-user
**I want to** quickly report a visual issue
**So that** the developer gets full context

**Acceptance Criteria:**
- Click extension icon on any page
- Point at problematic element
- Write brief description
- Screenshot auto-captured
- Console errors included
- Submit with one click

### US-003: Feedback Routing
**As a** developer with multiple projects
**I want** feedback auto-routed to correct project
**So that** I don't waste time organizing

**Acceptance Criteria:**
- URL pattern matching to projects
- Fallback to "uncategorized" folder
- Support for localhost/staging/production URLs
- Custom domain mapping

### US-004: Claude Code Integration
**As a** Claude Code user
**I want to** see pending feedback in my IDE
**So that** I can fix issues with full context

**Acceptance Criteria:**
- MCP plugin fetches new feedback
- Displays screenshot inline or link
- Shows console errors
- One command to mark resolved

### US-005: Subscription Management
**As a** paying user
**I want to** manage my subscription
**So that** I can upgrade/downgrade as needed

**Acceptance Criteria:**
- Free tier: 1 project, 10 feedback/month
- Pro tier: Unlimited projects, 100 feedback/month
- Team tier: Unlimited + team members
- Stripe checkout and portal

## Technical Architecture

### Frontend (Chrome Extension)
```
Tech Stack:
- TypeScript
- Chrome Extension Manifest V3
- TailwindCSS (popup UI)
- html2canvas (screenshots)
- WebSocket (real-time)
```

### Backend (Vercel)
```
Tech Stack:
- Next.js 15 API Routes
- Vercel Postgres (users, projects)
- Vercel Blob (screenshots)
- Clerk (authentication)
- Stripe (subscriptions)
```

### Claude Code Plugin
```
Tech Stack:
- TypeScript
- Claude Code Plugin SDK
- REST API client
```

### Data Flow
```
1. User clicks extension → captures screenshot + errors
2. Extension → POST /api/feedback with image + metadata
3. Backend → stores in Blob, creates DB record
4. Backend → routes to project based on URL
5. Claude Code → GET /api/feedback?project=X
6. Claude Code → displays feedback, developer fixes
7. Developer → POST /api/feedback/:id/resolve
```

## Database Schema

### Users
```sql
- id: uuid
- email: string
- clerk_id: string
- stripe_customer_id: string
- subscription_tier: enum
- created_at: timestamp
```

### Projects
```sql
- id: uuid
- user_id: uuid (FK)
- name: string
- domains: string[] (URL patterns)
- local_path: string (optional, for VPS users)
- created_at: timestamp
```

### Feedback
```sql
- id: uuid
- project_id: uuid (FK)
- screenshot_url: string
- element_selector: string
- page_url: string
- description: text
- console_errors: json
- status: enum (pending, in_progress, resolved)
- created_at: timestamp
- resolved_at: timestamp
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get session
- `GET /api/auth/me` - Current user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Feedback
- `POST /api/feedback` - Submit feedback (from extension)
- `GET /api/feedback` - List feedback (for dashboard/plugin)
- `GET /api/feedback/:id` - Get single feedback
- `PUT /api/feedback/:id` - Update status
- `DELETE /api/feedback/:id` - Delete feedback

### Extension
- `GET /api/extension/config` - Get user config for extension
- `POST /api/extension/heartbeat` - Track active users

## Subscription Tiers

| Feature | Free | Pro ($9/mo) | Team ($29/mo) |
|---------|------|-------------|---------------|
| Projects | 1 | Unlimited | Unlimited |
| Feedback/month | 10 | 100 | 500 |
| Screenshot retention | 7 days | 30 days | 90 days |
| Console errors | ✓ | ✓ | ✓ |
| Video clips | ✗ | ✓ | ✓ |
| Team members | 1 | 1 | 10 |
| API access | ✗ | ✓ | ✓ |
| Priority support | ✗ | ✗ | ✓ |

## Branding

### Name: DevLens
- **Tagline**: "See what your users see"
- **Logo**: Stylized eye + code brackets
- **Colors**:
  - Primary: #6366F1 (Indigo)
  - Secondary: #EC4899 (Pink accent)
  - Background: #0F172A (Dark slate)
  - Text: #F8FAFC (Light)

### Design Language
- Modern, minimal, professional
- Pastel accents on dark background
- Smooth animations
- Clear visual hierarchy

## Success Metrics

- **Activation**: % users who submit first feedback within 7 days
- **Retention**: % users active after 30 days
- **Conversion**: % free users who upgrade to Pro
- **NPS**: User satisfaction score
- **Resolution Time**: Average time from feedback to fix

## Roadmap

### Phase 1: MVP (Week 1-2)
- [ ] Vercel backend with auth
- [ ] Chrome extension basic capture
- [ ] Feedback submission flow
- [ ] Simple dashboard
- [ ] Claude Code plugin

### Phase 2: Polish (Week 3)
- [ ] Stripe subscription
- [ ] Landing page
- [ ] Improved UI/branding
- [ ] Domain routing

### Phase 3: Growth (Week 4+)
- [ ] Video clips
- [ ] Team features
- [ ] Chrome Web Store listing
- [ ] Public launch

## Out of Scope (V1)

- Mobile app
- Browser extensions for Firefox/Safari
- Real-time collaboration
- AI-powered issue categorization
- Automated fix suggestions

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Screenshot privacy | Clear permissions, no auto-capture |
| Storage costs | Tier limits, auto-cleanup |
| Extension approval | Follow Chrome policies strictly |
| Competition | Focus on Claude Code integration |

---

*Created: 2026-01-11*
*Author: DafnckStudio*
*Version: 1.0*
