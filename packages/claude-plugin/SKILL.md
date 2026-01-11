# DevLens - Visual Feedback Integration

DevLens captures screenshots, console errors, and user feedback from websites and routes them to Claude Code for automated fixes.

## Commands

### `devlens:list`
List all pending feedback items for the current project.

**Usage:**
```
devlens:list [--status <status>] [--limit <n>]
```

**Options:**
- `--status`: Filter by status (pending, in_progress, resolved)
- `--limit`: Number of items to show (default: 10)

### `devlens:view <id>`
View detailed feedback information including screenshot, console errors, and element info.

**Usage:**
```
devlens:view <feedback-id>
```

### `devlens:resolve <id>`
Mark a feedback item as resolved after fixing the issue.

**Usage:**
```
devlens:resolve <feedback-id> [--note "Fix applied"]
```

### `devlens:sync`
Sync local project URL mappings with the DevLens dashboard.

**Usage:**
```
devlens:sync
```

## Configuration

The plugin reads configuration from environment variables or `.env.local`:

```bash
DEVLENS_API_KEY=your_api_key
DEVLENS_PROJECT_ID=your_project_id
DEVLENS_API_URL=https://devlens.vercel.app/api
```

## Workflow

1. User captures feedback via Chrome extension
2. Feedback is sent to DevLens API
3. Claude Code plugin fetches pending feedback
4. Claude analyzes screenshot and errors
5. Claude suggests or implements fixes
6. Feedback is marked as resolved

## Example Session

```
User: Check if there's any pending feedback for this project

Claude: Let me check the DevLens dashboard for pending feedback.

[devlens:list]

Found 3 pending feedback items:

1. [#fb-001] Button not visible on mobile
   - URL: /dashboard
   - Console errors: 0
   - 5 minutes ago

2. [#fb-002] Form validation error
   - URL: /settings
   - Console errors: 2
   - 12 minutes ago

3. [#fb-003] Layout broken in Safari
   - URL: /pricing
   - Console errors: 0
   - 1 hour ago

User: Show me the details of the first one

Claude: [devlens:view fb-001]

[Shows screenshot with annotations]
[Shows element info: button.submit-btn]
[Shows viewport: 375x667 (mobile)]

The issue is that the submit button has `display: none` on screens under 400px.
I'll fix this by adjusting the responsive styles.

[Applies fix]

[devlens:resolve fb-001 --note "Fixed responsive styles for mobile"]
```

## Integration with Project Detection

DevLens automatically detects which project feedback belongs to by matching URLs:

- `localhost:3000` → Local development
- `myapp.vercel.app` → Staging
- `myapp.com` → Production

Configure URL mappings in the DevLens dashboard to ensure feedback is routed correctly.
