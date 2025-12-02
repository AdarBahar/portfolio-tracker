import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, TrendingUp, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

declare global {
  interface Window {
    google?: any;
    handleCredentialResponse?: (response: any) => void;
    onGoogleLibraryLoad?: () => void;
  }
}

interface LoginFormInputs {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  rememberMe?: boolean;
  agreeToTerms?: boolean;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsDemo, isAuthenticated } = useAuth();
  const toastRef = useRef<HTMLDivElement>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      rememberMe: false,
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    window.handleCredentialResponse = async (response: any) => {
      try {
        setIsAuthLoading(true);
        setFormError(null);
        await login(response.credential, apiUrl);
        showToast('Welcome back!', 'success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } catch (error) {
        console.error('Google sign-in error:', error);
        setFormError('Failed to sign in with Google. Please try again.');
        showToast('Failed to sign in with Google. Please try again.', 'error');
        setIsAuthLoading(false);
      }
    };

    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id && googleClientId) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: window.handleCredentialResponse,
            auto_select: false,
            // FedCM-compatible options
            use_fedcm_for_prompt: true,
          });
          console.log('[Google Sign-In] Initialized successfully with FedCM support');
        }
      };
      script.onerror = () => {
        console.error('[Google Sign-In] Failed to load Google Sign-In script');
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id && googleClientId) {
      // Script already loaded, just initialize
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: window.handleCredentialResponse,
        auto_select: false,
        // FedCM-compatible options
        use_fedcm_for_prompt: true,
      });
      console.log('[Google Sign-In] Already initialized with FedCM support');
    }
  }, [login, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setIsAuthLoading(true);
      setFormError(null);

      if (isSignUp) {
        // Sign up logic
        if (data.password !== data.confirmPassword) {
          setFormError('Passwords do not match');
          setIsAuthLoading(false);
          return;
        }
        if (!data.agreeToTerms) {
          setFormError('You must agree to the Terms of Service and Privacy Policy');
          setIsAuthLoading(false);
          return;
        }
        // TODO: Implement actual signup API call
        showToast('Sign up feature coming soon', 'error');
        setIsAuthLoading(false);
      } else {
        // Login logic - for now, use demo mode
        await loginAsDemo();
        showToast('Welcome to Fantasy Trading!', 'success');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError('An error occurred. Please try again.');
      showToast('An error occurred. Please try again.', 'error');
      setIsAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsAuthLoading(true);
      setFormError(null);
      await loginAsDemo();
      showToast('Entering demo mode...', 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Demo login error:', error);
      setFormError('Failed to enter demo mode. Please try again.');
      showToast('Failed to enter demo mode. Please try again.', 'error');
      setIsAuthLoading(false);
    }
  };

  const handleGoogleClick = () => {
    try {
      // Trigger Google Sign-In using the modern approach
      if (window.google?.accounts?.id) {
        // Use the renderButton method directly for better FedCM compatibility
        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'en_US',
          });
        } else {
          // Fallback: trigger One Tap with FedCM-compatible options
          window.google.accounts.id.prompt((notification: any) => {
            // Handle notification status without using deprecated methods
            if (notification.isDisplayed()) {
              console.log('[Google Sign-In] One Tap displayed');
            }
          });
        }
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setFormError('Failed to initialize Google Sign-In. Please try again.');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastRef.current) {
      toastRef.current.textContent = message;
      toastRef.current.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`;
      setTimeout(() => {
        if (toastRef.current) toastRef.current.className = 'hidden';
      }, 3000);
    }
  };

  const features = [
    { text: 'Compete in real-time with players worldwide', icon: CheckCircle },
    { text: 'AI-powered recommendations and insights', icon: CheckCircle },
    { text: 'Earn stars and climb the global rankings', icon: CheckCircle },
  ];

  const stats = [
    { value: '50K+', label: 'Active Traders' },
    { value: '2M+', label: 'Stars Earned' },
    { value: '500+', label: 'Daily Rooms' },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Fantasy Trading</h1>
                <p className="text-sm text-white/80">Master the Markets</p>
              </div>
            </div>

            {/* Center Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4">Trade Without Risk,<br />Win Real Rewards</h2>
                <p className="text-white/80 text-lg max-w-md">
                  Join the ultimate fantasy trading platform where strategy meets competition.
                  Build your portfolio, earn stars, and climb the leaderboard.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-white/90" />
                    <span className="text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-white/60 text-sm">
              © 2025 Fantasy Trading. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-foreground text-2xl font-bold">Fantasy Trading</h1>
                <p className="text-muted-foreground text-sm">Master the Markets</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-foreground text-2xl font-bold mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-muted-foreground">
                {isSignUp
                  ? 'Sign up to start your trading journey'
                  : 'Enter your credentials to access your account'}
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-sm">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-foreground font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name', {
                      required: isSignUp ? 'Name is required' : false,
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    className={`w-full px-4 py-3 bg-muted/30 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                      errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-foreground font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-3 bg-muted/30 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-foreground font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className={`w-full pl-11 pr-11 py-3 bg-muted/30 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                      errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-foreground font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...register('confirmPassword', {
                        required: isSignUp ? 'Please confirm your password' : false,
                        validate: (value) =>
                          isSignUp && value !== password ? 'Passwords do not match' : true,
                      })}
                      className={`w-full pl-11 pr-4 py-3 bg-muted/30 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>
              )}

              {/* Remember Me & Forgot Password (Login Only) */}
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                    />
                    <span className="text-muted-foreground text-sm">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-purple-600 text-sm transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Terms (Sign Up Only) */}
              {isSignUp && (
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms', {
                      required: 'You must agree to the Terms of Service and Privacy Policy',
                    })}
                    className="w-4 h-4 mt-1 rounded border-border text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                  />
                  <p className="text-muted-foreground text-sm">
                    I agree to the{' '}
                    <button type="button" className="text-blue-600 hover:text-purple-600 transition-colors">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-blue-600 hover:text-purple-600 transition-colors">
                      Privacy Policy
                    </button>
                  </p>
                  {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {isAuthLoading && <Loader className="w-4 h-4 animate-spin" />}
                {isAuthLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isAuthLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-muted/30 hover:bg-muted border border-border rounded-xl text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sign in with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button
                  type="button"
                  disabled={isAuthLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-muted/30 hover:bg-muted border border-border rounded-xl text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span className="text-sm font-medium">GitHub</span>
                </button>
              </div>
            </form>

            {/* Toggle Sign Up / Login */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormError(null);
                    reset();
                  }}
                  className="text-blue-600 hover:text-purple-600 transition-colors font-medium"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>

            {/* Demo Account */}
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl">
              <p className="text-blue-600 text-sm text-center">
                <span className="font-medium">Demo Mode:</span> Click "Sign In" to explore the platform with demo data
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isAuthLoading}
                className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isAuthLoading ? 'Loading...' : 'Try Demo Mode'}
              </button>
            </div>
          </div>
        </div>

        <div ref={toastRef} className="hidden" />
      </div>
    </ErrorBoundary>
  );
}

