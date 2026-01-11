# DevLens

**See what your users see** - Visual feedback tool for AI-assisted development.

DevLens captures screenshots, console errors, and user feedback from websites and routes them directly to Claude Code for automated debugging and fixes.

![DevLens Landing Page](https://web-five-pi-52.vercel.app)

## Overview

DevLens bridges the gap between visual bugs and code fixes. When users encounter issues, they capture feedback via the Chrome extension. That feedback flows directly to Claude Code, which can see the screenshot, understand the problem, and implement fixes automatically.

### Key Features

- **Screenshot Capture** - One-click screenshots with viewport detection and element highlighting
- **Console Error Capture** - Automatically captures console errors, warnings, and unhandled exceptions
- **Claude Code Integration** - Feedback routes directly to Claude Code with full context for automated fixes
- **Multi-Environment Support** - Works with localhost, staging, and production URLs

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Chrome         │    │  DevLens        │    │  Claude Code    │
│  Extension      │───▶│  Dashboard      │───▶│  Plugin         │
│                 │    │  (API + UI)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      User                  Storage              AI Fixes
   captures              screenshots &          analyzes &
   feedback              metadata              implements
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Chrome browser
- Claude Code CLI

### 1. Clone and Install

```bash
git clone https://github.com/DafnckStudio/devlens.git
cd devlens
pnpm install
```

### 2. Set Up Environment Variables

Create `.env.local` in `apps/web/`:

```bash
# Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Vercel Postgres (auto-created on Vercel or use local)
POSTGRES_URL=postgres://...

# Vercel Blob Storage (for screenshots)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# Stripe (optional, for billing)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 3. Run the Dashboard

```bash
# Start the Next.js dashboard
pnpm dev

# Open http://localhost:3000
```

### 4. Install the Chrome Extension

```bash
# Build the extension
cd apps/extension
pnpm build

# Install in Chrome:
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the apps/extension/dist folder
```

### 5. Install the Claude Code Plugin

```bash
# Copy the plugin to your Claude plugins directory
cp -r packages/claude-plugin ~/.claude/plugins/devlens

# Or add to your project's .claude/plugins/
mkdir -p .claude/plugins
cp -r packages/claude-plugin .claude/plugins/devlens
```

---

## Installation Guide (Detailed)

### Part A: Dashboard Setup

#### Option 1: Deploy to Vercel (Recommended)

1. **Fork the repository** on GitHub

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your forked repository
   - Set the root directory to `apps/web`
   - Set the install command to `pnpm install`

3. **Configure Environment Variables** in Vercel:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
   CLERK_SECRET_KEY=sk_xxx
   ```

4. **Set up Vercel Storage**
   - In your Vercel project, go to Storage
   - Create a Postgres database
   - Create a Blob store
   - Environment variables are auto-added

5. **Deploy** - Vercel will build and deploy automatically

#### Option 2: Self-hosted

1. **Set up PostgreSQL**
   ```bash
   # Using Docker
   docker run -d \
     --name devlens-db \
     -e POSTGRES_USER=devlens \
     -e POSTGRES_PASSWORD=secret \
     -e POSTGRES_DB=devlens \
     -p 5432:5432 \
     postgres:15
   ```

2. **Set up Blob Storage**
   - Use Vercel Blob, AWS S3, or Cloudflare R2
   - Update the storage adapter in `apps/web/lib/storage.ts`

3. **Configure Clerk**
   - Create an application at [dashboard.clerk.com](https://dashboard.clerk.com)
   - Copy the API keys to your environment

4. **Run the application**
   ```bash
   cd apps/web
   pnpm build
   pnpm start
   ```

---

### Part B: Chrome Extension Setup

#### For Development

1. **Build the extension**
   ```bash
   cd apps/extension
   pnpm install
   pnpm build
   ```

2. **Load in Chrome**
   - Navigate to `chrome://extensions`
   - Enable **Developer mode** (top right toggle)
   - Click **Load unpacked**
   - Select `apps/extension/dist`

3. **Configure the extension**
   - Click the DevLens icon in Chrome toolbar
   - Enter your API key (get from DevLens dashboard)
   - Set your project ID

#### For Users (Packaged Extension)

Once you publish to Chrome Web Store:

1. Install from Chrome Web Store
2. Click the DevLens icon
3. Sign in with your DevLens account
4. Select your project

---

### Part C: Claude Code Plugin Setup

#### Installation

```bash
# Method 1: Global installation
mkdir -p ~/.claude/plugins/devlens
cp packages/claude-plugin/SKILL.md ~/.claude/plugins/devlens/
cp packages/claude-plugin/dist/* ~/.claude/plugins/devlens/

# Method 2: Per-project installation
mkdir -p .claude/plugins/devlens
cp packages/claude-plugin/SKILL.md .claude/plugins/devlens/
cp packages/claude-plugin/dist/* .claude/plugins/devlens/
```

#### Configuration

Add to your project's `.env.local`:

```bash
DEVLENS_API_KEY=your_api_key_from_dashboard
DEVLENS_PROJECT_ID=your_project_id
DEVLENS_API_URL=https://your-devlens.vercel.app/api
```

Or for the hosted version:

```bash
DEVLENS_API_KEY=your_api_key
DEVLENS_PROJECT_ID=your_project_id
DEVLENS_API_URL=https://web-five-pi-52.vercel.app/api
```

---

## Usage Guide

### Capturing Feedback (Chrome Extension)

1. **Open your website** in Chrome

2. **Click the DevLens icon** in the toolbar

3. **Choose capture type:**
   - **Screenshot** - Captures the visible viewport
   - **Element** - Click to capture a specific element
   - **Full Page** - Captures the entire scrollable page

4. **Add notes** (optional) - Describe the issue

5. **Submit** - Feedback is sent to the dashboard

### Reviewing Feedback (Dashboard)

1. **Sign in** to the DevLens dashboard

2. **View pending feedback** in the inbox

3. **Click to see details:**
   - Screenshot with annotations
   - Console errors
   - Element information
   - Browser and viewport info

4. **Update status:**
   - Pending → In Progress → Resolved

### Fixing Issues (Claude Code Plugin)

In your Claude Code session:

```bash
# List pending feedback
devlens:list

# View specific feedback
devlens:view fb-001

# After fixing, mark as resolved
devlens:resolve fb-001 --note "Fixed button visibility"
```

#### Example Workflow

```
You: Check if there's any feedback to review

Claude: Let me check the DevLens dashboard.

[devlens:list]

Found 2 pending items:

1. [#fb-042] Button overlaps text on mobile
   - URL: /pricing
   - Console errors: 0
   - 10 minutes ago

2. [#fb-041] Form doesn't submit
   - URL: /contact
   - Console errors: 3
   - 25 minutes ago

You: Fix the button issue

Claude: [devlens:view fb-042]

[Shows screenshot with the overlapping button]

I can see the issue - the button has position: absolute without proper responsive constraints.
Let me fix this.

[Applies CSS fix]

[devlens:resolve fb-042 --note "Added responsive positioning"]

The issue has been fixed and deployed.
```

---

## API Reference

### POST /api/feedback

Submit new feedback from the extension.

```typescript
// Request
{
  projectId: string;
  apiKey: string;
  type: 'screenshot' | 'element' | 'fullpage';
  screenshot: string; // base64 or blob URL
  url: string;
  viewport: { width: number; height: number };
  consoleErrors?: Array<{ type: string; message: string }>;
  element?: { selector: string; rect: DOMRect };
  notes?: string;
}

// Response
{
  id: string;
  status: 'pending';
  createdAt: string;
}
```

### GET /api/feedback

List feedback for a project.

```typescript
// Query params
?projectId=xxx
&status=pending|in_progress|resolved
&limit=10
&offset=0

// Response
{
  items: Feedback[];
  total: number;
  hasMore: boolean;
}
```

### PUT /api/feedback/:id

Update feedback status.

```typescript
// Request
{
  status: 'in_progress' | 'resolved';
  resolution?: string;
}
```

---

## Project Structure

```
devlens/
├── apps/
│   ├── web/                    # Next.js 15 dashboard
│   │   ├── app/
│   │   │   ├── (auth)/         # Clerk sign-in/up
│   │   │   ├── (dashboard)/    # Main dashboard UI
│   │   │   ├── (marketing)/    # Landing page
│   │   │   └── api/            # API routes
│   │   ├── components/         # React components
│   │   └── lib/                # Utilities
│   │
│   └── extension/              # Chrome extension
│       ├── src/
│       │   ├── background.ts   # Service worker
│       │   ├── content.ts      # Content script
│       │   ├── popup/          # Extension popup UI
│       │   └── services/       # API client
│       └── manifest.json
│
├── packages/
│   ├── shared/                 # Shared TypeScript types
│   └── claude-plugin/          # Claude Code integration
│       ├── src/index.ts
│       └── SKILL.md            # Plugin documentation
│
└── turbo.json                  # Turborepo config
```

---

## Development

### Commands

```bash
# Start all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check
pnpm typecheck
```

### Adding a new feature

1. Create a branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run tests: `pnpm test`
4. Submit PR

---

## Troubleshooting

### Extension not capturing screenshots

- Ensure the website allows screen capture
- Check that the extension has permissions for the URL
- Try refreshing the page

### Dashboard shows 500 error

- Check Clerk API keys are correctly set
- Verify Postgres connection string
- Check Vercel function logs

### Plugin commands not working

- Verify `DEVLENS_API_KEY` is set
- Check the API URL is accessible
- Try `devlens:sync` to refresh configuration

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- **Live Demo**: https://web-five-pi-52.vercel.app
- **Documentation**: [docs/](./docs)
- **Chrome Extension**: Coming to Chrome Web Store
- **GitHub**: https://github.com/DafnckStudio/devlens

---

Built with by [DafnckStudio](https://dafnck.com)
