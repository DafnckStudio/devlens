import Link from 'next/link';
import { Camera, Zap, Eye, Code, ArrowRight, Check, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary-500" />
              </div>
              <span className="text-xl font-bold text-white">DevLens</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-dark-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-sm mb-6">
            <Zap className="h-4 w-4" />
            Built for AI-assisted development
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            See what your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              users see
            </span>
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Capture visual feedback, console errors, and element details. Route them
            directly to Claude Code for automated debugging and fixes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-dark-800 text-white hover:bg-dark-700 transition-colors font-medium border border-dark-700"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-dark-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything you need for visual debugging
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Camera className="h-6 w-6" />}
              title="Screenshot Capture"
              description="One-click screenshots with automatic viewport detection and element highlighting."
            />
            <FeatureCard
              icon={<Terminal className="h-6 w-6" />}
              title="Console Error Capture"
              description="Automatically captures console errors, warnings, and unhandled exceptions."
            />
            <FeatureCard
              icon={<Code className="h-6 w-6" />}
              title="Claude Code Integration"
              description="Feedback routes directly to Claude Code with full context for automated fixes."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How it works
          </h2>
          <div className="space-y-12">
            <Step
              number={1}
              title="Capture feedback"
              description="Use the Chrome extension to capture screenshots, select elements, and add comments on any website."
            />
            <Step
              number={2}
              title="Automatic context"
              description="DevLens captures viewport size, user agent, console errors, and element details automatically."
            />
            <Step
              number={3}
              title="Claude Code fixes"
              description="The Claude Code plugin fetches feedback and suggests or implements fixes directly in your codebase."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-dark-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-dark-300 text-center mb-12 max-w-xl mx-auto">
            Start free, upgrade when you need more. No credit card required.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Free"
              price="$0"
              description="Perfect for personal projects"
              features={[
                '1 project',
                '50 feedbacks/month',
                'Screenshot capture',
                'Console error capture',
                'Claude Code plugin',
              ]}
              cta="Get Started"
              href="/sign-up"
            />
            <PricingCard
              name="Pro"
              price="$19"
              description="For professional developers"
              features={[
                '10 projects',
                'Unlimited feedbacks',
                'Team collaboration',
                'Custom branding',
                'Priority support',
                'API access',
              ]}
              cta="Start Free Trial"
              href="/sign-up?plan=pro"
              highlighted
            />
            <PricingCard
              name="Team"
              price="$49"
              description="For development teams"
              features={[
                'Unlimited projects',
                'Unlimited feedbacks',
                'Unlimited team members',
                'SSO integration',
                'Dedicated support',
                'Custom integrations',
              ]}
              cta="Contact Sales"
              href="mailto:hello@devlens.dev"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your debugging workflow?
          </h2>
          <p className="text-dark-300 mb-8">
            Join developers who are fixing bugs faster with visual feedback.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium text-lg"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary-500" />
              </div>
              <span className="text-lg font-bold text-white">DevLens</span>
            </div>
            <p className="text-dark-400 text-sm">
              © {new Date().getFullYear()} DevLens. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-dark-800 border border-dark-700">
      <div className="h-12 w-12 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-dark-300">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-dark-300">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  href,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-xl border ${
        highlighted
          ? 'bg-primary-500/10 border-primary-500'
          : 'bg-dark-800 border-dark-700'
      }`}
    >
      {highlighted && (
        <div className="text-primary-400 text-sm font-medium mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <div className="mt-4 mb-2">
        <span className="text-4xl font-bold text-white">{price}</span>
        {price !== '$0' && <span className="text-dark-400">/month</span>}
      </div>
      <p className="text-dark-300 mb-6">{description}</p>
      <ul className="space-y-3 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-dark-200">
            <Check className="h-5 w-5 text-primary-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
          highlighted
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-dark-700 text-white hover:bg-dark-600'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
