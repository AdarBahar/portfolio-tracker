import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { useCreateBullPen } from '@/hooks/useBullPens';

interface CreateBullPenModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBullPenModal({ onClose, onSuccess }: CreateBullPenModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    durationSec: 604800, // 1 week
    maxPlayers: 50,
    startingCash: 100000,
    allowFractional: true,
    approvalRequired: false,
  });

  const { mutate: createBullPen, isPending } = useCreateBullPen();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBullPen(formData, {
      onSuccess,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-white/10 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Trade Room</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Room Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
              placeholder="e.g., Tech Stocks Tournament"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                name="durationSec"
                value={Math.floor(formData.durationSec / 3600)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    durationSec: Number(e.target.value) * 3600,
                  }))
                }
                min="1"
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                min="2"
                max="1000"
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Starting Cash
            </label>
            <input
              type="number"
              name="startingCash"
              value={formData.startingCash}
              onChange={handleChange}
              min="1000"
              step="1000"
              className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowFractional"
              checked={formData.allowFractional}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-foreground">Allow fractional shares</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="approvalRequired"
              checked={formData.approvalRequired}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-foreground">Require approval to join</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-card border border-white/10 text-foreground rounded-md hover:bg-card/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader className="w-4 h-4 animate-spin" />}
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

