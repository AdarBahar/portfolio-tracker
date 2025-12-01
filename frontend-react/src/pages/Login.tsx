import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, BarChart3, Lock, Zap, Loader } from 'lucide-react';
import ThemeToggle from '@/components/header/ThemeToggle';

declare global {
  interface Window {
    google?: any;
    handleCredentialResponse?: (response: any) => void;
    onGoogleLibraryLoad?: () => void;
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsDemo, isAuthenticated } = useAuth();
  const toastRef = useRef<HTMLDivElement>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Initialize Google Sign-In using declarative approach (like vanilla JS)
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    // Define callback in global scope FIRST (before Google library processes the DOM)
    window.handleCredentialResponse = async (response: any) => {
      try {
        console.log('[Login] Google Sign-In callback triggered');
        setIsAuthLoading(true);
        console.log('[Login] Calling login with credential and apiUrl:', apiUrl);
        await login(response.credential, apiUrl);
        console.log('[Login] Login successful');
        showToast('Welcome back!', 'success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } catch (error) {
        console.error('[Login] Google sign-in error:', error);
        showToast('Failed to sign in with Google. Please try again.', 'error');
        setIsAuthLoading(false);
      }
    };

    // Set up the g_id_onload div with the client ID
    const googleOnloadDiv = document.getElementById('g_id_onload');
    if (googleOnloadDiv && googleClientId) {
      console.log('[Login] Setting Google Client ID on g_id_onload div');
      googleOnloadDiv.setAttribute('data-client_id', googleClientId);

      // Trigger Google library to process the DOM
      // This is the declarative approach - Google's library will automatically process g_id_onload and g_id_signin divs
      if (window.google) {
        console.log('[Login] Google library already loaded, processing DOM');
        window.google.accounts.id.renderButton(
          document.querySelector('.g_id_signin'),
          {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'signin_with',
            size: 'large',
            logo_alignment: 'left',
            width: '320',
          }
        );
      }
    }
  }, [login, navigate]);

  const handleDemoLogin = async () => {
    try {
      setIsAuthLoading(true);
      await loginAsDemo();
      showToast('Entering demo mode...', 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Demo login error:', error);
      showToast('Failed to enter demo mode. Please try again.', 'error');
      setIsAuthLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastRef.current) {
      toastRef.current.textContent = message;
      // Use design system tokens instead of hardcoded colors
      toastRef.current.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-success' : 'bg-destructive'
      }`;
      setTimeout(() => {
        if (toastRef.current) toastRef.current.className = 'hidden';
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-card rounded-lg shadow-xl p-8 border border-border">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">📊 Fantasy Broker</h1>
              <p className="text-muted-foreground">Track your investments with real-time updates and insights</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400 text-sm mb-6">Sign in to access your portfolio</p>

              {/* Google Sign-In Button - Using declarative approach */}
              <div id="g_id_onload"
                   data-context="signin"
                   data-ux_mode="popup"
                   data-callback="handleCredentialResponse"
                   data-auto_prompt="false"
                   data-itp_support="true"
                   style={{ display: 'none' }}>
              </div>
              <div className="g_id_signin flex justify-center mb-6"
                   data-type="standard"
                   data-shape="rectangular"
                   data-theme="outline"
                   data-text="signin_with"
                   data-size="large"
                   data-logo_alignment="left"
                   data-width="320">
              </div>

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
                disabled={isAuthLoading}
                className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition mb-2 flex items-center justify-center gap-2"
              >
                {isAuthLoading && <Loader className="w-4 h-4 animate-spin" />}
                {isAuthLoading ? 'Signing in...' : 'Continue in Demo Mode'}
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
              <Zap className="w-6 h-6 text-warning mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Dividend Tracking</h3>
              <p className="text-sm text-muted-foreground">Track dividend income and estimated returns</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <Lock className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">Your data is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={toastRef} className="hidden" />
    </div>
  );
}

