# Fantasy Broker Design System

## Table of Contents
1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [States & Interactions](#states--interactions)
7. [Animations](#animations)
8. [Responsive Behavior](#responsive-behavior)
9. [Do's and Don'ts](#dos-and-donts)

---

## Design Principles

### Core Values
- **Trust & Clarity**: Financial data must be immediately readable and accurate
- **Performance-Driven**: Real-time updates demand instant visual feedback
- **Competitive Edge**: Design should evoke excitement and urgency
- **Professional Simplicity**: Clean layouts that don't overwhelm traders

### Visual Direction
The Fantasy Broker design combines:
- **Dark, sophisticated backgrounds** for reduced eye strain during extended trading sessions
- **High-contrast accents** for critical data and CTAs
- **Gradient treatments** for brand moments and hierarchy
- **Card-based layouts** for clear information grouping

---

## Color System

### Semantic Color Tokens

All colors use HSL format and are defined as CSS custom properties for theme consistency.

#### Primary Palette
```css
/* Brand Identity */
--primary: 199 89% 48%        /* Bright blue - primary actions */
--brand-blue: 199 89% 48%     /* Same as primary - consistency */
--brand-purple: 262 83% 58%   /* Secondary brand - highlights */

/* Surface Colors */
--background: 222 47% 11%     /* Main dark background (#0a1628) */
--card: 222 43% 15%           /* Elevated surfaces (#0f1c30) */
--popover: 222 43% 15%        /* Dropdowns and tooltips */
```

#### Functional Colors
```css
/* Status Colors */
--success: 142 76% 36%        /* Green - gains, positive actions */
--warning: 43 96% 56%         /* Yellow - caution, pending */
--danger: 0 84% 60%           /* Red - losses, destructive actions */
--destructive: 0 84% 60%      /* Same as danger */

/* Text Colors */
--foreground: 210 20% 98%     /* Primary text on dark */
--muted-foreground: 215 16% 65%  /* Secondary text */
```

#### Neutral Palette
```css
--secondary: 222 40% 20%      /* Secondary backgrounds */
--muted: 222 40% 20%          /* Muted backgrounds */
--border: 222 40% 25%         /* Border color */
--input: 222 40% 25%          /* Input borders */
```

#### Chart Colors
```css
--chart-1: 199 89% 48%        /* Primary blue */
--chart-2: 142 76% 36%        /* Success green */
--chart-3: 43 74% 66%         /* Warning yellow */
--chart-4: 27 87% 67%         /* Orange accent */
--chart-5: 197 37% 24%        /* Dark blue */
```

### Usage Rules

#### ✅ DO
- Use `bg-background` for main page backgrounds (#0a1628)
- Use `bg-card` for elevated surfaces (#0f1c30)
- Use `text-foreground` for primary text
- Use `text-muted-foreground` for secondary text
- Use `text-success` for positive P&L values
- Use `text-danger` for negative P&L values
- Use semantic tokens: `bg-primary`, `text-success`, `border-border`
- Maintain 4.5:1 contrast ratio for text (WCAG AA)

#### ❌ DON'T
- Never use direct color values like `text-blue-500` or `bg-[#0a1628]`
- Don't use `text-white` or `text-black` (use semantic tokens)
- Don't use success color for negative values
- Don't use danger color for positive values
- Don't mix RGB and HSL formats

### Color Contrast Requirements

| Background | Text | Contrast | Status |
|------------|------|----------|--------|
| bg-background | text-foreground | 16.8:1 | ✅ Excellent |
| bg-card | text-foreground | 14.2:1 | ✅ Excellent |
| bg-primary | text-primary-foreground | 5.1:1 | ✅ AA Large |
| bg-success | text-white | 4.8:1 | ✅ AA |
| bg-danger | text-white | 4.6:1 | ✅ AA |

---

## Typography

### Font Stack
- **System Fonts**: Uses native system font stack for optimal performance
- **Fallback**: `ui-sans-serif, system-ui, -apple-system, sans-serif`

### Type Scale

```
text-xs    : 0.75rem  (12px) - Small labels, timestamps
text-sm    : 0.875rem (14px) - Secondary text, descriptions
text-base  : 1rem     (16px) - Body text, default
text-lg    : 1.125rem (18px) - Emphasized text
text-xl    : 1.25rem  (20px) - Subheadings
text-2xl   : 1.5rem   (24px) - Section headings
text-3xl   : 1.875rem (30px) - Page titles
text-6xl   : 3.75rem  (60px) - Hero titles
```

### Font Weights

```
font-normal   : 400 - Body text
font-medium   : 500 - Emphasized text
font-semibold : 600 - Subheadings
font-bold     : 700 - Headings, CTAs
```

### Typography Hierarchy

#### Page Title
```tsx
<h1 className="text-3xl font-bold text-white">
  Bull Pen Name
</h1>
```

#### Section Heading
```tsx
<h2 className="text-2xl font-bold text-white">
  Your Active Trade Rooms
</h2>
```

#### Card Title
```tsx
<h3 className="text-xl font-semibold text-white">
  Portfolio Value
</h3>
```

#### Body Text
```tsx
<p className="text-base text-foreground">
  Regular content text
</p>
```

#### Secondary Text
```tsx
<p className="text-sm text-muted-foreground">
  Supporting information
</p>
```

#### Small Labels
```tsx
<span className="text-xs text-muted-foreground uppercase tracking-wide">
  Label
</span>
```

### Usage Rules

#### ✅ DO
- Use `text-white` only for hero sections and high-contrast needs
- Use `text-foreground` for primary content
- Use `text-muted-foreground` for secondary content
- Combine size and weight: `text-2xl font-bold`
- Maintain hierarchical consistency across pages

#### ❌ DON'T
- Don't skip heading levels (h1 → h3)
- Don't use more than 3 font weights on a page
- Don't use text smaller than `text-xs` (12px)
- Don't use `text-white` for body text on colored backgrounds

---

## Spacing & Layout

### Spacing Scale

The spacing system uses Tailwind's default 4px base unit:

```
0   : 0px
1   : 4px
2   : 8px
3   : 12px
4   : 16px
5   : 20px
6   : 24px
8   : 32px
10  : 40px
12  : 48px
16  : 64px
20  : 80px
24  : 96px
```

### Common Spacing Patterns

#### Container Padding
```tsx
<div className="container mx-auto px-6 py-8">
  {/* Mobile: 24px, Desktop: 32px */}
</div>
```

#### Card Padding
```tsx
<Card className="p-6">
  {/* 24px all sides */}
</Card>
```

#### Section Spacing
```tsx
<section className="mb-12">
  {/* 48px bottom margin between sections */}
</section>
```

#### Grid Gaps
```tsx
<div className="grid grid-cols-4 gap-4">
  {/* 16px between grid items */}
</div>
```

### Layout Structure

#### Page Layout
```tsx
<div className="min-h-screen bg-background">
  <header className="border-b border-white/10 bg-card">
    <div className="container mx-auto px-6 py-4">
      {/* Navigation */}
    </div>
  </header>
  
  <main className="container mx-auto px-6 py-8">
    {/* Content */}
  </main>
</div>
```

#### Two-Column Layout
```tsx
<div className="grid md:grid-cols-2 gap-6">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

#### Three-Column Stats Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>
```

### Border Radius System

```css
--radius: 1rem (16px)        /* Base radius */

rounded-lg : var(--radius)      /* 16px - Cards, buttons */
rounded-md : calc(var(--radius) - 2px)  /* 14px - Medium */
rounded-sm : calc(var(--radius) - 4px)  /* 12px - Small */
rounded-xl : 0.75rem            /* 12px - Larger cards */
rounded-full : 9999px           /* Full circle - avatars, badges */
```

### Shadows

```css
shadow-soft: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)
```

#### Usage
```tsx
<Card className="shadow-card">
  {/* Elevated card */}
</Card>
```

---

## Components

### Buttons

#### Primary Button
```tsx
<Button className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90">
  Create Room
</Button>
```
**Usage**: Main CTAs, primary actions
**States**: default, hover (opacity-90), active, disabled

#### Secondary Button
```tsx
<Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
  Join Room
</Button>
```
**Usage**: Secondary actions, cancel buttons
**States**: default, hover (bg-white/10), active, disabled

#### Ghost Button
```tsx
<Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
  <Settings className="w-5 h-5" />
</Button>
```
**Usage**: Icon buttons, less prominent actions
**States**: default, hover (text-white, bg-white/10)

#### Button Sizes
```tsx
<Button size="sm">Small</Button>      {/* 32px height */}
<Button size="default">Default</Button> {/* 40px height */}
<Button size="lg">Large</Button>       {/* 48px height */}
<Button size="icon">Icon</Button>      {/* 40x40px square */}
```

### Cards

#### Standard Card
```tsx
<Card className="bg-card border-white/10">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

#### Stat Card
```tsx
<Card className="bg-[#0a1628] border-white/10">
  <CardContent className="p-4 flex items-center gap-3">
    <Trophy className="w-8 h-8 text-warning" />
    <div>
      <p className="text-white/60 text-sm">Global Rank</p>
      <p className="text-warning text-2xl font-bold">#156</p>
    </div>
  </CardContent>
</Card>
```

#### Trade Room Card
```tsx
<Card 
  className="bg-card border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
  onClick={() => navigate(`/bullpen/${id}`)}
>
  <CardContent className="p-6">
    <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="grid grid-cols-2 gap-4">
      {/* Stats */}
    </div>
  </CardContent>
</Card>
```

### Badges

#### Status Badge
```tsx
<Badge className="bg-success text-white border-0 rounded-md px-3 py-1">
  {count}
</Badge>
```

#### Notification Badge
```tsx
<Badge className="absolute -top-1 -right-1 bg-danger text-white border-0 h-5 w-5 flex items-center justify-center p-0 text-xs">
  {notificationCount}
</Badge>
```

#### Level Badge
```tsx
<Badge className="bg-brand-purple text-white border-0 h-10 w-10 flex items-center justify-center rounded-full text-sm font-bold">
  42
</Badge>
```

### Avatars

#### User Avatar
```tsx
<Avatar className="w-9 h-9">
  <AvatarFallback className="bg-gradient-to-br from-brand-purple to-brand-blue text-white">
    {user.email?.[0].toUpperCase()}
  </AvatarFallback>
</Avatar>
```

#### Large Avatar with Badge
```tsx
<div className="relative">
  <Avatar className="w-24 h-24">
    <AvatarFallback className="bg-gradient-to-br from-brand-purple to-brand-blue text-white text-2xl">
      {initial}
    </AvatarFallback>
  </Avatar>
  <Badge className="absolute -bottom-1 -right-1 bg-brand-purple text-white border-0 h-10 w-10 flex items-center justify-center rounded-full">
    {level}
  </Badge>
</div>
```

### Inputs

#### Text Input
```tsx
<Input
  id="symbol"
  type="text"
  placeholder="Enter stock symbol"
  className="bg-background border-border text-foreground"
/>
```

#### Label + Input
```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-foreground">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    className="bg-background border-border"
  />
</div>
```

### Tables

#### Position Table
```tsx
<Table>
  <TableHeader>
    <TableRow className="border-white/10">
      <TableHead className="text-white/60">Symbol</TableHead>
      <TableHead className="text-white/60 text-right">Shares</TableHead>
      <TableHead className="text-white/60 text-right">Price</TableHead>
      <TableHead className="text-white/60 text-right">Value</TableHead>
      <TableHead className="text-white/60 text-right">Change</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-white/10 hover:bg-white/5">
      <TableCell className="font-medium text-white">{symbol}</TableCell>
      <TableCell className="text-right text-foreground">{quantity}</TableCell>
      <TableCell className="text-right text-foreground">${price}</TableCell>
      <TableCell className="text-right text-foreground">${value}</TableCell>
      <TableCell className={`text-right ${change >= 0 ? 'text-success' : 'text-danger'}`}>
        {change >= 0 ? '+' : ''}{change}%
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Popover/Dropdown

#### Navigation Popover
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon">
      <Bell className="w-5 h-5" />
    </Button>
  </PopoverTrigger>
  <PopoverContent 
    className="p-0 bg-card border-white/10 z-50" 
    align="end"
    sideOffset={8}
  >
    {/* Content */}
  </PopoverContent>
</Popover>
```

**Important**: Always set `z-50` or higher on PopoverContent to ensure proper layering.

---

## States & Interactions

### Hover States

#### Cards
```tsx
className="hover:border-primary/50 transition-colors cursor-pointer"
```

#### Buttons
```tsx
className="hover:opacity-90"  /* For gradient buttons */
className="hover:bg-white/10" /* For ghost buttons */
```

#### Links
```tsx
className="hover:text-primary transition-colors"
```

### Focus States

All interactive elements should have visible focus states:
```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
```

### Loading States

#### Button Loading
```tsx
<Button disabled={loading}>
  {loading ? "Loading..." : "Place Order"}
</Button>
```

#### Page Loading
```tsx
{loading && (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-foreground">Loading...</div>
  </div>
)}
```

### Empty States

#### No Data
```tsx
<div className="text-center py-12">
  <p className="text-muted-foreground mb-4">No active trade rooms yet</p>
  <Button onClick={() => setCreateOpen(true)}>
    Create Your First Room
  </Button>
</div>
```

### Error States

#### Form Error
```tsx
<Alert className="bg-danger/10 border-danger text-danger">
  <AlertDescription>
    Insufficient funds to place this order
  </AlertDescription>
</Alert>
```

#### Toast Notification
```tsx
toast.error("Error placing order");
toast.success("Order placed successfully");
```

### Success States

#### Positive P&L
```tsx
<span className="text-success font-semibold">
  +$12,450.00
</span>
```

#### Success Badge
```tsx
<Badge className="bg-success text-white">Active</Badge>
```

---

## Animations

### Transitions

#### Default Transition
```tsx
className="transition-colors duration-200"
```

#### Hover Scale
```tsx
className="transition-transform duration-200 hover:scale-105"
```

### Built-in Animations

#### Fade In
```tsx
className="animate-fade-in"
```
Duration: 300ms, ease-out

#### Accordion
```tsx
className="animate-accordion-down"  /* Opening */
className="animate-accordion-up"    /* Closing */
```
Duration: 200ms, ease-out

### Micro-interactions

#### Button Press
```tsx
className="active:scale-95 transition-transform"
```

#### Icon Spin (Loading)
```tsx
<Loader className="w-4 h-4 animate-spin" />
```

---

## Responsive Behavior

### Breakpoints

```
sm : 640px   - Small devices
md : 768px   - Medium devices (tablets)
lg : 1024px  - Large devices (desktops)
xl : 1280px  - Extra large devices
2xl: 1400px  - Container max-width
```

### Responsive Patterns

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stacks on mobile, 2 cols on tablet, 4 cols on desktop */}
</div>
```

#### Responsive Text
```tsx
<h1 className="text-3xl md:text-4xl lg:text-6xl font-bold">
  {/* Scales up on larger screens */}
</h1>
```

#### Responsive Padding
```tsx
<div className="px-4 md:px-6 lg:px-8">
  {/* Increases padding on larger screens */}
</div>
```

#### Hide on Mobile
```tsx
<div className="hidden md:block">
  {/* Only shows on tablet and up */}
</div>
```

#### Mobile-only
```tsx
<div className="block md:hidden">
  {/* Only shows on mobile */}
</div>
```

---

## Do's and Don'ts

### Layout

#### ✅ DO
- Use consistent spacing between sections (mb-8, mb-12)
- Maintain 24px minimum padding on mobile containers
- Use grid layouts for equal-width items
- Keep content within `container` max-width (1400px)
- Use `flex` for toolbar and navigation layouts

#### ❌ DON'T
- Don't use arbitrary pixel values (use spacing scale)
- Don't nest containers inside containers
- Don't use `w-full` without `max-w-*` on large screens
- Don't create layouts wider than 1400px

### Colors

#### ✅ DO
- Use semantic color tokens for all backgrounds and text
- Use `text-success` for positive financial values
- Use `text-danger` for negative financial values
- Use `text-warning` for pending or cautionary states
- Apply opacity with `/10`, `/20`, `/60` suffixes

#### ❌ DON'T
- Don't use hard-coded color values
- Don't use `text-white` or `text-black` for body text
- Don't mix success and danger colors
- Don't use low-contrast color combinations

### Typography

#### ✅ DO
- Use heading hierarchy (h1 → h2 → h3)
- Use `text-muted-foreground` for secondary text
- Combine font size and weight in one className
- Use `uppercase tracking-wide` for small labels

#### ❌ DON'T
- Don't use more than 3 font sizes on one component
- Don't use font sizes smaller than 12px
- Don't use all caps for body text
- Don't mix font weights randomly

### Components

#### ✅ DO
- Use `Card` for grouped information
- Use `Badge` for counts and status
- Use gradient backgrounds only for CTAs and brand elements
- Apply hover states to all interactive elements
- Use icons from `lucide-react`

#### ❌ DON'T
- Don't nest cards more than 2 levels deep
- Don't use gradients on every button
- Don't omit focus states on interactive elements
- Don't mix icon libraries

### Interactions

#### ✅ DO
- Add hover effects to clickable items
- Show loading states during async operations
- Provide clear error messages
- Use toast notifications for feedback
- Disable buttons during form submission

#### ❌ DON'T
- Don't use `cursor-pointer` without hover effects
- Don't submit forms without validation
- Don't show generic error messages
- Don't allow multiple rapid clicks on action buttons

---

## Implementation Checklist

When creating a new page or component:

- [ ] Uses only semantic color tokens (no hard-coded colors)
- [ ] Implements proper heading hierarchy
- [ ] Has consistent spacing using the spacing scale
- [ ] Includes hover states for interactive elements
- [ ] Has visible focus states for accessibility
- [ ] Shows loading/error/empty states
- [ ] Uses responsive breakpoints for mobile support
- [ ] Applies proper border radius from the system
- [ ] Uses icons consistently from `lucide-react`
- [ ] Follows the established component patterns
- [ ] Maintains contrast ratios for accessibility
- [ ] Includes proper transitions/animations

---

## Quick Reference

### Common Class Combinations

**Primary CTA**
```
bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg
```

**Secondary Button**
```
border border-white/20 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg
```

**Stat Card**
```
bg-card border border-white/10 rounded-lg p-6
```

**Positive Value**
```
text-success font-semibold
```

**Negative Value**
```
text-danger font-semibold
```

**Section Heading**
```
text-2xl font-bold text-white mb-6
```

**Muted Text**
```
text-sm text-muted-foreground
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker)
