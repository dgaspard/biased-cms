/**
 * GitHub service for creating pull requests with intent submissions
 * Uses Octokit for GitHub API interactions
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitHubConfig {
    token: string;
    owner?: string;
    repo?: string;
    baseBranch?: string;
}

export interface PRResult {
    pullRequestUrl: string;
    pullRequestNumber: number;
    branchName: string;
    filePath: string;
}

/**
 * Infer GitHub owner and repo from git remote
 */
export async function inferGitHubRepo(): Promise<{ owner: string; repo: string } | null> {
    try {
        const { stdout } = await execAsync('git remote get-url origin');
        const url = stdout.trim();

        // Parse SSH format: git@github.com:owner/repo.git
        const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
        if (sshMatch) {
            return { owner: sshMatch[1], repo: sshMatch[2] };
        }

        // Parse HTTPS format: https://github.com/owner/repo.git
        const httpsMatch = url.match(/https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
        if (httpsMatch) {
            return { owner: httpsMatch[1], repo: httpsMatch[2] };
        }

        return null;
    } catch (error) {
        console.log('[GitHub] Could not infer repository from git remote:', error.message);
        return null;
    }
}

/**
 * Get GitHub configuration from environment variables
 */
export async function getGitHubConfig(): Promise<GitHubConfig> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error(
            'GitHub integration not configured. GITHUB_TOKEN environment variable is required.'
        );
    }

    let owner = process.env.GITHUB_OWNER;
    let repo = process.env.GITHUB_REPO;

    // Try to infer if not explicitly set
    if (!owner || !repo) {
        const inferred = await inferGitHubRepo();
        if (inferred) {
            owner = owner || inferred.owner;
            repo = repo || inferred.repo;
        }
    }

    if (!owner || !repo) {
        throw new Error(
            'Could not determine GitHub repository. Please set GITHUB_OWNER and GITHUB_REPO environment variables.'
        );
    }

    return {
        token,
        owner,
        repo,
        baseBranch: process.env.GITHUB_BASE_BRANCH || 'main',
    };
}

/**
 * Create a GitHub pull request with the intent submission markdown
 */
export async function createPullRequest(
    markdown: string,
    branchName: string,
    filePath: string,
    intent: string,
    testCasesCount: number
): Promise<PRResult> {
    // Dynamic import for Octokit (CommonJS compatibility)
    const { Octokit } = await import('octokit');

    const config = await getGitHubConfig();
    const octokit = new Octokit({ auth: config.token });

    const owner = config.owner!;
    const repo = config.repo!;
    const baseBranch = config.baseBranch!;

    try {
        // Step 1: Get base branch SHA
        console.log(`[GitHub] Getting base branch SHA for ${baseBranch}...`);
        const { data: refData } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref: `heads/${baseBranch}`,
        });

        const baseSha = refData.object.sha;
        console.log(`[GitHub] Base SHA: ${baseSha}`);

        // Step 2: Create new branch
        console.log(`[GitHub] Creating branch: ${branchName}...`);
        try {
            await octokit.rest.git.createRef({
                owner,
                repo,
                ref: `refs/heads/${branchName}`,
                sha: baseSha,
            });
        } catch (error: any) {
            if (error.status === 422 && error.message?.includes('already exists')) {
                throw new Error(
                    `Branch ${branchName} already exists. This may be a duplicate submission.`
                );
            }
            throw error;
        }

        // Step 3: Create file on new branch
        console.log(`[GitHub] Creating file: ${filePath}...`);
        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: `Add intent submission: ${intent.substring(0, 50)}`,
            content: Buffer.from(markdown).toString('base64'),
            branch: branchName,
        });

        // Step 4: Create pull request
        const slug = branchName.split('/')[1] || 'intent-submission';
        const shortTitle = intent.length > 60 ? intent.substring(0, 57) + '...' : intent;
        const intentSummary = intent.length > 200 ? intent.substring(0, 197) + '...' : intent;

        const prBody = `## Summary\n${intentSummary}\n\n**Test Cases**: ${testCasesCount} test cases defined\n\n**File**: \`${filePath}\``;

        console.log(`[GitHub] Creating pull request...`);
        const { data: prData } = await octokit.rest.pulls.create({
            owner,
            repo,
            title: `Intent: ${shortTitle}`,
            body: prBody,
            head: branchName,
            base: baseBranch,
        });

        console.log(`[GitHub] Pull request created: ${prData.html_url}`);

        return {
            pullRequestUrl: prData.html_url,
            pullRequestNumber: prData.number,
            branchName,
            filePath,
        };
    } catch (error: any) {
        // Handle GitHub API errors with clear messages
        if (error.status === 401 || error.status === 403) {
            throw new Error('GitHub authentication failed. Check GITHUB_TOKEN.');
        } else if (error.status === 404) {
            throw new Error(`Repository not found. Check GITHUB_OWNER and GITHUB_REPO.`);
        } else if (error.status === 403 && error.message?.includes('rate limit')) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
        } else if (error.message) {
            throw new Error(`GitHub API error: ${error.message}`);
        } else {
            throw new Error(`GitHub API error: ${JSON.stringify(error)}`);
        }
    }
}
