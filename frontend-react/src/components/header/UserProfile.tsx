import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
        <div className="relative">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          {user.isAdmin && (
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs"
              title="Admin"
            >
              ⭐
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{user.name}</span>
          {user.isAdmin && (
            <button
              onClick={handleAdminClick}
              className="text-xs text-primary hover:text-primary/80 transition text-left"
            >
              Admin Page
            </button>
          )}
          {user.isDemo && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mt-1">
              Demo Mode
            </span>
          )}
        </div>
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm font-medium"
      >
        Logout
      </button>
    </div>
  );
}

