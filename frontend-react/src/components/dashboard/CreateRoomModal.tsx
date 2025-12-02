import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateBullPen } from '@/hooks/useBullPens';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (roomData: any) => void;
}

export default function CreateRoomModal({ onClose, onCreate }: CreateRoomModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    durationSec: 86400, // 1 day default
    maxPlayers: 10,
    startingCash: 100000,
    allowFractional: false,
    approvalRequired: false,
  });

  const createMutation = useCreateBullPen();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      onCreate(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-foreground">Create Trade Room</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-foreground font-medium mb-2">Room Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter room name"
              required
              className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-foreground font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter room description"
              rows={3}
              className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-foreground font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-foreground font-medium mb-2">Duration (hours)</label>
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
              max="720"
              className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-foreground font-medium mb-2">Max Players</label>
            <input
              type="number"
              name="maxPlayers"
              value={formData.maxPlayers}
              onChange={handleChange}
              min="2"
              max="100"
              className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Starting Cash */}
          <div>
            <label className="block text-foreground font-medium mb-2">Starting Cash ($)</label>
            <input
              type="number"
              name="startingCash"
              value={formData.startingCash}
              onChange={handleChange}
              min="1000"
              step="1000"
              className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="allowFractional"
                checked={formData.allowFractional}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-foreground text-sm">Allow Fractional Shares</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="approvalRequired"
                checked={formData.approvalRequired}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-foreground text-sm">Require Approval to Join</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:shadow-lg text-white rounded-lg transition font-medium disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

