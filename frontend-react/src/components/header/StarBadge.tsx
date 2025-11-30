import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import type { StarBadgeData } from '@/types/profileHeader';

type StarBadgeProps = StarBadgeData;

/**
 * StarBadge Component
 * Displays lifetime stars or level with optional animation
 * Features:
 * - Circular or hex container
 * - Star icon + numeric value
 * - Animated when stars increase
 * - Color-coded (purple/blue/gold)
 * - Light/dark mode support
 */
export default function StarBadge({
  value,
  size = 'md',
  colorScheme = 'purple',
  animated = false,
  previousValue,
}: StarBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevValue, setPrevValue] = useState(previousValue);

  // Trigger animation when value increases
  useEffect(() => {
    if (animated && prevValue !== undefined && value > prevValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    setPrevValue(value);
  }, [value, prevValue, animated]);

  // Size mappings
  const sizeMap = {
    sm: { container: 'w-12 h-12', text: 'text-sm', icon: 'w-5 h-5' },
    md: { container: 'w-16 h-16', text: 'text-lg', icon: 'w-6 h-6' },
    lg: { container: 'w-20 h-20', text: 'text-2xl', icon: 'w-8 h-8' },
  };

  // Color mappings
  const colorMap = {
    purple: 'from-purple-600 to-purple-500 text-white',
    blue: 'from-blue-600 to-blue-500 text-white',
    gold: 'from-yellow-500 to-yellow-400 text-yellow-900',
  };

  const sizes = sizeMap[size];
  const colors = colorMap[colorScheme];

  return (
    <div
      className={`
        ${sizes.container}
        rounded-full
        bg-gradient-to-br ${colors}
        flex items-center justify-center
        shadow-lg
        relative
        transition-all duration-300
        ${isAnimating ? 'scale-110' : 'scale-100'}
      `}
    >
      {/* Star Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <Star className={`${sizes.icon} fill-current`} />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center relative z-10">
        <Star className={`${sizes.icon} mb-1`} />
        <span className={`${sizes.text} font-bold`}>
          {value}
        </span>
      </div>

      {/* Pulse Animation Ring */}
      {isAnimating && (
        <div
          className={`
            absolute inset-0
            rounded-full
            border-2 border-current
            animate-ping
            opacity-75
          `}
        />
      )}
    </div>
  );
}

