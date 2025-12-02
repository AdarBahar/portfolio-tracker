import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateRoom?: () => void;
}

export function SearchBar({ searchQuery, setSearchQuery, onCreateRoom }: SearchBarProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trade rooms, players, or tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-3">
          {onCreateRoom && (
            <button 
              onClick={onCreateRoom}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 gradient-success text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
            >
              <span className="text-xl">+</span>
              <span className="hidden xs:inline">Create Room</span>
              <span className="xs:hidden">Create</span>
            </button>
          )}
          <button className="flex-1 sm:flex-none px-4 sm:px-6 py-3 gradient-primary text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden xs:inline">Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}