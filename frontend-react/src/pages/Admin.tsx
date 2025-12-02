import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, BarChart3, Gift, Shield } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useUsers, useUpdateUserAdmin } from '@/hooks/useAdmin';
import { useRakeConfig, useRakeStats, useUpdateRakeConfig } from '@/hooks/useRake';
import { usePromotions, useCreatePromotion } from '@/hooks/usePromotions';
import UserTable from '@/components/admin/UserTable';
import RakeConfigForm from '@/components/admin/RakeConfigForm';
import PromotionsList from '@/components/admin/PromotionsList';
import PromotionForm from '@/components/admin/PromotionForm';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rake' | 'promotions'>('overview');
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [createPromotionButtonState, setCreatePromotionButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Hooks
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { mutate: updateUserAdmin } = useUpdateUserAdmin();
  const { data: rakeConfig, isLoading: rakeConfigLoading } = useRakeConfig();
  const { data: rakeStats } = useRakeStats();
  const { mutate: updateRakeConfig } = useUpdateRakeConfig();
  const { data: promotions = [], isLoading: promotionsLoading } = usePromotions();
  const { mutate: createPromotion } = useCreatePromotion();

  const adminSections = [
    {
      id: 1,
      title: 'User Management',
      description: 'Manage users, view details, and handle account issues',
      icon: Users,
      color: 'text-primary',
      onClick: () => setActiveTab('users'),
    },
    {
      id: 2,
      title: 'Rake Configuration',
      description: 'Configure rake fees and collection settings',
      icon: Settings,
      color: 'text-warning',
      onClick: () => setActiveTab('rake'),
    },
    {
      id: 3,
      title: 'Analytics',
      description: 'View platform statistics and performance metrics',
      icon: BarChart3,
      color: 'text-success',
      onClick: () => setActiveTab('overview'),
    },
    {
      id: 4,
      title: 'Promotions',
      description: 'Create and manage promotional codes and bonuses',
      icon: Gift,
      color: 'text-brand-purple',
      onClick: () => setActiveTab('promotions'),
    },
  ];

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <PageLayout
      notifications={notifications}
      onMarkNotificationRead={handleMarkNotificationRead}
      onClearNotifications={handleClearNotifications}
    >

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="Admin Panel"
          description="Manage platform settings, users, and promotions"
          icon={Shield}
          iconColor="text-[#7C3AED]"
        />

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('rake')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'rake'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Rake Configuration
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'promotions'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Promotions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Admin Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminSections.map((section: any) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    onClick={section.onClick}
                    className="card-base p-6 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Icon className={`w-8 h-8 ${section.color}`} />
                      <div>
                        <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{section.description}</p>
                      </div>
                    </div>
                    <button className="btn-secondary w-full">Access →</button>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="card-base p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Platform Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">Total Rake Collected</p>
                  <p className="text-2xl font-bold text-warning">${rakeStats?.total_collected || 0}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">Active Promotions</p>
                  <p className="text-2xl font-bold text-primary">{promotions.length}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">Rake Percentage</p>
                  <p className="text-2xl font-bold text-success">{rakeConfig?.percentage || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <UserTable
              users={users}
              isLoading={usersLoading}
              onViewDetail={(userId) => navigate(`/admin/user/${userId}`)}
              onToggleAdmin={(userId, isAdmin) => updateUserAdmin({ userId, isAdmin })}
            />
          </div>
        )}

        {/* Rake Configuration Tab */}
        {activeTab === 'rake' && (
          <div className="space-y-6">
            <RakeConfigForm
              config={rakeConfig || null}
              isLoading={rakeConfigLoading}
              onSubmit={(data) => new Promise((resolve) => {
                updateRakeConfig(data, { onSuccess: () => resolve() });
              })}
            />
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <AnimatedButton
              onClick={() => {
                setCreatePromotionButtonState('loading');
                setTimeout(() => {
                  setShowPromotionForm(true);
                  setCreatePromotionButtonState('idle');
                }, 300);
              }}
              state={createPromotionButtonState}
              variant="primary"
              size="lg"
              loadingText="Opening..."
              successText="Opened!"
            >
              Create Promotion
            </AnimatedButton>
            <PromotionsList
              promotions={promotions}
              isLoading={promotionsLoading}
            />
          </div>
        )}

        {/* Modals */}
        {showPromotionForm && (
          <PromotionForm
            onClose={() => setShowPromotionForm(false)}
            onSubmit={(data) => new Promise((resolve) => {
              createPromotion(data, { onSuccess: () => resolve() });
            })}
          />
        )}
      </main>
    </PageLayout>
  );
}

