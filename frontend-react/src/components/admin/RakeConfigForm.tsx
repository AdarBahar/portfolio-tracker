import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import type { RakeConfig } from '@/hooks/useRake';

interface RakeConfigFormProps {
  config: RakeConfig | null;
  isLoading: boolean;
  onSubmit: (data: any) => Promise<void>;
}

export default function RakeConfigForm({ config, isLoading, onSubmit }: RakeConfigFormProps): React.ReactElement {
  const [formData, setFormData] = useState<any>({
    percentage: config?.percentage || 0,
    min_amount: config?.min_amount || 0,
    max_amount: config?.max_amount || 0,
    is_active: config?.is_active || true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card-base p-12 text-center">
        <Loader className="w-6 h-6 text-primary animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="card-base p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Rake Configuration</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rake Percentage (%)
            </label>
            <input
              type="number"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="100"
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Minimum Amount
            </label>
            <input
              type="number"
              name="min_amount"
              value={formData.min_amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Maximum Amount
            </label>
            <input
              type="number"
              name="max_amount"
              value={formData.max_amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              name="is_active"
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.value === 'active' }))}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}

