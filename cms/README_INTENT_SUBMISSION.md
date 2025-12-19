# Intent Submission API

This document describes the Intent Submission API endpoint that creates GitHub Pull Requests with intent submission markdown files.

## Endpoint

**POST** `/api/intent-submissions`

## Authentication

This endpoint requires authentication. Ensure you are logged in or provide a valid API token.

## Request Payload

```json
{
  "intent": "string (required) - The intent description",
  "testCases": "string (required) - Natural language test cases",
  "generatedMarkdown": "string (required) - Complete markdown with required headings",
  "clientRequestId": "string (required) - UUID v4 for idempotency"
}
```

### Validation Rules

1. All fields are required and must be non-empty
2. `clientRequestId` must be a valid UUID v4
3. `generatedMarkdown` must contain these exact headings:
   - `# Intent`
   - `# Natural language test cases`
   - `# Agent instructions`
   - `# Acceptance criteria`

## Response

### Success (200)

```json
{
  "pullRequestUrl": "https://github.com/owner/repo/pull/123",
  "pullRequestNumber": 123,
  "branchName": "intent/create-dashboard-20251219-032130-abc123de",
  "filePath": "biasedAdmin/intent-submissions/2025/12/19/create-dashboard-abc123de.md"
}
```

### Idempotent Response (200)

If the same `clientRequestId` is submitted again:

```json
{
  "pullRequestUrl": "https://github.com/owner/repo/pull/123",
  "pullRequestNumber": 123,
  "branchName": "intent/create-dashboard-20251219-032130-abc123de",
  "filePath": "biasedAdmin/intent-submissions/2025/12/19/create-dashboard-abc123de.md",
  "isExisting": true
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: GitHub token invalid or missing
- **404 Not Found**: GitHub repository not found
- **409 Conflict**: Branch already exists (duplicate)
- **429 Too Many Requests**: GitHub API rate limit exceeded
- **500 Internal Server Error**: Other processing errors

## Environment Configuration

Required environment variables:

```bash
# Required
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# Optional (will be inferred from git remote if not set)
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo

# Optional (defaults to 'main')
GITHUB_BASE_BRANCH=main
```

### Getting a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Required scopes:
   - `repo` (full repository access)
4. Copy token and add to `.env` file

### Repository Inference

If `GITHUB_OWNER` and `GITHUB_REPO` are not set, the system will attempt to infer them from the git remote:

```bash
git remote get-url origin
```

Supported formats:
- SSH: `git@github.com:owner/repo.git`
- HTTPS: `https://github.com/owner/repo.git`

## File Path Convention

Generated markdown files are stored in a date-based structure:

```
biasedAdmin/intent-submissions/
  └── YYYY/
      └── MM/
          └── DD/
              └── slug-shortid.md
```

Example:
```
biasedAdmin/intent-submissions/2025/12/19/create-user-dashboard-abc123de.md
```

## Branch Naming Convention

Branches are created with the pattern:

```
intent/<slug>-<timestamp>-<shortid>
```

- `slug`: First 50 chars of intent, lowercased, alphanumeric + hyphens
- `timestamp`: UTC timestamp in format `YYYYMMDD-HHMMSS`
- `shortid`: 8-character random hex string

Example:
```
intent/create-user-dashboard-20251219-032130-abc123de
```

## Pull Request Format

### Title
```
Intent: <first 60 chars of intent>
```

### Body
```markdown
## Summary
<first 200 chars of intent>

**Test Cases**: X test cases defined

**File**: `biasedAdmin/intent-submissions/2025/12/19/slug-shortid.md`
```

## Local Development

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your GitHub token to `.env`:
   ```bash
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
   ```

3. (Optional) Set owner/repo if inference fails:
   ```bash
   GITHUB_OWNER=your-org
   GITHUB_REPO=your-repo
   ```

### Testing

1. Start the CMS:
   ```bash
   npm run develop --workspace=cms
   ```

2. The endpoint will be available at:
   ```
   http://localhost:1337/api/intent-submissions
   ```

3. Use the frontend form at:
   ```
   http://localhost:3000/admin/intent-submission
   ```

## Idempotency

The system uses the `clientRequestId` to ensure idempotency:

1. Each submission is stored in the Strapi database
2. If the same `clientRequestId` is submitted again, the original PR URL is returned
3. No new branch or PR is created for duplicate submissions

This prevents accidental duplicate PRs when users refresh or retry submissions.

## Error Handling

The endpoint provides clear error messages for common issues:

| Error | Cause | Solution |
|-------|-------|----------|
| "GitHub integration not configured" | GITHUB_TOKEN missing | Add GITHUB_TOKEN to .env |
| "Could not determine GitHub repository" | Repository inference failed | Set GITHUB_OWNER and GITHUB_REPO |
| "GitHub authentication failed" | Invalid token | Check GITHUB_TOKEN is valid |
| "Repository not found" | Wrong owner/repo | Verify GITHUB_OWNER and GITHUB_REPO |
| "Branch already exists" | Duplicate branch name (rare) | This indicates a collision; retry will generate new shortid |
| "GitHub API rate limit exceeded" | Too many requests | Wait and retry later |

## Security

- ✅ GitHub token is server-side only (never sent to frontend)
- ✅ All GitHub operations happen in Strapi backend
- ✅ Authentication required for endpoint access
- ✅ Tokens are never logged or exposed in error messages
