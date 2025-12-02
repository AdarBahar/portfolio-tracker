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
    <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search trade rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Create Room Button */}
      <button
        onClick={onCreateRoom}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:shadow-lg text-white rounded-xl transition-all font-medium whitespace-nowrap"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Create Room</span>
        <span className="sm:hidden">Create</span>
      </button>
    </div>
  );
}

