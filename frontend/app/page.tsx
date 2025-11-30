import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.png"
                alt="BIASED Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold font-sans text-primary">BIASED</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-text-secondary">
            <a href="#" className="hover:text-primary transition-colors">Framework</a>
            <a href="#" className="hover:text-primary transition-colors">CLI</a>
            <a href="#" className="hover:text-primary transition-colors">Manifest</a>
          </nav>
          <a
            href="mailto:dustin@example.com"
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-secondary"
          >
            Get Started
          </a>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-20 lg:py-32">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-block rounded-full bg-teal/10 px-4 py-1.5 text-sm font-semibold text-teal mb-8">
              The AI Lifecycle Operating System
            </div>
            <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl font-sans mb-6">
              Project Management for <br />
              <span className="text-primary">AI Development</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-text-secondary mb-10 leading-relaxed">
              Agile breaks with AI. BIASED is the governance-first framework that aligns
              business intent with AI behavior, ensuring your models are trustworthy,
              compliant, and actually adopted.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#"
                className="w-full sm:w-auto rounded-lg bg-primary px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-secondary hover:shadow-xl"
              >
                Install the CLI
              </a>
              <a
                href="#"
                className="w-full sm:w-auto rounded-lg border-2 border-gray-200 bg-white px-8 py-4 text-base font-bold text-foreground transition-all hover:border-primary hover:text-primary"
              >
                Read the Strategy
              </a>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-24 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold font-sans text-foreground mb-4">Why Legacy Frameworks Fail</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                AI lowers the floor for demos but raises the ceiling for production.
                Traditional Agile and Scrum can't handle the probabilistic nature of AI.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-warning text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold font-sans mb-2">Drift & Hallucinations</h3>
                <p className="text-text-secondary">
                  Without continuous evaluation, models degrade. "Done" in Agile doesn't account for behavioral drift.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-warning text-4xl mb-4">🛑</div>
                <h3 className="text-xl font-bold font-sans mb-2">Governance Bottlenecks</h3>
                <p className="text-text-secondary">
                  Security and compliance are treated as afterthoughts, causing projects to stall right before release.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-warning text-4xl mb-4">📉</div>
                <h3 className="text-xl font-bold font-sans mb-2">Low Adoption</h3>
                <p className="text-text-secondary">
                  Developers build cool tech, but without clear business intent and change management, users don't trust it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution (BIASED Pillars) */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold font-sans text-teal mb-4">The BIASED Approach</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                A comprehensive operating model that connects strategy to execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Intent */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border-t-4 border-primary">
                <h3 className="mb-3 text-2xl font-bold font-sans text-foreground">Intent</h3>
                <p className="text-text-secondary mb-4">
                  Define business value first. Move from "User Stories" to "Intent Statements" that define clear outcomes.
                </p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-center gap-2">✅ Business Value Alignment</li>
                  <li className="flex items-center gap-2">✅ Clear Success Metrics</li>
                </ul>
              </div>

              {/* Behavior */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border-t-4 border-secondary">
                <h3 className="mb-3 text-2xl font-bold font-sans text-foreground">Behavior</h3>
                <p className="text-text-secondary mb-4">
                  Specify expected AI behaviors. Map intent to deterministic and probabilistic boundaries.
                </p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-center gap-2">✅ Behavior Specifications</li>
                  <li className="flex items-center gap-2">✅ Edge Case Definition</li>
                </ul>
              </div>

              {/* Evaluation */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border-t-4 border-accent">
                <h3 className="mb-3 text-2xl font-bold font-sans text-foreground">Evaluation</h3>
                <p className="text-text-secondary mb-4">
                  Test continuously. Catch drift and regression before your customers do.
                </p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-center gap-2">✅ Automated Evals</li>
                  <li className="flex items-center gap-2">✅ Drift Detection</li>
                </ul>
              </div>

              {/* Governance */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border-t-4 border-warning">
                <h3 className="mb-3 text-2xl font-bold font-sans text-foreground">Governance</h3>
                <p className="text-text-secondary mb-4">
                  Safety by design. Integrate risk, compliance, and security into the daily workflow.
                </p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-center gap-2">✅ Risk Registers</li>
                  <li className="flex items-center gap-2">✅ Compliance Checks</li>
                </ul>
              </div>

              {/* Adoption */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border-t-4 border-teal">
                <h3 className="mb-3 text-2xl font-bold font-sans text-foreground">Adoption</h3>
                <p className="text-text-secondary mb-4">
                  Manage the human side of AI. Focus on trust, training, and workflow integration.
                </p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-center gap-2">✅ UX Workflow Maps</li>
                  <li className="flex items-center gap-2">✅ Change Management</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-teal text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold font-sans mb-6">Stop Building Demos. Start Building Products.</h2>
            <p className="text-blue-50 max-w-2xl mx-auto mb-10 text-lg">
              Adopt the framework that turns AI potential into reliable business value.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-yellow-500"
              >
                Get Started with BIASED
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="BIASED Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold font-sans text-gray-900">BIASED</span>
          </div>
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} BIASED Framework. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
