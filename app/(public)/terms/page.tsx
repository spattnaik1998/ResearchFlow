import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions - ResearchFlow',
  description: 'Terms and conditions for using ResearchFlow.',
}

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Last updated: March 2026
          </p>

          <div className="space-y-12 text-gray-300">
            {/* Acceptance */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-3">
                By accessing and using ResearchFlow, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Use License */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
              <p className="mb-3">
                Permission is granted to temporarily download one copy of the materials (information or software) on ResearchFlow for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile, reverse engineer any software contained on ResearchFlow</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
                <li>Using the materials for any unlawful purpose or in violation of any applicable law or regulation</li>
              </ul>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Content</h2>
              <p className="mb-3">
                In these terms and conditions, &quot;User Content&quot; shall mean any audio, video, text, images, or other material you choose to display on this website. By displaying User Content, you grant ResearchFlow a non-exclusive, worldwide, irrevocable license to reproduce, adapt, modify, publish, and distribute it in any media.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Disclaimer</h2>
              <p className="mb-3">
                The materials on ResearchFlow are provided &quot;as is&quot;. ResearchFlow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Limitations</h2>
              <p className="mb-3">
                In no event shall ResearchFlow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ResearchFlow, even if ResearchFlow or a ResearchFlow authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Uses</h2>
              <p className="mb-3">
                You may not use ResearchFlow for any unlawful purpose or in violation of any applicable law or regulation. Specifically, you agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon any intellectual property rights</li>
                <li>Harass, abuse, or harm any person</li>
                <li>Transmit obscene or offensive content</li>
                <li>Disrupt the normal flow of dialogue within ResearchFlow</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Third-Party Services</h2>
              <p className="mb-3">
                ResearchFlow uses third-party services including Supabase (for data storage), OpenAI (for AI summaries), and Serper (for web search). Your use of ResearchFlow is also governed by the terms and policies of these third-party providers.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
              <p className="mb-3">
                ResearchFlow may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
              <p className="mb-3">
                If you have any questions about these Terms & Conditions, please contact us at support@researchflow.ai
              </p>
            </section>
          </div>

          {/* Back Links */}
          <div className="mt-16 pt-8 border-t border-gray-700 flex gap-6 text-gray-400">
            <Link href="/" className="hover:text-white transition">
              ← Back to Home
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy →
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
