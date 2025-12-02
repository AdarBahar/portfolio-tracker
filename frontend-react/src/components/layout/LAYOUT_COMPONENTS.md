# Layout Components Documentation

Reusable layout components for consistent page structure and styling across the application.

## Components Overview

### 1. PageLayout
**Purpose:** Wrapper component that provides consistent TopBar header and layout structure.

**Props:**
- `children: ReactNode` - Page content
- `notifications?: any[]` - Notification items
- `onMarkNotificationRead?: (id: string) => void` - Mark notification as read
- `onClearNotifications?: () => void` - Clear all notifications

**Usage:**
```tsx
<PageLayout
  notifications={notifications}
  onMarkNotificationRead={handleMarkRead}
  onClearNotifications={handleClear}
>
  <main>Your content here</main>
</PageLayout>
```

---

### 2. PageHeader
**Purpose:** Reusable header component for page titles with optional description, icon, and action button.

**Props:**
- `title: string` - Page title (required)
- `description?: string` - Subtitle or description
- `icon?: LucideIcon` - Icon from lucide-react
- `iconColor?: string` - Icon color class (default: `text-[#0BA5EC]`)
- `action?: ReactNode` - Action button or element
- `className?: string` - Additional CSS classes

**Features:**
- Gradient card styling with backdrop blur
- Responsive layout (stacks on mobile)
- Icon with colored background
- Optional action button on the right

**Usage:**
```tsx
<PageHeader
  title="Fantasy Broker"
  description="Manage your portfolio"
  icon={TrendingUp}
  iconColor="text-[#0BA5EC]"
  action={<button>Add Position</button>}
/>
```

---

### 3. PageSection
**Purpose:** Flexible section wrapper for organizing page content with consistent styling.

**Props:**
- `children: ReactNode` - Section content (required)
- `title?: string` - Section title
- `description?: string` - Section description
- `variant?: 'default' | 'muted' | 'bordered'` - Visual style
- `spacing?: 'compact' | 'normal' | 'spacious'` - Padding size
- `className?: string` - Additional CSS classes

**Variants:**
- `default` - Gradient card with border and shadow
- `muted` - Muted background with subtle border
- `bordered` - Thick border with minimal background

**Spacing:**
- `compact` - p-3 sm:p-4
- `normal` - p-4 sm:p-6
- `spacious` - p-6 sm:p-8

**Usage:**
```tsx
<PageSection
  title="Holdings"
  description="Your current positions"
  variant="default"
  spacing="normal"
>
  <HoldingsTable holdings={holdings} />
</PageSection>
```

---

### 4. StatCard
**Purpose:** Individual stat display with icon, value, and optional trend indicator.

**Props:**
- `label: string` - Stat label (required)
- `value: string | number` - Stat value (required)
- `icon?: LucideIcon` - Icon from lucide-react
- `iconColor?: string` - Icon color class
- `trend?: { value: number; isPositive: boolean }` - Trend indicator
- `size?: 'small' | 'medium' | 'large'` - Card size
- `className?: string` - Additional CSS classes

**Sizes:**
- `small` - Compact card for grids
- `medium` - Standard card size
- `large` - Prominent card

**Usage:**
```tsx
<StatCard
  label="Global Rank"
  value="#1"
  icon={Trophy}
  iconColor="text-[#F59E0B]"
  trend={{ value: 5, isPositive: true }}
  size="medium"
/>
```

---

### 5. ProfileStrip
**Purpose:** User profile display with avatar, name, username, and optional stats.

**Props:**
- `name: string` - User name (required)
- `avatar?: string` - Avatar image URL
- `avatarFallback?: string` - Fallback initials (default: '?')
- `username?: string` - Username/handle
- `subtitle?: string` - Additional info (e.g., earnings)
- `badge?: ReactNode` - Badge element (e.g., rank)
- `stats?: ReactNode` - Stats grid component
- `size?: 'small' | 'medium' | 'large'` - Component size
- `className?: string` - Additional CSS classes

**Sizes:**
- `small` - Compact profile
- `medium` - Standard profile
- `large` - Prominent profile

**Usage:**
```tsx
<ProfileStrip
  avatar={profilePicture}
  avatarFallback="JD"
  name="John Doe"
  username="johndoe"
  subtitle="$1,000 earned"
  badge={<span className="text-white font-bold">1</span>}
  stats={<div>Stats grid here</div>}
  size="medium"
/>
```

---

## Import Pattern

All components can be imported from the layout index:

```tsx
import { PageLayout, PageHeader, PageSection, StatCard, ProfileStrip } from '@/components/layout';
```

Or individually:

```tsx
import PageHeader from '@/components/layout/PageHeader';
import PageSection from '@/components/layout/PageSection';
```

---

## Design System Integration

All components follow the design guide:

**Colors:**
- Primary Blue: `#0BA5EC`
- Primary Purple: `#7C3AED`
- Success Green: `#16A34A`
- Warning Gold: `#F59E0B`
- Danger Red: `#EF4444`

**Styling:**
- Gradient cards with backdrop blur
- Consistent border styling
- Shadow effects for depth
- Rounded corners (rounded-2xl, rounded-lg)

**Responsive:**
- Mobile-first approach
- Tailwind breakpoints (sm:, md:, lg:)
- Flexible layouts that adapt to screen size

---

## Best Practices

1. **Use PageLayout** as the wrapper for all pages
2. **Use PageHeader** for page titles instead of custom headers
3. **Use PageSection** to organize content into logical sections
4. **Use StatCard** for displaying metrics in grids
5. **Use ProfileStrip** for user profile displays
6. **Combine components** for complex layouts
7. **Maintain consistency** by using the same components across pages

---

## Examples

### Dashboard Page
```tsx
<PageLayout notifications={notifications} {...handlers}>
  <main className="max-w-7xl mx-auto px-4 py-8">
    <PageHeader
      title="Fantasy Broker"
      description="Manage your portfolio"
      action={<button>Add Position</button>}
    />
    
    <PageSection title="Holdings" variant="default">
      <HoldingsTable holdings={holdings} />
    </PageSection>
  </main>
</PageLayout>
```

### Admin Page
```tsx
<PageLayout notifications={notifications} {...handlers}>
  <main className="max-w-7xl mx-auto px-4 py-8">
    <PageHeader
      title="Admin Panel"
      description="Manage platform settings"
      icon={Shield}
      iconColor="text-[#7C3AED]"
    />
    
    <PageSection title="Users" variant="default">
      <UserTable users={users} />
    </PageSection>
  </main>
</PageLayout>
```

