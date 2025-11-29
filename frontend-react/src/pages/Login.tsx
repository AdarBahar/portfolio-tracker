import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, BarChart3, Lock, Zap } from 'lucide-react';
import ThemeToggle from '@/components/header/ThemeToggle';

declare global {
  interface Window {
    google?: any;
    handleCredentialResponse?: (response: any) => void;
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsDemo, isAuthenticated } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogleSignIn = async () => {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      // Define callback in global scope
      window.handleCredentialResponse = async (response: any) => {
        try {
          await login(response.credential, apiUrl);
          showToast('Welcome back!', 'success');
          setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error) {
          console.error('Google sign-in error:', error);
          showToast('Failed to sign in with Google. Please try again.', 'error');
        }
      };

      // Load Google Sign-In library
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: window.handleCredentialResponse,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'signin_with',
            size: 'large',
            logo_alignment: 'left',
            width: '320',
          });
        }
      }
    };

    initGoogleSignIn();
  }, [login, navigate]);

  const handleDemoLogin = async () => {
    try {
      await loginAsDemo();
      showToast('Entering demo mode...', 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Demo login error:', error);
      showToast('Failed to enter demo mode. Please try again.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastRef.current) {
      toastRef.current.textContent = message;
      toastRef.current.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`;
      setTimeout(() => {
        if (toastRef.current) toastRef.current.className = 'hidden';
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">📊 Fantasy Broker</h1>
              <p className="text-slate-400">Track your investments with real-time updates and insights</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400 text-sm mb-6">Sign in to access your portfolio</p>

              {/* Google Sign-In Button */}
              <div ref={googleButtonRef} className="flex justify-center mb-6" />

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              {/* Demo Mode Button */}
              <button
                onClick={handleDemoLogin}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition mb-2"
              >
                Continue in Demo Mode
              </button>
              <p className="text-xs text-slate-400 text-center">No login required</p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 text-sm text-slate-300 space-y-2">
              <p><strong>Demo Mode:</strong> Try the app without signing in. Your data will be stored locally.</p>
              <p><strong>Google Sign-In:</strong> Sign in to sync your portfolio across devices.</p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700 text-center text-xs text-slate-400">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Real-time Tracking</h3>
              <p className="text-sm text-slate-400">Monitor your investments with live updates</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <BarChart3 className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Interactive Charts</h3>
              <p className="text-sm text-slate-400">Visualize sector allocation and performance</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <Zap className="w-6 h-6 text-yellow-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Dividend Tracking</h3>
              <p className="text-sm text-slate-400">Track dividend income and estimated returns</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <Lock className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Secure & Private</h3>
              <p className="text-sm text-slate-400">Your data is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={toastRef} className="hidden" />
    </div>
  );
}

