import { useState } from 'react';
import type { ReactNode } from 'react';
import TopBar from '@/components/dashboard/TopBar';

interface PageLayoutProps {
  children: ReactNode;
  notifications?: any[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

/**
 * PageLayout - Reusable layout component with TopBar header
 *
 * Provides consistent header and layout structure across all pages.
 * Manages notifications state if not provided by parent.
 */
export default function PageLayout({
  children,
  notifications: externalNotifications,
  onMarkNotificationRead: externalMarkRead,
  onClearNotifications: externalClear,
}: PageLayoutProps) {
  // Use internal state if not provided by parent
  const [internalNotifications, setInternalNotifications] = useState<any[]>([]);
  
  const notifications = externalNotifications ?? internalNotifications;
  
  const handleMarkNotificationRead = (id: string) => {
    if (externalMarkRead) {
      externalMarkRead(id);
    } else {
      setInternalNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const handleClearNotifications = () => {
    if (externalClear) {
      externalClear();
    } else {
      setInternalNotifications([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <TopBar
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* Page Content */}
      {children}
    </div>
  );
}

