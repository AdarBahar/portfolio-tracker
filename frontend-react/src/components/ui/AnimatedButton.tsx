import type { ReactNode } from 'react';
import { Loader, CheckCircle } from 'lucide-react';
import './AnimatedButton.css';

export type ButtonState = 'idle' | 'loading' | 'success' | 'error';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  state?: ButtonState;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  icon?: ReactNode;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showIcon?: boolean;
}

const variantClasses: Record<ButtonVariant, Record<ButtonState, string>> = {
  primary: {
    idle: 'bg-gradient-to-r from-[#0BA5EC] to-[#7C3AED] hover:shadow-lg hover:shadow-blue-500/20 border border-[#0BA5EC]/50',
    loading: 'bg-[#0BA5EC] border border-[#0BA5EC] animate-pulse',
    success: 'bg-green-600 border border-green-600',
    error: 'bg-red-600 border border-red-600',
  },
  secondary: {
    idle: 'bg-[#1C2842] hover:bg-[#243049] border border-[#243049] hover:shadow-lg hover:shadow-blue-500/20',
    loading: 'bg-[#0BA5EC] border border-[#0BA5EC] animate-pulse',
    success: 'bg-green-600 border border-green-600',
    error: 'bg-red-600 border border-red-600',
  },
  danger: {
    idle: 'bg-red-600 hover:bg-red-700 border border-red-600 hover:shadow-lg hover:shadow-red-500/20',
    loading: 'bg-red-500 border border-red-500 animate-pulse',
    success: 'bg-green-600 border border-green-600',
    error: 'bg-red-700 border border-red-700',
  },
  success: {
    idle: 'bg-green-600 hover:bg-green-700 border border-green-600 hover:shadow-lg hover:shadow-green-500/20',
    loading: 'bg-green-500 border border-green-500 animate-pulse',
    success: 'bg-green-600 border border-green-600',
    error: 'bg-red-600 border border-red-600',
  },
  ghost: {
    idle: 'bg-transparent hover:bg-white/10 border border-transparent hover:border-white/20',
    loading: 'bg-white/5 border border-white/20 animate-pulse',
    success: 'bg-green-600/20 border border-green-600',
    error: 'bg-red-600/20 border border-red-600',
  },
  outline: {
    idle: 'bg-transparent hover:bg-white/5 border border-[#243049] hover:border-[#0BA5EC]',
    loading: 'bg-[#0BA5EC]/10 border border-[#0BA5EC] animate-pulse',
    success: 'bg-green-600/10 border border-green-600',
    error: 'bg-red-600/10 border border-red-600',
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2 w-10 h-10',
};

export default function AnimatedButton({
  children,
  onClick,
  disabled = false,
  state = 'idle',
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  title,
  icon,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error',
  showIcon = true,
}: AnimatedButtonProps) {
  const isDisabled = disabled || state !== 'idle';
  const variantClass = variantClasses[variant][state];
  const sizeClass = sizeClasses[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`animated-btn flex items-center justify-center gap-2 rounded-xl text-white transition-all font-medium relative overflow-hidden ${variantClass} ${sizeClass} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {/* Pulse background effect on loading */}
      {state === 'loading' && <div className="absolute inset-0 bg-white/10 animate-ping" />}

      {/* Icon container with animation */}
      {showIcon && (
        <div className={`relative transition-all ${state === 'loading' ? 'animate-spin' : ''}`}>
          {state === 'success' ? (
            <CheckCircle className="w-5 h-5 animate-bounce" />
          ) : state === 'error' ? (
            <span className="text-lg">⚠️</span>
          ) : state === 'loading' ? (
            <Loader className="w-5 h-5" />
          ) : (
            icon
          )}
        </div>
      )}

      {/* Text with fade animation */}
      <span className={`transition-all ${state === 'loading' ? 'opacity-70' : ''}`}>
        {state === 'loading' ? loadingText : state === 'success' ? successText : state === 'error' ? errorText : children}
      </span>
    </button>
  );
}

