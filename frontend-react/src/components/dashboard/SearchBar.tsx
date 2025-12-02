import { Search, Plus } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateRoom: () => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onCreateRoom,
}: SearchBarProps) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search trade rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0BA5EC]/20 focus:border-[#0BA5EC] transition-all text-sm sm:text-base"
        />
      </div>

      {/* Create Room Button */}
      <button
        onClick={onCreateRoom}
        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#16A34A] to-[#16A34A]/80 hover:shadow-lg text-white rounded-xl transition-all font-medium whitespace-nowrap text-sm sm:text-base"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Create Room</span>
        <span className="sm:hidden">Create</span>
      </button>
    </div>
  );
}

