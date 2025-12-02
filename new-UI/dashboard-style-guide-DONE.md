# 🎨 Dashboard (Main Page) - UI Style Guide

## 📋 Overview
The main dashboard combines TopBar navigation, PlayerProfile header, SearchBar with filters, CurrentGames section, and AvailableGames section. Professional fintech theme with dark navy backgrounds.

---

## 🎨 Global Color System

### **Brand Colors**
```css
Primary Blue:     hsl(199, 89%, 48%)  /* #0BA5EC */
Primary Purple:   hsl(262, 83%, 58%)  /* #7C3AED */
```

### **Semantic Colors**
```css
Success:          hsl(142, 76%, 36%)  /* #16A34A */
Warning:          hsl(43, 96%, 56%)   /* #F59E0B */
Danger:           hsl(0, 84%, 60%)    /* #EF4444 */
```

### **Background Colors (Dark Mode)**
```css
Background:       hsl(222, 47%, 11%)  /* #0D1829 */
Card:             hsl(222, 43%, 15%)  /* #152035 */
Muted:            hsl(222, 43%, 20%)  /* #1C2842 */
```

### **Text Colors**
```css
Foreground:       hsl(210, 20%, 98%)  /* #F8FAFC */
Muted Foreground: hsl(210, 20%, 65%)  /* #93A3B8 */
```

### **Border Colors**
```css
Border:           hsl(222, 43%, 25%)  /* #243049 */
```

---

## 📐 Typography

### **Font Sizes**
```css
text-2xl:         24px  /* 1.5rem - Large headings */
text-xl:          20px  /* 1.25rem - Section headings */
text-lg:          18px  /* 1.125rem - Subsection headings */
text-base:        16px  /* 1rem - Default body */
text-sm:          14px  /* 0.875rem - Small text */
text-xs:          12px  /* 0.75rem - Extra small */
```

### **Font Weights**
```css
Medium:           500
Normal:           400
```

---

## 🎯 Component Breakdown

---

## 1️⃣ **Top Bar (TopBar.tsx)**

### **Layout**
```css
Background:       bg-card
Border:           border-b border-border
Position:         sticky top-0
Z-index:          z-50
Backdrop:         backdrop-blur-sm
Height:           h-16 (64px)
Max Width:        max-w-7xl mx-auto
Padding:          px-4 (16px horizontal)
```

### **Logo Section**
```css
/* Logo Container */
Size:             w-8 h-8 (mobile), w-10 h-10 (desktop)
Background:       gradient-primary
Border Radius:    rounded-lg (8px)
Shadow:           shadow-lg
Display:          flex items-center justify-center

/* Logo Text */
Font Size:        text-sm (mobile), text-base (desktop)
Color:            white

/* Brand Name */
Font Size:        text-base
Color:            foreground
Display:          hidden sm:block (mobile hidden)
```

### **Action Buttons**
```css
/* Base Button */
Padding:          p-2 (8px)
Border Radius:    rounded-lg (8px)
Text Color:       muted-foreground
Transition:       transition-colors

/* Hover State */
Text Color:       brand-blue
Background:       bg-muted

/* Icon Size */
Width/Height:     w-5 h-5 (20px)

/* Notification Badge */
Size:             w-5 h-5
Background:       bg-danger
Border Radius:    rounded-full
Position:         absolute top-0.5 right-0.5
Text:             text-xs (12px), white, centered
```

### **Profile Button**
```css
/* Avatar */
Size:             w-8 h-8
Border Radius:    rounded-full
Ring:             ring-2 ring-brand-blue/50
Object Fit:       cover

/* Container */
Padding:          p-2
Border Radius:    rounded-lg
Hover:            bg-muted
Display:          flex items-center gap-2
```

### **Dropdown Menus**
```css
/* Container */
Width:            w-screen max-w-md (invites), w-56 (profile)
Background:       bg-card
Border:           border border-border
Border Radius:    rounded-xl (12px)
Shadow:           shadow-2xl
Position:         absolute right-0 mt-2
Z-index:          z-20
Max Height:       max-h-[80vh] (invites only)

/* Header */
Padding:          p-3 sm:p-4
Border:           border-b border-border
Background:       gradient-card

/* Menu Items */
Padding:          px-3 py-2
Border Radius:    rounded-lg
Gap:              gap-3
Hover:            bg-muted
Text Size:        text-sm
```

---

## 2️⃣ **Player Profile (PlayerProfile.tsx)**

### **Container**
```css
Background:       gradient-card
Backdrop:         backdrop-blur-sm
Border Radius:    rounded-2xl (16px)
Padding:          p-4 sm:p-6
Border:           border border-border
Shadow:           shadow-lg
Margin Bottom:    mb-8
```

### **Avatar Section**
```css
/* Avatar Image */
Size:             w-20 h-20 (mobile), w-24 h-24 (desktop)
Border Radius:    rounded-full
Object Fit:       cover
Ring:             ring-4 ring-brand-blue/30

/* Level Badge */
Size:             w-8 h-8 (mobile), w-10 h-10 (desktop)
Background:       gradient-primary
Border Radius:    rounded-full
Position:         absolute -bottom-2 -right-2
Shadow:           shadow-lg
Display:          flex items-center justify-center
Text Size:        text-xs (mobile), text-sm (desktop)
Text Color:       white
```

### **User Info**
```css
/* Name */
Font Size:        text-base (h2 default)
Color:            foreground
Margin Bottom:    mb-1

/* Username */
Font Size:        text-sm sm:text-base
Color:            muted-foreground
Margin Bottom:    mb-2

/* Earnings Badge */
Display:          flex items-center gap-1
Color:            success
Font Size:        text-xs sm:text-sm
Icon:             w-4 h-4
```

### **Stats Grid**
```css
/* Grid Container */
Display:          grid grid-cols-2 md:grid-cols-4
Gap:              gap-3 sm:gap-4
Flex:             flex-1

/* Stat Box */
Background:       bg-muted/30
Border Radius:    rounded-xl (12px)
Padding:          p-3 sm:p-4
Border:           border border-border/50
Hover:            border-brand-blue/50
Transition:       transition-colors

/* Icon & Label */
Display:          flex items-center gap-2
Margin Bottom:    mb-2
Icon Size:        w-4 h-4
Label Size:       text-xs sm:text-sm
Label Color:      muted-foreground

/* Value */
Font Size:        text-lg sm:text-xl
Color:            Varies by stat type
```

### **Stat Colors**
```css
Global Rank:      text-warning (gold)
Win Rate:         text-success (green)
Total Rooms:      text-brand-blue (cyan)
Total Wins:       text-brand-purple (purple)
```

---

## 3️⃣ **Search Bar (SearchBar.tsx)**

### **Container**
```css
Margin Bottom:    mb-6 sm:mb-8
Display:          flex flex-col sm:flex-row
Gap:              gap-3
```

### **Search Input**
```css
/* Container */
Position:         relative
Flex:             flex-1

/* Input */
Width:            w-full
Padding:          pl-12 pr-4 py-3
Background:       bg-card
Border:           border border-border
Border Radius:    rounded-xl (12px)
Text Color:       foreground
Placeholder:      muted-foreground
Font Size:        text-sm sm:text-base

/* Focus State */
Outline:          none
Border:           brand-blue
Ring:             2px ring-brand-blue/20
Transition:       transition-all

/* Search Icon */
Position:         absolute left-4 top-1/2 -translate-y-1/2
Size:             w-5 h-5
Color:            muted-foreground
```

### **Action Buttons**
```css
/* Create Room Button */
Background:       gradient-success
Text Color:       white
Padding:          px-4 sm:px-6 py-3
Border Radius:    rounded-xl (12px)
Display:          flex items-center justify-center gap-2
Font Size:        text-sm sm:text-base
Hover:            shadow-lg
Transition:       transition-all
White Space:      nowrap

/* Filter Button */
Background:       gradient-primary
Text Color:       white
Padding:          px-4 sm:px-6 py-3
Border Radius:    rounded-xl (12px)
Display:          flex items-center justify-center gap-2
Font Size:        text-sm sm:text-base
Hover:            shadow-lg
Icon Size:        w-5 h-5
```

---

## 4️⃣ **Game Card (GameCard.tsx)**

### **Container**
```css
Background:       gradient-card
Backdrop:         backdrop-blur-sm
Border Radius:    rounded-xl (12px)
Padding:          p-4 sm:p-5
Border:           border border-border
Transition:       transition-all
Hover:            transform scale-[1.02], shadow-xl

/* Creator Variant */
Border:           border-success/50
Hover Border:     border-success
Ring:             ring-2 ring-success/20
```

### **Creator Badge**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-3
Padding:          px-2 sm:px-3 py-1.5
Background:       bg-success/10
Border:           border border-success/30
Border Radius:    rounded-lg
Width:            w-fit

Icon:             w-3 h-3 sm:w-4 h-4, text-success
Text:             text-xs sm:text-sm, text-success
```

### **Header Section**
```css
Display:          flex items-start justify-between
Margin Bottom:    mb-3 sm:mb-4
Gap:              gap-2

/* Title */
Font Size:        text-base sm:text-lg
Color:            foreground
Margin Bottom:    mb-1

/* Subtitle */
Font Size:        text-xs sm:text-sm
Color:            muted-foreground
```

### **Difficulty Badge**
```css
Padding:          px-2 py-1
Border Radius:    rounded-lg
Font Size:        text-xs
Flex Shrink:      flex-shrink-0

/* Colors by Difficulty */
Beginner:         text-success bg-success/10
Intermediate:     text-brand-blue bg-brand-blue/10
Advanced:         text-warning bg-warning/10
Expert:           text-danger bg-danger/10
```

### **Status Badge (Ending Soon)**
```css
Padding:          px-2 py-1
Background:       bg-danger/10
Color:            text-danger
Border Radius:    rounded-lg
Font Size:        text-xs
Display:          flex items-center gap-1
Icon:             w-3 h-3
```

### **Stats Section**
```css
/* Container */
Space:            space-y-3
Margin Bottom:    mb-4

/* Stat Row */
Display:          flex items-center justify-between
Font Size:        text-sm

/* Label */
Display:          flex items-center gap-2
Color:            muted-foreground
Icon:             w-4 h-4

/* Value */
Color:            foreground (default)
```

### **Stat Value Colors**
```css
Position (#1):    text-warning (gold)
Position (#2-3):  text-brand-blue (cyan)
Position (#4-10): text-success (green)
Position (>10):   text-muted-foreground
Portfolio:        text-brand-purple
Stars:            text-warning with star icon
Entry Fee:        text-foreground
```

### **Progress Bar**
```css
/* Container */
Width:            w-full
Background:       bg-muted/50
Border Radius:    rounded-full
Height:           h-2
Margin Bottom:    mb-4

/* Fill */
Background:       gradient-primary
Height:           h-2
Border Radius:    rounded-full
Transition:       transition-all
Width:            Dynamic (players/maxPlayers * 100%)
```

### **Action Button**
```css
/* Active Room Button */
Width:            w-full
Padding:          py-2
Border Radius:    rounded-lg
Background:       gradient-primary
Text Color:       white
Hover:            shadow-lg
Transition:       transition-all

/* Join Room Button */
Background:       bg-success
Hover:            bg-success/90
```

---

## 5️⃣ **Section Headers**

### **Current Games Section**
```css
Display:          flex flex-wrap items-center gap-2 sm:gap-3
Margin Bottom:    mb-4

/* Icon */
Size:             w-5 h-5 sm:w-6 h-6
Color:            text-brand-purple

/* Heading */
Font Size:        text-lg sm:text-xl
Color:            foreground

/* Count Badge */
Padding:          px-2 sm:px-3 py-1
Background:       bg-brand-purple/10
Color:            text-brand-purple
Border Radius:    rounded-full
Font Size:        text-xs sm:text-sm
```

### **Available Games Section**
```css
/* Same as Current Games but with success color */
Icon Color:       text-success
Badge Background: bg-success/10
Badge Color:      text-success
```

---

## 🌈 Gradients

```css
.gradient-primary {
  background: linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(262, 83%, 58%) 100%);
}

.gradient-success {
  background: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 46%) 100%);
}

.gradient-card {
  background: linear-gradient(135deg, hsl(222, 43%, 15%) 0%, hsl(222, 43%, 17%) 100%);
}
```

---

## 📏 Spacing System

```css
Gap 1:            4px   (gap-1)
Gap 2:            8px   (gap-2)
Gap 3:            12px  (gap-3)
Gap 4:            16px  (gap-4)
Gap 6:            24px  (gap-6)
Margin Bottom 1:  4px   (mb-1)
Margin Bottom 2:  8px   (mb-2)
Margin Bottom 3:  12px  (mb-3)
Margin Bottom 4:  16px  (mb-4)
Margin Bottom 6:  24px  (mb-6)
Margin Bottom 8:  32px  (mb-8)
Padding 2:        8px   (p-2)
Padding 3:        12px  (p-3)
Padding 4:        16px  (p-4)
Padding 5:        20px  (p-5)
Padding 6:        24px  (p-6)
```

---

## 📱 Responsive Breakpoints

### **Breakpoint Values**
```css
sm:   640px   /* Small devices */
md:   768px   /* Medium devices */
lg:   1024px  /* Large devices */
xl:   1280px  /* Extra large devices */
```

### **Grid Layouts**
```css
/* Game Cards */
Base:             grid-cols-1
Medium:           md:grid-cols-2
Large:            lg:grid-cols-3

/* Player Profile Stats */
Base:             grid-cols-2
Medium:           md:grid-cols-4
```

---

## 🎭 Interactive States

### **Hover Effects**
```css
/* Cards */
Transform:        scale-[1.02]
Shadow:           shadow-xl
Border:           border-brand-blue/50 (or border-success for creator)

/* Buttons */
Shadow:           shadow-lg
Text Color:       brand-blue → brand-purple (text links)
Background:       bg-muted (icon buttons)

/* Stat Boxes */
Border:           border-brand-blue/50
```

### **Focus States**
```css
Outline:          none
Border:           brand-blue
Ring:             2px ring-brand-blue/20
```

---

## 📦 Grid & Flex Layouts

```css
/* Dashboard Main Container */
Max Width:        max-w-7xl mx-auto
Padding:          px-4

/* Player Profile */
Display:          flex flex-col md:flex-row
Gap:              gap-4 md:gap-6

/* Search Bar */
Display:          flex flex-col sm:flex-row
Gap:              gap-3

/* Game Cards Grid */
Display:          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Gap:              gap-3 sm:gap-4
```

---

## ♿ Accessibility

- Semantic HTML structure
- Focus states clearly visible
- Interactive elements have hover states
- Icon buttons have accessible labels
- Color contrast meets WCAG standards
- Responsive touch targets (minimum 44×44px)
- Screen reader friendly labels

---

## 📝 Notes

- All cards use gradient-card background for consistent depth
- Backdrop blur creates glassmorphism effect
- Creator badges highlighted with success color
- Position rankings use color-coded system
- Stars system integrated throughout
- Responsive design prioritizes mobile-first
- Truncate text prevents layout breaking
