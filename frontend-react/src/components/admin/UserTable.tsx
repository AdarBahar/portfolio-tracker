import React from 'react';
import { Eye, Shield } from 'lucide-react';
import type { User } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/formatting';

interface UserTableProps {
  users: User[];
  onViewDetail: (userId: number) => void;
  onToggleAdmin: (userId: number, isAdmin: boolean) => void;
  isLoading?: boolean;
}

export default function UserTable({ users, onViewDetail, onToggleAdmin, isLoading }: UserTableProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="card-base overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Auth Provider</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Last Login</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="border-b border-white/10 hover:bg-background/50 transition-colors">
              <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
              <td className="px-6 py-4 text-sm text-foreground">{user.name || '-'}</td>
              <td className="px-6 py-4 text-sm">
                <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                  {user.auth_provider}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.is_admin ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                }`}>
                  {user.is_admin ? 'Admin' : 'User'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {user.last_login ? formatDate(user.last_login) : 'Never'}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetail(user.id)}
                    className="p-2 hover:bg-primary/20 rounded-md transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => onToggleAdmin(user.id, !user.is_admin)}
                    className="p-2 hover:bg-warning/20 rounded-md transition-colors"
                    title={user.is_admin ? 'Revoke admin' : 'Grant admin'}
                  >
                    <Shield className={`w-4 h-4 ${user.is_admin ? 'text-warning' : 'text-muted-foreground'}`} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

