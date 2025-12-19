/**
 * Parse test cases from user input
 * - If input contains blank lines, split on blank lines
 * - Else split on newlines
 * - Trim and remove empty entries
 */
export function parseTestCases(input: string): string[] {
    if (!input || !input.trim()) {
        return [];
    }

    // Check if input has blank lines (two or more consecutive newlines)
    const hasBlankLines = /\n\s*\n/.test(input);

    let cases: string[];
    if (hasBlankLines) {
        // Split on blank lines
        cases = input.split(/\n\s*\n/);
    } else {
        // Split on single newlines
        cases = input.split('\n');
    }

    // Trim each case and filter out empty ones
    return cases
        .map(c => c.trim())
        .filter(c => c.length > 0);
}

/**
 * Derive a title from intent text
 * - First ~60 chars, trimmed
 * - Collapse whitespace
 */
export function deriveTitle(intent: string): string {
    if (!intent || !intent.trim()) {
        return 'Untitled Intent';
    }

    // Take first 60 chars
    let title = intent.trim().substring(0, 60);

    // Collapse whitespace
    title = title.replace(/\s+/g, ' ').trim();

    return title;
}

/**
 * Generate deterministic markdown for an intent submission
 */
export function generateIntentMarkdown(intent: string, testCases: string): string {
    const title = deriveTitle(intent);
    const createdAt = new Date().toISOString();
    const parsedCases = parseTestCases(testCases);

    const markdown = `---
title: ${title}
createdAt: ${createdAt}
source: intent-submission-ui
---

# Intent
${intent.trim()}

# Natural language test cases
${parsedCases.map(tc => `- ${tc}`).join('\n')}

# Agent instructions
You are an implementation agent. Use the Intent and the test cases to implement the feature in this repository.
- Follow existing architecture and conventions.
- Prefer small, composable changes.
- Add/update automated tests where appropriate.
- Do not include secrets in code.
- Provide clear commit messages.

# Acceptance criteria
- All test cases pass (convert each natural language test case into a verifiable check).
- Form submission results in a PR that adds this markdown file.
- The PR includes only necessary changes.
`;

    return markdown;
}
