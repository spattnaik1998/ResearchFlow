import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - ResearchFlow',
  description: 'Privacy policy for ResearchFlow.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-amber-400 transition">
            ResearchFlow
          </Link>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Last updated: March 2026
          </p>

          <div className="space-y-12 text-gray-300">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-3">
                ResearchFlow (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates the ResearchFlow website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
            </section>

            {/* Information Collection */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <p className="mb-3">We collect different types of information for various purposes to provide and improve our Service:</p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li><strong>Account Information:</strong> Email address, name, and authentication credentials when you sign up</li>
                <li><strong>Search History:</strong> Your search queries, summaries generated, and notes created within ResearchFlow</li>
                <li><strong>Analytics Data:</strong> Information about how you use ResearchFlow (e.g., features accessed, time spent, interactions)</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and other technical information</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Store Your Data</h2>
              <p className="mb-3">
                Your data is stored securely using Supabase, a cloud-based platform that provides encrypted storage and automatic backups. All data is stored with Row-Level Security (RLS) policies to ensure that only you can access your own information.
              </p>
              <p className="mb-3">
                Search history, notes, and user metadata are stored in our Supabase database and are tied to your user account. You have full control over your data and can request deletion at any time.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
              <p className="mb-3">
                ResearchFlow uses the following third-party services, and your data may be shared with them as necessary:
              </p>
              <ul className="list-disc list-inside space-y-3">
                <li>
                  <strong>OpenAI (GPT-4):</strong> Your search queries and web content are sent to OpenAI to generate summaries and answer follow-up questions. Data is processed according to OpenAI&apos;s privacy policy.
                </li>
                <li>
                  <strong>Serper:</strong> Your search queries are sent to Serper to retrieve web search results. Data is processed according to Serper&apos;s privacy policy.
                </li>
                <li>
                  <strong>Supabase:</strong> All your account data, search history, and notes are stored on Supabase servers. Data is encrypted at rest and in transit.
                </li>
              </ul>
            </section>

            {/* Analytics */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Analytics & Logging</h2>
              <p className="mb-3">
                We collect anonymized usage analytics to understand how ResearchFlow is used and to improve our service. This includes information about:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Number of searches performed</li>
                <li>Features used (summaries, questions, knowledge base)</li>
                <li>Time spent on the application</li>
                <li>Errors encountered and debugging information</li>
              </ul>
              <p className="mt-3">
                Analytics data is stored with your user ID for segmentation but is not shared with third parties beyond what is necessary for service improvement.
              </p>
            </section>

            {/* Data Deletion */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Deletion &amp; Right to Be Forgotten</h2>
              <p className="mb-3">
                You have the right to request deletion of your account and all associated data. To request data deletion:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Sign in to your ResearchFlow account</li>
                <li>Go to Settings → Privacy & Data</li>
                <li>Click &quot;Delete My Account&quot; and confirm</li>
              </ol>
              <p className="mt-3">
                Your account and all associated search history, notes, and personal data will be permanently deleted from our servers within 30 days.
              </p>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Security of Data</h2>
              <p className="mb-3">
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. We use industry-standard encryption and security practices, including:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>HTTPS/TLS for all data in transit</li>
                <li>Encrypted storage via Supabase</li>
                <li>Row-Level Security policies to restrict data access</li>
                <li>Regular security audits and vulnerability assessments</li>
              </ul>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Privacy Policy</h2>
              <p className="mb-3">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this page.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
              <p className="mb-3">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-amber-400">
                Email: privacy@researchflow.ai
              </p>
            </section>
          </div>

          {/* Back Links */}
          <div className="mt-16 pt-8 border-t border-gray-700 flex gap-6 text-gray-400">
            <Link href="/" className="hover:text-white transition">
              ← Back to Home
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms & Conditions →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 py-8 px-4 sm:px-6 lg:px-8 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p>&copy; 2026 ResearchFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
