"use client";

import { useState } from 'react';
import { generateIntentMarkdown } from '../../lib/intentMarkdownGenerator';


export default function IntentSubmissionPage() {
    const [intent, setIntent] = useState('');
    const [testCases, setTestCases] = useState('');
    const [generatedMarkdown, setGeneratedMarkdown] = useState('');
    const [errors, setErrors] = useState<{ intent?: string; testCases?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [prUrl, setPrUrl] = useState('');

    // Track if inputs changed after markdown generation
    const [isDirty, setIsDirty] = useState(false);

    const handleGenerate = () => {
        // Validate
        const newErrors: { intent?: string; testCases?: string } = {};
        if (!intent.trim()) {
            newErrors.intent = 'Intent is required';
        }
        if (!testCases.trim()) {
            newErrors.testCases = 'Test cases are required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear errors and generate markdown
        setErrors({});
        const markdown = generateIntentMarkdown(intent, testCases);
        setGeneratedMarkdown(markdown);
        setIsDirty(false);
        setSubmitSuccess(false);
        setSubmitError('');
    };

    const handleInputChange = (field: 'intent' | 'testCases', value: string) => {
        if (field === 'intent') {
            setIntent(value);
        } else {
            setTestCases(value);
        }

        // Mark as dirty if markdown was already generated
        if (generatedMarkdown) {
            setIsDirty(true);
        }
    };

    const handleSubmit = async () => {
        if (!generatedMarkdown || isDirty) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
            const clientRequestId = crypto.randomUUID();

            const response = await fetch(`${strapiUrl}/api/intent-submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    intent,
                    testCases,
                    generatedMarkdown,
                    clientRequestId,
                }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Backend endpoint not yet implemented. Please check Strapi configuration.');
                }
                throw new Error(`Submission failed: ${response.statusText}`);
            }

            const result = await response.json();
            setPrUrl(result.prUrl || '#');
            setSubmitSuccess(true);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'An error occurred during submission');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(prUrl);
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-foreground font-sans">
                    Intent Submission
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="space-y-6">
                        {/* Intent Field */}
                        <div>
                            <label htmlFor="intent" className="block text-sm font-semibold mb-2 text-foreground">
                                Intent <span className="text-warning">*</span>
                            </label>
                            <textarea
                                id="intent"
                                value={intent}
                                onChange={(e) => handleInputChange('intent', e.target.value)}
                                className={`w-full h-32 px-4 py-3 rounded-lg border-2 ${errors.intent ? 'border-warning' : 'border-gray-200'
                                    } focus:border-primary focus:outline-none text-foreground bg-white`}
                                placeholder="Describe the business intent..."
                            />
                            {errors.intent && (
                                <p className="mt-1 text-sm text-warning">{errors.intent}</p>
                            )}
                        </div>

                        {/* Test Cases Field */}
                        <div>
                            <label htmlFor="testCases" className="block text-sm font-semibold mb-2 text-foreground">
                                Test Cases <span className="text-warning">*</span>
                            </label>
                            <textarea
                                id="testCases"
                                value={testCases}
                                onChange={(e) => handleInputChange('testCases', e.target.value)}
                                className={`w-full h-48 px-4 py-3 rounded-lg border-2 ${errors.testCases ? 'border-warning' : 'border-gray-200'
                                    } focus:border-primary focus:outline-none text-foreground bg-white font-mono text-sm`}
                                placeholder="Enter natural language test cases (one per line or separated by blank lines)"
                            />
                            {errors.testCases && (
                                <p className="mt-1 text-sm text-warning">{errors.testCases}</p>
                            )}
                            <p className="mt-1 text-sm text-text-secondary">
                                Enter natural language test cases (one per line or separated by blank lines).
                            </p>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            className="w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition-colors"
                        >
                            Generate AI prompt
                        </button>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!generatedMarkdown || isDirty || isSubmitting || submitSuccess}
                            className="w-full py-3 px-6 rounded-lg bg-teal text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        >
                            {isSubmitting ? 'Creating PR...' : 'Submit'}
                        </button>

                        {isDirty && generatedMarkdown && (
                            <p className="text-sm text-warning">
                                Inputs have changed. Click "Generate AI prompt" again to update the markdown before submitting.
                            </p>
                        )}

                        {/* Success State */}
                        {submitSuccess && prUrl && (
                            <div className="p-4 rounded-lg bg-secondary/10 border-2 border-secondary">
                                <p className="text-sm font-semibold mb-2 text-foreground">PR Created Successfully!</p>
                                <div className="flex gap-2">
                                    <a
                                        href={prUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {prUrl}
                                    </a>
                                    <button
                                        onClick={handleCopyLink}
                                        className="text-sm text-teal hover:underline"
                                    >
                                        Copy link
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {submitError && (
                            <div className="p-4 rounded-lg bg-warning/10 border-2 border-warning">
                                <p className="text-sm font-semibold text-warning">{submitError}</p>
                            </div>
                        )}
                    </div>

                    {/* Preview Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2 text-foreground">Markdown Preview</h2>
                        <pre className="w-full h-[600px] overflow-auto p-4 rounded-lg bg-gray-50 border-2 border-gray-200 text-sm font-mono text-foreground whitespace-pre-wrap">
                            {generatedMarkdown || 'Click "Generate AI prompt" to see preview...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
