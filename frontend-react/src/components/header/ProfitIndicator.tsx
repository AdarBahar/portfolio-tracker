import { useEffect, useState } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import type { ProfitIndicatorData } from '@/types/profileHeader';

type ProfitIndicatorProps = ProfitIndicatorData;

/**
 * ProfitIndicator Component
 * Displays lifetime net profit or seasonal profit with animation
 * Features:
 * - Dollar icon or trending line icon
 * - Color-coded: green for profit, red for loss
 * - Animated counter when value changes
 * - Optional sparkle effect
 * - Light/dark mode support
 */
export default function ProfitIndicator({
  amount,
  currency = 'USD',
  animated = false,
  previousAmount,
  showSparkle = false,
}: ProfitIndicatorProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize display amount
  useEffect(() => {
    setDisplayAmount(amount);
  }, [amount]);

  // Animate counter when amount changes
  useEffect(() => {
    if (!animated || previousAmount === undefined || amount === previousAmount) {
      return;
    }

    setIsAnimating(true);
    const startAmount = previousAmount;
    const endAmount = amount;
    const duration = 500; // ms
    const startTime = Date.now();

    const animateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = startAmount + (endAmount - startAmount) * progress;
      setDisplayAmount(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        setDisplayAmount(endAmount);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animateCounter);
  }, [amount, previousAmount, animated]);

  const isProfit = displayAmount >= 0;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayAmount);

  return (
    <div className="flex items-center gap-2">
      {/* Icon */}
      <TrendingUp className={`
        w-4 h-4
        ${isProfit ? 'text-success' : 'text-danger'}
      `} />

      {/* Amount */}
      <p className={`
        text-sm font-semibold
        ${isProfit ? 'text-success' : 'text-danger'}
        ${isAnimating ? 'animate-pulse' : ''}
      `}>
        {isProfit ? '+' : ''}{formattedAmount} earned
      </p>

      {/* Sparkle */}
      {showSparkle && isProfit && (
        <Sparkles className="w-3 h-3 text-warning animate-pulse" />
      )}
    </div>
  );
}

