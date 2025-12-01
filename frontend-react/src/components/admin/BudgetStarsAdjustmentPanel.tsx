import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { useAdjustBudget } from '@/hooks/useAdmin';
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

  const { mutate: adjustBudget, isPending: budgetLoading } = useAdjustBudget();

  const handleAdjustBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || !budgetReason.trim()) return;

    console.log('[BudgetStarsAdjustmentPanel] Adjusting budget:', { userId: user.id, amount: budgetAmount, direction: budgetDirection, reason: budgetReason });

    adjustBudget(
      {
        userId: user.id,
        amount: parseFloat(budgetAmount),
        direction: budgetDirection,
        reason: budgetReason,
      },
      {
        onSuccess: () => {
          console.log('[BudgetStarsAdjustmentPanel] Budget adjustment successful');
          setBudgetAmount('');
          setBudgetReason('');
          onSuccess?.();
        },
        onError: (error) => {
          console.error('[BudgetStarsAdjustmentPanel] Budget adjustment error:', error);
        },
      }
    );
  };

  return (
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
  );
}

