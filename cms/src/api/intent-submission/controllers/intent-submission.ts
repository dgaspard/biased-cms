/**
 * intent-submission controller
 * Handles intent submission with GitHub PR creation
 */

import {
    validateSubmission,
    generateBranchName,
    generateFilePath,
    countTestCases,
    createSlug,
} from '../services/validation';
import { createPullRequest } from '../services/github';

export default {
    async create(ctx) {
        try {
            const { intent, testCases, generatedMarkdown, clientRequestId } = ctx.request.body;

            // Step 1: Validate submission data
            const validationErrors = validateSubmission({
                intent,
                testCases,
                generatedMarkdown,
                clientRequestId,
            });

            if (validationErrors.length > 0) {
                return ctx.badRequest('Validation failed', {
                    errors: validationErrors,
                });
            }

            // Step 2: Check idempotency - has this clientRequestId been submitted before?
            const existingSubmission = await strapi.entityService.findMany(
                'api::intent-submission.intent-submission' as any,
                {
                    filters: { clientRequestId },
                    limit: 1,
                }
            );

            if (existingSubmission && existingSubmission.length > 0) {
                const existing = existingSubmission[0];
                console.log(`[Intent Submission] Returning existing PR for ${clientRequestId}`);
                return ctx.send({
                    pullRequestUrl: existing.pullRequestUrl,
                    pullRequestNumber: existing.pullRequestNumber,
                    branchName: existing.branchName,
                    filePath: existing.filePath,
                    isExisting: true,
                });
            }

            // Step 3: Generate branch and file names
            const branchName = generateBranchName(intent);
            const filePath = generateFilePath(intent);
            const testCasesCount = countTestCases(testCases);

            console.log('[Intent Submission] Creating GitHub PR:', {
                clientRequestId,
                branchName,
                filePath,
                testCasesCount,
            });

            // Step 4: Create GitHub Pull Request
            const prResult = await createPullRequest(
                generatedMarkdown,
                branchName,
                filePath,
                intent,
                testCasesCount
            );

            // Step 5: Persist submission for idempotency
            await strapi.entityService.create('api::intent-submission.intent-submission' as any, {
                data: {
                    clientRequestId,
                    pullRequestUrl: prResult.pullRequestUrl,
                    pullRequestNumber: prResult.pullRequestNumber,
                    branchName: prResult.branchName,
                    filePath: prResult.filePath,
                    intent: intent.substring(0, 1000), // Store first 1000 chars for reference
                    testCases: testCases.substring(0, 1000),
                },
            });

            console.log(`[Intent Submission] PR created successfully: ${prResult.pullRequestUrl}`);

            // Step 6: Return success response
            ctx.send({
                pullRequestUrl: prResult.pullRequestUrl,
                pullRequestNumber: prResult.pullRequestNumber,
                branchName: prResult.branchName,
                filePath: prResult.filePath,
            });
        } catch (error: any) {
            console.error('[Intent Submission] Error:', error);

            // Handle specific error cases
            if (error.message?.includes('GitHub integration not configured')) {
                return ctx.unauthorized(error.message);
            } else if (error.message?.includes('Could not determine GitHub repository')) {
                return ctx.internalServerError(error.message);
            } else if (error.message?.includes('GitHub authentication failed')) {
                return ctx.unauthorized(error.message);
            } else if (error.message?.includes('Repository not found')) {
                return ctx.notFound(error.message);
            } else if (error.message?.includes('Branch') && error.message?.includes('already exists')) {
                return ctx.conflict(error.message);
            } else if (error.message?.includes('rate limit')) {
                return ctx.tooManyRequests(error.message);
            } else {
                return ctx.internalServerError(`Error processing intent submission: ${error.message}`);
            }
        }
    },
};
