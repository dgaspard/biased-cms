import { test } from 'node:test';
import assert from 'node:assert';
import { parseTestCases, deriveTitle, generateIntentMarkdown } from './intentMarkdownGenerator.js';


test('parseTestCases - splits on blank lines', () => {
    const input = `Test case 1

Test case 2

Test case 3`;
    const result = parseTestCases(input);
    assert.deepStrictEqual(result, ['Test case 1', 'Test case 2', 'Test case 3']);
});

test('parseTestCases - splits on newlines when no blank lines', () => {
    const input = `Test case 1
Test case 2
Test case 3`;
    const result = parseTestCases(input);
    assert.deepStrictEqual(result, ['Test case 1', 'Test case 2', 'Test case 3']);
});

test('parseTestCases - filters empty entries', () => {
    const input = `Test case 1

Test case 2


`;
    const result = parseTestCases(input);
    assert.deepStrictEqual(result, ['Test case 1', 'Test case 2']);
});

test('parseTestCases - handles empty input', () => {
    const result = parseTestCases('');
    assert.deepStrictEqual(result, []);
});

test('deriveTitle - takes first 60 chars', () => {
    const longIntent = 'A'.repeat(100);
    const result = deriveTitle(longIntent);
    assert.strictEqual(result.length, 60);
});

test('deriveTitle - collapses whitespace', () => {
    const input = 'Multiple   spaces    and\n\nnewlines';
    const result = deriveTitle(input);
    assert.strictEqual(result, 'Multiple spaces and newlines');
});

test('deriveTitle - handles empty input', () => {
    const result = deriveTitle('');
    assert.strictEqual(result, 'Untitled Intent');
});

test('generateIntentMarkdown - creates valid markdown structure', () => {
    const intent = 'Create a dashboard for monitoring AI behavior';
    const testCases = `User can view real-time metrics
User can export reports
System sends alerts on anomalies`;

    const result = generateIntentMarkdown(intent, testCases);

    // Check frontmatter
    assert.ok(result.startsWith('---'));
    assert.ok(result.includes('title:'));
    assert.ok(result.includes('createdAt:'));
    assert.ok(result.includes('source: intent-submission-ui'));

    // Check sections
    assert.ok(result.includes('# Intent'));
    assert.ok(result.includes('# Natural language test cases'));
    assert.ok(result.includes('# Agent instructions'));
    assert.ok(result.includes('# Acceptance criteria'));

    // Check test cases are bulleted
    assert.ok(result.includes('- User can view real-time metrics'));
    assert.ok(result.includes('- User can export reports'));
    assert.ok(result.includes('- System sends alerts on anomalies'));
});

test('generateIntentMarkdown - uses derived title', () => {
    const intent = 'Short intent';
    const result = generateIntentMarkdown(intent, 'Test case');
    assert.ok(result.includes('title: Short intent'));
});

test('generateIntentMarkdown - includes ISO timestamp', () => {
    const result = generateIntentMarkdown('Intent', 'Test');
    const timestampMatch = result.match(/createdAt: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
    assert.ok(timestampMatch, 'Should include ISO timestamp');
});
