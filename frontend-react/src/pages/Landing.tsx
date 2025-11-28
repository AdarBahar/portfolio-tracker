import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Lock, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">📊 Fantasy Broker</h1>
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6">
            Track Your Investments with Confidence
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Real-time portfolio tracking, interactive charts, and comprehensive analytics to help you make smarter investment decisions.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="border border-slate-600 hover:border-slate-500 text-white px-8 py-3 rounded-lg font-semibold transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Tracking</h3>
            <p className="text-slate-400">Monitor your investments with live updates and instant notifications</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-green-500 transition">
            <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Interactive Charts</h3>
            <p className="text-slate-400">Visualize sector allocation, performance trends, and portfolio composition</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-yellow-500 transition">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Dividend Tracking</h3>
            <p className="text-slate-400">Track dividend income, estimated annual returns, and payment history</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition">
            <Lock className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
            <p className="text-slate-400">Your data is encrypted, secure, and never shared with third parties</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Take Control of Your Portfolio?</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of investors using Fantasy Broker to track and optimize their investments.
          </p>
          <Link to="/login" className="bg-white hover:bg-slate-100 text-blue-600 px-8 py-3 rounded-lg font-semibold transition inline-block">
            Start Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-slate-400">
          <p>&copy; 2025 Fantasy Broker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

