import React, { useState } from 'react';
import { DollarSign, Star, Loader } from 'lucide-react';
import { useAdjustBudget, useGrantStars, useRemoveStars } from '@/hooks/useAdmin';
import type { UserDetail } from '@/hooks/useAdmin';

// Format number with comma thousands separator
const formatNumber = (num: string | number): string => {
  if (!num && num !== 0) return '0';
  const numStr = typeof num === 'string' ? num : num.toString();
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

interface BudgetStarsAdjustmentPanelProps {
  user: UserDetail;
  onSuccess?: () => void;
}

export default function BudgetStarsAdjustmentPanel({ user, onSuccess }: BudgetStarsAdjustmentPanelProps): React.ReactElement {
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetDirection, setBudgetDirection] = useState<'IN' | 'OUT'>('IN');
  const [budgetReason, setBudgetReason] = useState('');
  const [starsAmount, setStarsAmount] = useState('');
  const [starsAction, setStarsAction] = useState<'grant' | 'remove'>('grant');
  const [starsReason, setStarsReason] = useState('');

  const { mutate: adjustBudget, isPending: budgetLoading } = useAdjustBudget();
  const { mutate: grantStars, isPending: grantLoading } = useGrantStars();
  const { mutate: removeStars, isPending: removeLoading } = useRemoveStars();

  const handleAdjustBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || !budgetReason.trim()) return;

    adjustBudget(
      {
        userId: user.id,
        amount: parseFloat(budgetAmount),
        direction: budgetDirection,
        reason: budgetReason,
      },
      {
        onSuccess: () => {
          setBudgetAmount('');
          setBudgetReason('');
          onSuccess?.();
        },
      }
    );
  };

  const handleAdjustStars = (e: React.FormEvent) => {
    e.preventDefault();
    if (!starsAmount || !starsReason.trim()) return;

    const mutationFn = starsAction === 'grant' ? grantStars : removeStars;
    mutationFn(
      {
        userId: user.id,
        stars: parseInt(starsAmount, 10),
        reason: starsReason,
      },
      {
        onSuccess: () => {
          setStarsAmount('');
          setStarsReason('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Budget Adjustment */}
      <div className="bg-background/50 p-4 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-success" />
          <h3 className="text-lg font-semibold text-white">Adjust Budget</h3>
        </div>
        <form onSubmit={handleAdjustBudget} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Direction</label>
              <select
                value={budgetDirection}
                onChange={(e) => setBudgetDirection(e.target.value as 'IN' | 'OUT')}
                className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
              >
                <option value="IN">Add Money</option>
                <option value="OUT">Remove Money</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Reason</label>
            <input
              type="text"
              value={budgetReason}
              onChange={(e) => setBudgetReason(e.target.value)}
              placeholder="e.g., Bonus, Correction, Refund"
              className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={budgetLoading || !budgetAmount || !budgetReason.trim()}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {budgetLoading && <Loader className="w-4 h-4 animate-spin" />}
            {budgetDirection === 'IN' ? 'Add' : 'Remove'} ${formatNumber(budgetAmount || '0.00')}
          </button>
        </form>
      </div>

      {/* Stars Adjustment */}
      <div className="bg-background/50 p-4 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-white">Adjust Stars</h3>
        </div>
        <form onSubmit={handleAdjustStars} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Amount</label>
              <input
                type="number"
                min="0"
                value={starsAmount}
                onChange={(e) => setStarsAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Action</label>
              <select
                value={starsAction}
                onChange={(e) => setStarsAction(e.target.value as 'grant' | 'remove')}
                className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
              >
                <option value="grant">Grant Stars</option>
                <option value="remove">Remove Stars</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Reason</label>
            <input
              type="text"
              value={starsReason}
              onChange={(e) => setStarsReason(e.target.value)}
              placeholder="e.g., Achievement, Correction, Penalty"
              className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={grantLoading || removeLoading || !starsAmount || !starsReason.trim()}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {(grantLoading || removeLoading) && <Loader className="w-4 h-4 animate-spin" />}
            {starsAction === 'grant' ? 'Grant' : 'Remove'} {formatNumber(starsAmount || '0')} ⭐
          </button>
        </form>
      </div>
    </div>
  );
}

