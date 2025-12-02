# 🎨 Leaderboard Component - UI Style Guide

## 📋 Overview
The Leaderboard component displays ranked players in a trade room with star-based rewards, highlighting the current user and showing finish rewards for top 3 positions. Sticky sidebar design.

---

## 🎨 Color System

### **Brand Colors**
```css
Primary Blue:     hsl(199, 89%, 48%)  /* #0BA5EC */
Primary Purple:   hsl(262, 83%, 58%)  /* #7C3AED */
```

### **Semantic Colors**
```css
Success:          hsl(142, 76%, 36%)  /* #16A34A - Positive changes */
Warning:          hsl(43, 96%, 56%)   /* #F59E0B - Gold medals, stars */
Danger:           hsl(0, 84%, 60%)    /* #EF4444 */
```

### **Background Colors**
```css
Background:       hsl(222, 47%, 11%)  /* #0D1829 */
Card:             hsl(222, 43%, 15%)  /* #152035 */
Muted:            hsl(222, 43%, 20%)  /* #1C2842 */
Muted/20:         rgba(28, 40, 66, 0.2)
Muted/40:         rgba(28, 40, 66, 0.4)
```

### **Text Colors**
```css
Foreground:       hsl(210, 20%, 98%)  /* #F8FAFC */
Muted Foreground: hsl(210, 20%, 65%)  /* #93A3B8 */
```

### **Border Colors**
```css
Border:           hsl(222, 43%, 25%)  /* #243049 */
Border/30:        rgba(36, 48, 73, 0.3)
```

---

## 📐 Typography

### **Font Sizes**
```css
text-xl:          20px  /* 1.25rem - Heading */
text-base:        16px  /* 1rem - Player names */
text-sm:          14px  /* 0.875rem - Stats, button */
text-xs:          12px  /* 0.75rem - Username, labels */
```

---

## 🏗️ Container

### **Main Card**
```css
Background:       gradient-card
Backdrop:         backdrop-blur-sm
Border Radius:    rounded-2xl (16px)
Padding:          p-6 (24px)
Border:           border border-border
Shadow:           shadow-lg
Position:         sticky top-24
```

---

## 🎯 Header Section

### **Layout**
```css
Display:          flex items-center gap-3
Margin Bottom:    mb-6
```

### **Icon Container**
```css
Padding:          p-2
Background:       bg-warning/20
Border Radius:    rounded-lg
Icon:             Trophy, w-5 h-5, text-warning
```

### **Text Section**
```css
/* Heading */
Font Size:        text-xl (h2 default)
Color:            foreground
Margin Bottom:    mb-1

/* Subtitle */
Font Size:        text-sm
Color:            muted-foreground
```

---

## 🏆 Finish Rewards Section

### **Container**
```css
Margin Bottom:    mb-6
Padding:          p-4
Background:       bg-muted/20
Border Radius:    rounded-lg
Border:           border border-border/30
```

### **Label**
```css
Font Size:        text-xs
Color:            muted-foreground
Text Transform:   uppercase
Letter Spacing:   tracking-wide
Margin Bottom:    mb-3
```

### **Rewards Grid**
```css
Display:          flex justify-between
Gap:              gap-2
```

### **Reward Card**
```css
Flex:             flex-1
Border Radius:    rounded-lg
Padding:          p-3
Text Align:       text-center
Border:           border border-border/30

/* Icon */
Size:             w-4 h-4
Margin:           mx-auto mb-1

/* Place Label */
Font Size:        text-xs
Color:            foreground
Margin Bottom:    mb-1

/* Stars Display */
Display:          flex items-center justify-center gap-1
Star Icon:        w-3 h-3, text-warning, fill-warning
Value:            text-sm, foreground
```

### **Reward Colors by Position**
```css
/* 1st Place */
Text Color:       text-warning
Background:       bg-warning/20

/* 2nd Place */
Text Color:       text-muted-foreground
Background:       bg-muted/40

/* 3rd Place */
Text Color:       text-warning/70
Background:       bg-warning/10
```

---

## 👥 Player List

### **Container**
```css
Space:            space-y-2
```

### **Player Row**
```css
Display:          flex items-center gap-3
Padding:          p-3
Border Radius:    rounded-lg
Transition:       transition-all

/* Regular Player */
Background:       bg-muted/20
Border:           border border-border/30
Hover:            bg-muted/40

/* Current User */
Background:       gradient-primary with bg-opacity-10
Border:           border-2 border-brand-blue
Shadow:           shadow-lg
```

---

## 🔢 Rank Display

### **Container**
```css
Display:          flex items-center justify-center
Width:            w-8
```

### **Top 3 (Medal)**
```css
Icon:             Medal
Size:             w-5 h-5
Color:            Varies by rank
```

### **Medal Colors**
```css
1st Place:        text-warning (gold)
2nd Place:        text-muted-foreground (silver)
3rd Place:        text-warning (bronze)
```

### **Rank 4+**
```css
Font Size:        text-sm
Color:            muted-foreground
Format:           "#{rank}"
```

---

## 👤 Player Info Section

### **Avatar**
```css
Size:             w-10 h-10
Border Radius:    rounded-full
Object Fit:       cover

/* Current User Ring */
Ring:             ring-2 ring-brand-blue
```

### **Name & Username**
```css
/* Container */
Flex:             flex-1
Min Width:        min-w-0

/* Name */
Font Size:        text-base
Color:            foreground
Truncate:         truncate

/* Current User Badge */
Color:            text-brand-blue
Margin Left:      ml-2
Font Size:        text-xs
Text:             "(You)"

/* Username */
Font Size:        text-xs
Color:            muted-foreground
Truncate:         truncate
```

---

## 📊 Stats Section

### **Container**
```css
Text Align:       text-right
```

### **Portfolio Value**
```css
Font Size:        text-sm
Color:            foreground
Format:           ${value.toLocaleString()}
```

### **Change Display**
```css
Display:          flex items-center justify-end gap-1
Color:            text-success
Font Size:        text-xs

/* Icon */
Icon:             TrendingUp
Size:             w-3 h-3

/* Value */
Format:           "+{change}%"
```

---

## 🔘 View Full Button

### **Styling**
```css
Width:            w-full
Margin Top:       mt-4
Padding:          py-2
Background:       bg-muted
Hover:            bg-border
Text Color:       foreground
Border Radius:    rounded-lg
Transition:       transition-colors
Font Size:        text-sm
Text:             "View Full Leaderboard"
```

---

## 🌈 Gradients

```css
.gradient-card {
  background: linear-gradient(135deg, hsl(222, 43%, 15%) 0%, hsl(222, 43%, 17%) 100%);
}

.gradient-primary {
  background: linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(262, 83%, 58%) 100%);
}
```

---

## 📏 Spacing System

```css
Gap 1:            4px   (gap-1)
Gap 2:            8px   (gap-2)
Gap 3:            12px  (gap-3)
Margin Bottom 1:  4px   (mb-1)
Margin Bottom 3:  12px  (mb-3)
Margin Bottom 6:  24px  (mb-6)
Margin Left 2:    8px   (ml-2)
Margin Top 4:     16px  (mt-4)
Padding 2:        8px   (p-2)
Padding 3:        12px  (p-3)
Padding 4:        16px  (p-4)
Padding 6:        24px  (p-6)
Space Y 2:        8px   (space-y-2)
```

---

## 📱 Responsive Behavior

### **Sticky Positioning**
```css
Position:         sticky
Top:              top-24 (96px below viewport top)
```

This keeps the leaderboard visible while scrolling through other content.

---

## 🎭 Interactive States

### **Player Row Hover** (Regular Players Only)
```css
Background:       bg-muted/40
Transition:       transition-all
```

### **View Full Button Hover**
```css
Background:       bg-border
Transition:       transition-colors
```

### **Current User Highlight**
```css
Always visible:   gradient-primary background
Border:           2px border-brand-blue
Shadow:           shadow-lg
No hover effect:  Maintains highlight state
```

---

## 🏅 Star Rewards System

### **Reward Tiers**
```javascript
1st Place:        500 stars
2nd Place:        300 stars
3rd Place:        150 stars
```

### **Display Format**
```css
Icon:             Star (filled)
Size:             w-3 h-3
Color:            text-warning fill-warning
Value:            Plain number (no commas for small values)
Alignment:        Center aligned in reward card
```

---

## 📊 Data Display

### **Portfolio Formatting**
```javascript
$26,890           // toLocaleString() with $ prefix
```

### **Change Formatting**
```javascript
+12.4%            // Always positive in this context
```

### **Ranking**
```javascript
#4, #5, #6...     // Hash symbol prefix for ranks 4+
```

---

## ♿ Accessibility

- Rank visually indicated with medals and numbers
- Current user clearly highlighted
- Avatar images have alt text
- Interactive elements have hover states
- Color coded with icons for clarity
- Text truncation prevents layout breaking
- Touch targets meet minimum 44×44px

---

## 📝 Notes

- Sticky positioning keeps leaderboard in view
- Top 3 positions get special medal icons
- Current user row always highlighted
- Star rewards shown prominently
- Portfolio values and changes clearly displayed
- Medal colors: gold (1st/3rd), silver (2nd)
- Gradient background for visual depth
- Compact design for sidebar placement
- Reward cards use semi-transparent backgrounds
- Truncation ensures names don't break layout
