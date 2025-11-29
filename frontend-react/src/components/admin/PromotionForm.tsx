import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PromotionFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function PromotionForm({ onClose, onSubmit }: PromotionFormProps): React.ReactElement {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    bonus_type: 'fixed',
    bonus_amount: 0,
    max_uses: '',
    min_account_age_days: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-white/10 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Promotion</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
              placeholder="e.g., WELCOME100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
              placeholder="e.g., Welcome Bonus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bonus Type *</label>
            <select
              name="bonus_type"
              value={formData.bonus_type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bonus Amount *</label>
            <input
              type="number"
              name="bonus_amount"
              value={formData.bonus_amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">End Date *</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Promotion'}
          </button>
        </form>
      </div>
    </div>
  );
}

