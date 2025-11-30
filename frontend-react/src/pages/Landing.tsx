import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Lock, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">📊 Fantasy Broker</h1>
          <Link to="/login" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition">
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
            <a
              href="#features"
              className="border border-slate-600 hover:border-slate-500 text-white px-8 py-3 rounded-lg font-semibold transition"
              rel="noopener noreferrer"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Tracking</h3>
            <p className="text-slate-400">Monitor your investments with live updates and instant notifications</p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border hover:border-success transition">
            <BarChart3 className="w-8 h-8 text-success mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Interactive Charts</h3>
            <p className="text-muted-foreground">Visualize sector allocation, performance trends, and portfolio composition</p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border hover:border-warning transition">
            <Zap className="w-8 h-8 text-warning mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Dividend Tracking</h3>
            <p className="text-muted-foreground">Track dividend income, estimated annual returns, and payment history</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition">
            <Lock className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
            {/* Security claims: All API calls use HTTPS in production, sensitive data is not persisted unencrypted */}
            <p className="text-slate-400">Your data is encrypted, secure, and never shared with third parties</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary rounded-lg p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Take Control of Your Portfolio?</h3>
          <p className="text-white/80 mb-8 text-lg">
            Join thousands of investors using Fantasy Broker to track and optimize their investments.
          </p>
          <Link to="/login" className="bg-white hover:bg-white/90 text-primary px-8 py-3 rounded-lg font-semibold transition inline-block">
            Start Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Fantasy Broker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

