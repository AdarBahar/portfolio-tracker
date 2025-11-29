import React from 'react';
import { Loader } from 'lucide-react';
import type { Promotion } from '@/hooks/usePromotions';
import { formatCurrency, formatDate } from '@/utils/formatting';

interface PromotionsListProps {
  promotions: Promotion[];
  isLoading: boolean;
}

export default function PromotionsList({ promotions, isLoading }: PromotionsListProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="card-base p-12 text-center">
        <Loader className="w-6 h-6 text-primary animate-spin mx-auto" />
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No promotions found</p>
      </div>
    );
  }

  return (
    <div className="card-base overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Code</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Bonus</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Max Uses</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valid From</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valid To</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promo: any) => (
            <tr key={promo.id} className="border-b border-white/10 hover:bg-background/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-primary">{promo.code}</td>
              <td className="px-6 py-4 text-sm text-foreground">{promo.name}</td>
              <td className="px-6 py-4 text-sm text-foreground">
                {promo.bonus_type === 'fixed' 
                  ? formatCurrency(promo.bonus_amount)
                  : `${promo.bonus_amount}%`
                }
              </td>
              <td className="px-6 py-4 text-sm text-foreground">
                {promo.max_uses || 'Unlimited'}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {formatDate(promo.start_date)}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {formatDate(promo.end_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

