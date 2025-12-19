/**
 * Validation service for intent submissions
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REQUIRED_HEADINGS = [
    '# Intent',
    '# Natural language test cases',
    '# Agent instructions',
    '# Acceptance criteria',
];

export interface ValidationError {
    field: string;
    message: string;
}

export interface SubmissionData {
    intent: string;
    testCases: string;
    generatedMarkdown: string;
    clientRequestId: string;
}

/**
 * Validate intent submission data
 * Returns array of validation errors (empty if valid)
 */
export function validateSubmission(data: SubmissionData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!data.intent || !data.intent.trim()) {
        errors.push({ field: 'intent', message: 'Intent is required and cannot be empty' });
    }

    if (!data.testCases || !data.testCases.trim()) {
        errors.push({ field: 'testCases', message: 'Test cases are required and cannot be empty' });
    }

    if (!data.generatedMarkdown || !data.generatedMarkdown.trim()) {
        errors.push({
            field: 'generatedMarkdown',
            message: 'Generated markdown is required and cannot be empty',
        });
    }

    if (!data.clientRequestId || !data.clientRequestId.trim()) {
        errors.push({
            field: 'clientRequestId',
            message: 'Client request ID is required and cannot be empty',
        });
    }

    // Validate UUID format
    if (data.clientRequestId && !UUID_PATTERN.test(data.clientRequestId)) {
        errors.push({
            field: 'clientRequestId',
            message: 'Client request ID must be a valid UUID',
        });
    }

    // Validate markdown structure
    if (data.generatedMarkdown) {
        const missingHeadings = REQUIRED_HEADINGS.filter(
            (heading) => !data.generatedMarkdown.includes(heading)
        );

        if (missingHeadings.length > 0) {
            errors.push({
                field: 'generatedMarkdown',
                message: `Markdown is missing required headings: ${missingHeadings.join(', ')}`,
            });
        }
    }

    return errors;
}

/**
 * Create a slug from intent text
 * - lowercase
 * - alphanumeric + hyphen
 * - collapse repeats
 * - max 50 chars
 */
export function createSlug(intent: string): string {
    return intent
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .substring(0, 50) // Max 50 chars
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a short random ID (8 hex chars)
 */
export function generateShortId(): string {
    return Math.random().toString(16).substring(2, 10);
}

/**
 * Format timestamp as YYYYMMDD-HHMMSS in UTC
 */
export function formatTimestamp(date: Date = new Date()): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Generate branch name: intent/<slug>-<timestamp>-<shortid>
 */
export function generateBranchName(intent: string): string {
    const slug = createSlug(intent);
    const timestamp = formatTimestamp();
    const shortId = generateShortId();

    return `intent/${slug}-${timestamp}-${shortId}`;
}

/**
 * Generate file path: biasedAdmin/intent-submissions/<yyyy>/<mm>/<dd>/<slug>-<shortid>.md
 */
export function generateFilePath(intent: string, date: Date = new Date()): string {
    const slug = createSlug(intent);
    const shortId = generateShortId();

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `biasedAdmin/intent-submissions/${year}/${month}/${day}/${slug}-${shortId}.md`;
}

/**
 * Count test cases from test cases string
 * Splits on lines and counts non-empty entries
 */
export function countTestCases(testCases: string): number {
    return testCases
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0).length;
}
