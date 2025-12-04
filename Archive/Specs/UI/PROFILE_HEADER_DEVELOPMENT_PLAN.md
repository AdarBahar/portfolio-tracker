# Profile Header Development Plan

## Overview

This document outlines the development strategy for implementing the Profile Header component as specified in `profile_header_UI_specs.md`. The header will be displayed on the Dashboard page immediately after login.

## Project Scope

**Component**: ProfileHeader (reusable, can be used on Dashboard and Profile pages)
**Location**: `frontend-react/src/components/header/ProfileHeader.tsx`
**Pages Using It**: Dashboard, Profile (future)
**Design System**: Uses semantic color tokens from `design-system.md`
**Theme Support**: Full light/dark mode support

## Development Phases

### Phase 1: Component Architecture & Setup (Week 1)

**Deliverables**:
- [ ] Create component structure and TypeScript interfaces
- [ ] Set up sub-components (Avatar, StatCard, StarBadge, ProfitIndicator)
- [ ] Create mock data for testing
- [ ] Implement responsive layout (desktop → mobile)

**Files to Create**:
- `frontend-react/src/components/header/ProfileHeader.tsx` (main component)
- `frontend-react/src/components/header/ProfileAvatar.tsx` (avatar with upload)
- `frontend-react/src/components/header/StatCard.tsx` (metric display)
- `frontend-react/src/components/header/StarBadge.tsx` (stars display)
- `frontend-react/src/components/header/ProfitIndicator.tsx` (P&L display)

**Design System Compliance**:
- Use `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`
- Use `border-border` instead of `border-white/10`
- Use semantic color tokens for all colors
- Test in both light and dark modes

### Phase 2: API Integration (Week 2)

**Deliverables**:
- [ ] Create hooks for fetching user profile data
- [ ] Implement user stats API calls
- [ ] Add error handling and loading states
- [ ] Implement data caching with React Query

**Files to Create/Update**:
- `frontend-react/src/hooks/useUserProfile.ts` (fetch user data)
- `frontend-react/src/hooks/useUserStats.ts` (fetch stats)
- `frontend-react/src/lib/api.ts` (add endpoints if needed)

**API Endpoints Needed**:
- `GET /api/users/profile` - User profile data
- `GET /api/users/stats` - User statistics
- `POST /api/users/avatar` - Upload avatar

### Phase 3: Avatar Upload Feature (Week 2-3)

**Deliverables**:
- [ ] Implement image upload modal
- [ ] Add image preview and crop functionality
- [ ] Handle file validation (format, size)
- [ ] Implement upload progress indicator
- [ ] Add success/error feedback

**Files to Create**:
- `frontend-react/src/components/header/AvatarUploadModal.tsx`
- `frontend-react/src/utils/imageProcessing.ts` (crop, resize)

**Constraints**:
- Allowed formats: JPG, PNG, WEBP
- Max size: 2-5MB
- Recommended: 512x512px
- Auto-crop to square

### Phase 4: Animations & Micro-interactions (Week 3)

**Deliverables**:
- [ ] Implement rank movement animation
- [ ] Add earnings counter animation
- [ ] Implement star earned animation
- [ ] Add streak glow effect
- [ ] Smooth transitions for stat updates

**Animation Specs**:
- Rank movement: 200-300ms, cubic-bezier(0.4, 0, 0.2, 1)
- Earnings counter: 400-600ms
- Star animation: 300-400ms with scale effect
- Streak glow: 2s pulse rate

### Phase 5: Empty State & New User Experience (Week 4)

**Deliverables**:
- [ ] Implement empty state UI
- [ ] Add motivational callouts
- [ ] Highlight "Join Room" button for new users
- [ ] Show incentive messaging

**Empty State Content**:
- "Welcome! Your stats will appear here after your first room."
- "Join your first room to start earning stars and ranking points."
- "⭐ Earn 10 stars when you join your first room"

### Phase 6: Testing & Refinement (Week 4)

**Deliverables**:
- [ ] Unit tests for all sub-components
- [ ] Integration tests with Dashboard
- [ ] Light/dark mode testing
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Accessibility testing (WCAG AA)
- [ ] Performance optimization

**Test Coverage**:
- Component rendering with various data states
- Avatar upload flow
- Animation triggers
- Theme switching
- Responsive breakpoints

### Phase 7: Documentation & Integration (Week 5)

**Deliverables**:
- [ ] Component documentation
- [ ] Storybook stories (if applicable)
- [ ] Integration with Dashboard page
- [ ] Update design system with new patterns
- [ ] Code review and refinement

## Component Breakdown

### ProfileHeader (Main Container)
- Three-column layout: Identity | Stats | Actions
- Responsive stacking on mobile
- Full light/dark mode support

### ProfileAvatar
- Circular avatar (72-92px)
- Gradient placeholder with user initial
- Camera icon overlay for upload
- Hover states and loading indicator

### StatCard
- Icon + Label + Value layout
- Optional trend indicator (up/down)
- Hover elevation effect
- Skeleton loading state

### StarBadge
- Circular or hex container
- Star icon + numeric value
- Animated when stars increase
- Color-coded (purple/blue)

### ProfitIndicator
- Dollar icon or trending line
- Green for profit, red for loss
- Animated counter on value change
- Optional sparkle effect

## Design System Integration

**Color Tokens Used**:
- `bg-background` - Main background
- `bg-card` - Card backgrounds
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `text-success` - Positive values (green)
- `text-danger` - Negative values (red)
- `text-warning` - Pending/caution (yellow)
- `border-border` - Borders

**Typography**:
- Name: `text-xl font-semibold`
- Metrics: `text-2xl font-bold`
- Labels: `text-sm text-muted-foreground`

**Spacing**:
- Container padding: `px-6 py-8`
- Card padding: `p-6`
- Gap between sections: `gap-6`

## Success Criteria

- ✅ All components render correctly in light and dark modes
- ✅ Avatar upload works with preview and validation
- ✅ Animations are smooth and performant
- ✅ Responsive design works on mobile, tablet, desktop
- ✅ Accessibility meets WCAG AA standards
- ✅ API integration is complete and tested
- ✅ Empty state provides good UX for new users
- ✅ Code is well-documented and tested

## Timeline

- **Week 1**: Phase 1 (Component Architecture)
- **Week 2**: Phase 2 (API Integration) + Phase 3 (Avatar Upload)
- **Week 3**: Phase 3 (Avatar Upload) + Phase 4 (Animations)
- **Week 4**: Phase 5 (Empty State) + Phase 6 (Testing)
- **Week 5**: Phase 7 (Documentation & Integration)

**Total Estimated Time**: 5 weeks

## Dependencies

- React 19
- TypeScript
- Tailwind CSS with semantic tokens
- React Query for data fetching
- Lucide React for icons
- React Router for navigation

## Next Steps

1. Review and approve this plan
2. Create component structure and TypeScript interfaces
3. Set up mock data for development
4. Begin Phase 1 implementation
5. Schedule design review after Phase 1 completion

