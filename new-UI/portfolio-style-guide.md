# 🎨 Portfolio Component - UI Style Guide

## 📋 Overview
The Portfolio component displays user holdings, portfolio summary statistics, and provides buy/sell actions. Features both desktop table and mobile card views with educational stock info modals.

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
Warning:          hsl(43, 96%, 56%)   /* #F59E0B - Not used */
Danger:           hsl(0, 84%, 60%)    /* #EF4444 - Negative changes, sell button */
```

### **Background Colors**
```css
Background:       hsl(222, 47%, 11%)  /* #0D1829 */
Card:             hsl(222, 43%, 15%)  /* #152035 */
Muted:            hsl(222, 43%, 20%)  /* #1C2842 */
Muted/20:         rgba(28, 40, 66, 0.2)
Muted/30:         rgba(28, 40, 66, 0.3)
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
Border/50:        rgba(36, 48, 73, 0.5)
```

---

## 📐 Typography

### **Font Sizes**
```css
text-2xl:         24px  /* 1.5rem - Total value */
text-xl:          20px  /* 1.25rem - Asset price, section heading */
text-lg:          18px  /* 1.125rem - Section heading mobile */
text-base:        16px  /* 1rem - Default text */
text-sm:          14px  /* 0.875rem - Labels, secondary text */
text-xs:          12px  /* 0.75rem - Stats labels */
```

### **Font Weights**
```css
Medium:           500   /* Headings */
Normal:           400   /* Body text */
```

---

## 🏗️ Container

### **Main Card Container**
```css
Background:       gradient-card
Backdrop:         backdrop-blur-sm
Border Radius:    rounded-2xl (16px)
Padding:          p-4 sm:p-6
Border:           border border-border
Shadow:           shadow-lg
```

---

## 📊 Header Section

### **Layout**
```css
Display:          flex flex-col sm:flex-row
Alignment:        sm:items-center justify-between
Margin Bottom:    mb-4 sm:mb-6
Gap:              gap-3
```

### **Title Section**
```css
/* Heading */
Font Size:        text-lg sm:text-xl
Color:            foreground
Margin Bottom:    mb-1

/* Subtitle */
Font Size:        text-xs sm:text-sm
Color:            muted-foreground
```

### **Total Value Display**
```css
Text Align:       text-left sm:text-right

/* Label */
Font Size:        text-xs sm:text-sm
Color:            muted-foreground

/* Value */
Font Size:        text-xl sm:text-2xl
Color:            foreground
```

---

## 📈 Portfolio Summary Cards

### **Grid Layout**
```css
Display:          grid grid-cols-3
Gap:              gap-2 sm:gap-4
Margin Bottom:    mb-4 sm:mb-6
```

### **Summary Card**
```css
Background:       bg-muted/30
Border Radius:    rounded-xl (12px)
Padding:          p-3 sm:p-4
Border:           border border-border/50
```

### **Card Content**
```css
/* Icon & Label Row */
Display:          flex items-center gap-1 sm:gap-2
Margin Bottom:    mb-2

/* Icon */
Size:             w-3 h-3 (mobile), w-4 h-4 (desktop)
Color:            Varies by stat type
Flex Shrink:      flex-shrink-0

/* Label */
Font Size:        text-xs sm:text-sm
Color:            muted-foreground
Truncate:         truncate

/* Primary Value */
Font Size:        text-sm sm:text-base
Color:            foreground
Truncate:         truncate

/* Secondary Value */
Font Size:        text-xs
Color:            Varies (success, muted-foreground)
Margin Top:       mt-1
Truncate:         truncate
```

### **Summary Card Icon Colors**
```css
Invested:         text-brand-blue
Cash:             text-success
Day P&L:          text-brand-purple
```

---

## 📋 Holdings Section

---

### **Desktop Table View (lg+)**

```css
Display:          hidden lg:block
Space:            space-y-3
```

#### **Table Header**
```css
Display:          flex items-center justify-between
Font Size:        text-sm
Color:            muted-foreground
Padding Bottom:   pb-2
Border:           border-b border-border

/* Column Widths */
Asset:            flex-1
Shares:           w-24 text-right
Avg Price:        w-28 text-right
Value:            w-28 text-right
Change:           w-24 text-right
Actions:          w-12
```

#### **Table Row**
```css
Display:          flex items-center justify-between
Padding:          p-3
Background:       bg-muted/20
Border Radius:    rounded-lg
Border:           border border-border/30
Hover:            bg-muted/40
Transition:       transition-colors
```

#### **Asset Cell**
```css
Display:          flex items-center gap-3
Flex:             flex-1

/* Logo */
Size:             w-10 h-10
Border Radius:    rounded-lg
Object Fit:       cover

/* Symbol */
Color:            foreground
Font Size:        text-base

/* Name */
Color:            muted-foreground
Font Size:        text-sm
```

#### **Change Cell**
```css
Width:            w-24
Text Align:       text-right
Display:          flex items-center justify-end gap-1

/* Positive */
Color:            text-success
Icon:             TrendingUp, w-4 h-4

/* Negative */
Color:            text-danger
Icon:             TrendingDown, w-4 h-4

/* Percentage */
Font Size:        text-sm
```

#### **Info Button**
```css
Width:            w-12
Display:          flex justify-end
Padding:          p-2
Text Color:       brand-blue
Hover:            bg-brand-blue/10
Border Radius:    rounded-lg
Transition:       transition-colors
Icon Size:        w-4 h-4
```

---

### **Mobile Card View (<lg)**

```css
Display:          lg:hidden
Space:            space-y-3
```

#### **Card Container**
```css
Padding:          p-3
Background:       bg-muted/20
Border Radius:    rounded-lg
Border:           border border-border/30
```

#### **Asset Header Row**
```css
Display:          flex items-center gap-3
Margin Bottom:    mb-3

/* Logo */
Size:             w-10 h-10
Border Radius:    rounded-lg
Object Fit:       cover
Flex Shrink:      flex-shrink-0

/* Name Section */
Flex:             flex-1
Min Width:        min-w-0

/* Symbol */
Color:            foreground
Truncate:         truncate

/* Name */
Color:            muted-foreground
Font Size:        text-xs
Truncate:         truncate

/* Info Button */
Padding:          p-1.5
Text Color:       brand-blue
Hover:            bg-brand-blue/10
Border Radius:    rounded-lg
Flex Shrink:      flex-shrink-0
Icon:             w-4 h-4

/* Change Badge */
Display:          flex items-center gap-1
Flex Shrink:      flex-shrink-0
Font Size:        text-xs
Icon:             w-3 h-3
```

#### **Stats Grid**
```css
Display:          grid grid-cols-2
Gap:              gap-2
Font Size:        text-xs

/* Label */
Color:            muted-foreground

/* Value */
Color:            foreground

/* Right Aligned */
Text Align:       text-right

/* Full Width Row */
Grid Column:      col-span-2
```

---

## 🎯 Action Buttons

### **Button Container**
```css
Display:          grid grid-cols-2
Gap:              gap-3
Margin Top:       mt-4 sm:mt-6
```

### **Buy Assets Button**
```css
Padding:          py-2.5 sm:py-3
Background:       gradient-success
Text Color:       white
Border Radius:    rounded-lg
Font Size:        text-sm sm:text-base
Hover:            shadow-lg
Transition:       transition-all
```

### **Sell Assets Button**
```css
Padding:          py-2.5 sm:py-3
Background:       bg-danger/10
Text Color:       text-danger
Border:           border border-danger
Border Radius:    rounded-lg
Font Size:        text-sm sm:text-base
Hover:            bg-danger, text-white
Transition:       transition-all
```

---

## 🌈 Gradients

```css
.gradient-card {
  background: linear-gradient(135deg, hsl(222, 43%, 15%) 0%, hsl(222, 43%, 17%) 100%);
}

.gradient-success {
  background: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 46%) 100%);
}
```

---

## 📏 Spacing System

```css
Gap 1:            4px   (gap-1)
Gap 2:            8px   (gap-2)
Gap 3:            12px  (gap-3)
Gap 4:            16px  (gap-4)
Margin Bottom 1:  4px   (mb-1)
Margin Bottom 2:  8px   (mb-2)
Margin Bottom 3:  12px  (mb-3)
Margin Bottom 4:  16px  (mb-4)
Margin Bottom 6:  24px  (mb-6)
Margin Top 1:     4px   (mt-1)
Margin Top 4:     16px  (mt-4)
Margin Top 6:     24px  (mt-6)
Padding 3:        12px  (p-3)
Padding 4:        16px  (p-4)
Padding 6:        24px  (p-6)
```

---

## 📱 Responsive Breakpoints

### **Small (sm: 640px+)**
- Increased padding (p-6)
- Larger text sizes
- Horizontal layout for header

### **Large (lg: 1024px+)**
- Desktop table view visible
- Mobile card view hidden
- Larger gap spacing

---

## 🎭 Interactive States

### **Holdings Row Hover**
```css
Background:       bg-muted/40
Transition:       transition-colors
```

### **Info Button Hover**
```css
Background:       bg-brand-blue/10
Text Color:       brand-blue (maintained)
Transition:       transition-colors
```

### **Buy Button Hover**
```css
Shadow:           shadow-lg
Transition:       transition-all
```

### **Sell Button Hover**
```css
Background:       bg-danger
Text Color:       white
Transition:       transition-all
```

---

## 📊 Data Display

### **Price Formatting**
```css
toLocaleString()           /* Comma separators */
toFixed(2)                 /* Two decimal places */
```

### **Change Display**
```css
/* Positive */
Prefix:           "+"
Color:            text-success
Icon:             TrendingUp

/* Negative */
Prefix:           "-" (automatic)
Color:            text-danger
Icon:             TrendingDown
```

---

## ♿ Accessibility

- Table headers clearly defined
- Interactive buttons have hover states
- Color coded changes (with icons for clarity)
- Touch targets minimum 44×44px on mobile
- Truncate prevents text overflow
- Info buttons have title attributes
- Semantic grid layouts

---

## 📝 Notes

- Desktop shows table layout for easy scanning
- Mobile uses card layout for better touch interaction
- Info button opens StockInfoModal for education
- Holdings calculated from shares × current price
- Portfolio summary shows invested, cash, and P&L
- Real-time price updates reflected in UI
- Gradient background provides depth
- Backdrop blur creates glassmorphism effect
