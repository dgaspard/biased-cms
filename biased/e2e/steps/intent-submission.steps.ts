import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page } from './hooks';

Given('I navigate to the intent submission page', async () => {
    await page.goto('http://localhost:3000/admin/intent-submission');
});

When('I fill in the intent field with {string}', async (intent: string) => {
    await page.fill('#intent', intent);
});

When('I fill in the test cases field with:', async (testCases: string) => {
    await page.fill('#testCases', testCases);
});

When('I click the {string} button', async (buttonText: string) => {
    await page.click(`button:has-text("${buttonText}")`);
});

Then('I should see a markdown preview', async () => {
    const preview = page.locator('pre');
    await expect(preview).toBeVisible();
    const content = await preview.textContent();
    expect(content).not.toBe('Click "Generate AI prompt" to see preview...');
});

Then('the preview should contain {string}', async (text: string) => {
    const preview = page.locator('pre');
    const content = await preview.textContent();
    expect(content).toContain(text);
});

Then('I should see a success message', async () => {
    await expect(page.locator('text=PR Created Successfully!')).toBeVisible();
});

Then('I should see a PR URL link', async () => {
    await expect(page.locator('a[href*="pull"]')).toBeVisible();
});
