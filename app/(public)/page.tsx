import { Metadata } from 'next'
import Link from 'next/link'
import { Search, Brain, Zap, Share2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ResearchFlow - AI-Powered Research Assistant',
  description: 'Search the web, get AI summaries, explore follow-up questions. Powered by GPT-4 and Serper.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold">ResearchFlow</div>
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

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Smarter Research, Faster Results
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Search the web, get AI-powered summaries, and explore intelligent follow-up questions. All in seconds.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition text-lg"
            >
              Start Free
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border border-gray-600 hover:border-gray-400 text-white font-bold rounded-lg transition text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-700/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Search */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition">
              <Search className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Lightning Search</h3>
              <p className="text-gray-400 text-sm">
                Search the web instantly with advanced filtering and sorting
              </p>
            </div>

            {/* Summarization */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition">
              <Brain className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">AI Summaries</h3>
              <p className="text-gray-400 text-sm">
                Get 150-200 word summaries with key points and insights
              </p>
            </div>

            {/* Follow-up Questions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition">
              <Zap className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Smart Questions</h3>
              <p className="text-gray-400 text-sm">
                Explore follow-up questions to dig deeper into topics
              </p>
            </div>

            {/* Share */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition">
              <Share2 className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Easy Sharing</h3>
              <p className="text-gray-400 text-sm">
                Share research with shareable URLs and multiple export formats
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-700/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to research smarter?</h2>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition text-lg"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

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
