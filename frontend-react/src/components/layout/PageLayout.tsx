import { ReactNode, useState } from 'react';
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
 * 
 * Usage:
 * ```tsx
 * <PageLayout>
 *   <main className="max-w-7xl mx-auto px-4 py-8">
 *     {/* Page content */}
 *   </main>
 * </PageLayout>
 * ```
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

