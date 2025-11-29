import { useState } from 'react';
import { X } from 'lucide-react';

interface AddPositionModalProps {
  onClose: () => void;
}

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy', 'Diversified'];
const ASSET_CLASSES = ['US Stocks', 'International Stocks', 'ETF', 'Bonds', 'Crypto'];

export default function AddPositionModal({ onClose }: AddPositionModalProps) {
  const [formData, setFormData] = useState({
    ticker: '',
    companyName: '',
    shares: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    sector: 'Technology',
    assetClass: 'US Stocks',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ticker.trim()) newErrors.ticker = 'Ticker is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.shares || parseFloat(formData.shares) <= 0) newErrors.shares = 'Shares must be greater than 0';
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0)
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // TODO: Submit to API
    console.log('Form submitted:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-white/10 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Add New Position</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ticker */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Ticker Symbol *</label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              placeholder="e.g., AAPL"
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            {errors.ticker && <p className="text-red-500 text-sm mt-1">{errors.ticker}</p>}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Apple Inc."
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
          </div>

          {/* Shares */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Shares *</label>
            <input
              type="number"
              name="shares"
              value={formData.shares}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            {errors.shares && <p className="text-red-500 text-sm mt-1">{errors.shares}</p>}
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Purchase Price *</label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Purchase Date *</label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
            {errors.purchaseDate && <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>}
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Sector</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              {SECTORS.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Class */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Asset Class</label>
            <select
              name="assetClass"
              value={formData.assetClass}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              {ASSET_CLASSES.map((assetClass) => (
                <option key={assetClass} value={assetClass}>
                  {assetClass}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition"
            >
              Add Position
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

