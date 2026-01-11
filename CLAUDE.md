# DevLens - Claude Code Instructions

## Project Overview

DevLens is a SaaS visual feedback tool for AI-assisted development. It captures screenshots, console errors, and user feedback from websites and routes them to Claude Code for automated fixes.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Next.js 15 (App Router) on Vercel |
| **Database** | Vercel Postgres |
| **Storage** | Vercel Blob |
| **Auth** | Clerk |
| **Payments** | Stripe |
| **Extension** | Chrome Manifest V3, TypeScript |
| **Plugin** | Claude Code Plugin SDK |

## Project Structure

```
devlens/
├── apps/
│   ├── web/                 # Next.js dashboard + API
│   │   ├── app/
│   │   │   ├── (auth)/      # Sign in/up pages
│   │   │   ├── (dashboard)/ # Main dashboard
│   │   │   ├── (marketing)/ # Landing page
│   │   │   └── api/         # API routes
│   │   ├── components/
│   │   └── lib/
│   └── extension/           # Chrome extension
│       ├── src/
│       │   ├── background.ts
│       │   ├── content.ts
│       │   ├── popup/
│       │   └── services/
│       └── manifest.json
├── packages/
│   ├── shared/              # Shared types
│   └── claude-plugin/       # Claude Code plugin
└── .claude/
    ├── docs/
    └── rules/
```

## Git Configuration

- **Email**: `studio@dafnck.com`
- **Remote**: GitHub (DafnckStudio org)

## Vercel Configuration

- **Team**: dafnck-studio
- **Token**: AZbtWc1OSJVLpxLiBc5FIt2t (stored in .env.local)

## Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Vercel
VERCEL_API_TOKEN=AZbtWc1OSJVLpxLiBc5FIt2t
POSTGRES_URL=
BLOB_READ_WRITE_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Branding

| Element | Value |
|---------|-------|
| **Name** | DevLens |
| **Tagline** | See what your users see |
| **Primary Color** | #6366F1 (Indigo) |
| **Accent** | #EC4899 (Pink) |
| **Background** | #0F172A (Dark slate) |
| **Font** | Inter |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/feedback | Submit feedback (extension) |
| GET | /api/feedback | List feedback (dashboard/plugin) |
| PUT | /api/feedback/:id | Update status |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |

## Claude Code Plugin

The plugin provides:
- `devlens:list` - List pending feedback
- `devlens:view <id>` - View feedback details
- `devlens:resolve <id>` - Mark as resolved
- `devlens:sync` - Sync local project mappings

## Obligations

### At each session
1. Read `.claude/docs/PRD.md` for product context
2. Check pending feedback via plugin
3. Follow branding guidelines

### After modifications
1. Update step.json progress
2. Run `pnpm build` to verify
3. Deploy to Vercel for testing

## Commands

```bash
# Development
pnpm dev          # Start all apps
pnpm build        # Build all
pnpm lint         # Lint all

# Extension
cd apps/extension && pnpm build
# Load dist/ in chrome://extensions

# Deploy
vercel --prod
```

---

*Last Updated: 2026-01-11*
