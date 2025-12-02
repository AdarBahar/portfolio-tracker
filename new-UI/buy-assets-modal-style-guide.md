# 🎨 Buy Assets Modal - UI Style Guide

## 📋 Overview
Full-screen modal for searching and purchasing assets with autocomplete, order types (market/limit), cost calculations, and educational stock information integration.

---

## 🎨 Color System

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
```

---

## 📐 Typography

### **Font Sizes**
```css
text-2xl:         24px  /* 1.5rem - Heading */
text-xl:          20px  /* 1.25rem - Asset price */
text-base:        16px  /* 1rem - Default */
text-sm:          14px  /* 0.875rem - Labels, stats */
text-xs:          12px  /* 0.75rem - Badges, helper text */
```

---

## 🏗️ Modal Structure

### **Overlay (Backdrop)**
```css
Position:         fixed inset-0
Z-index:          z-50
Background:       bg-background/95
Backdrop:         backdrop-blur-sm
Display:          flex items-center justify-center
Padding:          p-4
```

### **Modal Container**
```css
Position:         relative
Width:            w-full max-w-2xl (672px)
Background:       gradient-card
Border Radius:    rounded-2xl (16px)
Border:           border border-border
Shadow:           shadow-2xl
Max Height:       max-h-[90vh]
Overflow:         overflow-hidden
Display:          flex flex-col
```

---

## 🎯 Header Section

### **Layout**
```css
Display:          flex items-center justify-between
Padding:          p-6
Border:           border-b border-border
```

### **Title Section**
```css
/* Heading */
Color:            foreground
Font Size:        text-2xl (h2 default)
Margin Bottom:    mb-1

/* Subtitle */
Color:            muted-foreground
Font Size:        text-sm
```

### **Close Button**
```css
Padding:          p-2
Text Color:       muted-foreground
Hover:            text-foreground, bg-muted
Border Radius:    rounded-lg
Transition:       transition-colors
Icon Size:        w-5 h-5
```

---

## 📝 Content Section

### **Container**
```css
Flex:             flex-1
Overflow:         overflow-y-auto
Padding:          p-6
```

### **Form Spacing**
```css
Space:            space-y-6
```

---

## 🔍 Search Input

### **Container**
```css
Position:         relative
```

### **Label**
```css
Display:          block
Color:            foreground
Margin Bottom:    mb-2
```

### **Input Field**
```css
Width:            w-full
Padding:          pl-10 pr-4 py-3
Background:       bg-muted/30
Border:           border border-border
Border Radius:    rounded-xl (12px)
Text Color:       foreground
Placeholder:      muted-foreground

/* Focus State */
Outline:          none
Border:           brand-blue
Ring:             2px ring-brand-blue/20
```

### **Search Icon**
```css
Position:         absolute left-3 top-1/2 -translate-y-1/2
Size:             w-5 h-5
Color:            muted-foreground
```

---

## 📋 Autocomplete Dropdown

### **Container**
```css
Position:         absolute top-full left-0 right-0
Margin Top:       mt-2
Background:       bg-card
Border:           border border-border
Border Radius:    rounded-xl (12px)
Shadow:           shadow-2xl
Max Height:       max-h-80
Overflow:         overflow-y-auto
Z-index:          z-10
```

### **Suggestion Item**
```css
Width:            w-full
Padding:          p-4
Hover:            bg-muted/50
Transition:       transition-colors
Text Align:       left
Border:           border-b border-border (last:border-b-0)
```

### **Item Layout**
```css
/* Primary Row */
Display:          flex items-center justify-between
Margin Bottom:    mb-1

/* Symbol & Name */
Symbol Color:     foreground
Name Color:       muted-foreground
Name Size:        text-sm
Name Margin:      ml-2

/* Type Badge */
Font Size:        text-xs
Padding:          px-2 py-0.5
Background:       bg-brand-blue/10
Color:            text-brand-blue
Border Radius:    rounded

/* Stats Row */
Display:          flex items-center gap-4
Font Size:        text-sm

/* Price */
Color:            foreground

/* Change */
Color:            text-success (positive), text-danger (negative)
```

---

## 📊 Selected Asset Card

### **Container**
```css
Background:       bg-muted/20
Border:           border border-border
Border Radius:    rounded-xl (12px)
Padding:          p-4
```

### **Asset Header**
```css
Display:          flex items-start justify-between
Margin Bottom:    mb-3
```

### **Left Section**
```css
Flex:             flex-1

/* Symbol & Badge Row */
Display:          flex items-center gap-2
Margin Bottom:    mb-1

/* Symbol */
Font Size:        text-base (h3 default)
Color:            foreground

/* Type Badge */
Font Size:        text-xs
Padding:          px-2 py-0.5
Background:       bg-brand-blue/10
Color:            text-brand-blue
Border Radius:    rounded

/* Learn Button */
Padding:          p-1
Text Color:       brand-purple
Hover:            bg-brand-purple/10
Border Radius:    rounded
Transition:       transition-colors
Margin Left:      ml-auto
Icon:             BookOpen, w-4 h-4

/* Name */
Font Size:        text-sm
Color:            muted-foreground
```

### **Right Section (Price)**
```css
Text Align:       text-right
Margin Left:      ml-3

/* Price */
Font Size:        text-xl
Color:            foreground

/* Change */
Display:          flex items-center justify-end gap-1
Font Size:        text-sm
Color:            text-success (positive), text-danger (negative)
Icon:             TrendingUp/TrendingDown, w-4 h-4
```

### **Description**
```css
Font Size:        text-sm
Color:            muted-foreground
Margin Bottom:    mb-3
```

### **Market Stats Grid**
```css
Display:          grid grid-cols-4
Gap:              gap-3
Padding Top:      pt-3
Border:           border-t border-border

/* Stat Item */
/* Label */
Font Size:        text-xs
Color:            muted-foreground
Margin Bottom:    mb-1

/* Value */
Font Size:        text-sm
Color:            foreground
```

---

## 🎛️ Order Type Selector

### **Label**
```css
Display:          block
Color:            foreground
Margin Bottom:    mb-2
```

### **Button Grid**
```css
Display:          grid grid-cols-2
Gap:              gap-3
```

### **Order Type Button**
```css
Padding:          p-3
Border Radius:    rounded-xl (12px)
Border:           border
Transition:       transition-all

/* Selected State */
Border:           border-brand-blue
Background:       bg-brand-blue/10
Color:            text-brand-blue

/* Unselected State */
Border:           border-border
Background:       bg-muted/20
Color:            text-muted-foreground
Hover:            border-brand-blue/50

/* Title */
Font Size:        text-base
Margin Bottom:    mb-1

/* Description */
Font Size:        text-xs
Opacity:          opacity-70
```

---

## 💵 Limit Price Input (Conditional)

### **Container**
```css
Position:         relative
Display:          Shown only when orderType === 'limit'
```

### **Input**
```css
Width:            w-full
Padding:          pl-10 pr-4 py-3
Background:       bg-muted/30
Border:           border border-border
Border Radius:    rounded-xl (12px)
Text Color:       foreground
Type:             number
Step:             0.01

/* Focus State */
Outline:          none
Border:           brand-blue
Ring:             2px ring-brand-blue/20
```

### **Dollar Icon**
```css
Position:         absolute left-3 top-1/2 -translate-y-1/2
Size:             w-5 h-5
Color:            muted-foreground
```

---

## 🔢 Quantity Input

### **Label**
```css
Display:          block
Color:            foreground
Margin Bottom:    mb-2
```

### **Input**
```css
Width:            w-full
Padding:          px-4 py-3
Background:       bg-muted/30
Border:           border border-border
Border Radius:    rounded-xl (12px)
Text Color:       foreground
Type:             number
Min:              1

/* Focus State */
Outline:          none
Border:           brand-blue
Ring:             2px ring-brand-blue/20
```

### **Helper Text**
```css
Margin Top:       mt-2
Display:          flex items-center gap-2

/* Icon */
Size:             w-4 h-4
Color:            muted-foreground

/* Text */
Font Size:        text-sm
Color:            muted-foreground
```

---

## 💰 Cost Summary Card

### **Container**
```css
Background:       bg-muted/20
Border:           border border-border
Border Radius:    rounded-xl (12px)
Padding:          p-4
Space:            space-y-2
```

### **Summary Row**
```css
Display:          flex items-center justify-between
Font Size:        text-sm

/* Label */
Color:            muted-foreground

/* Value */
Color:            foreground
Format:           toLocaleString with 2 decimal places
```

### **Total Section**
```css
Padding Top:      pt-2
Border:           border-t border-border

/* Total Row */
Display:          flex items-center justify-between
Margin Bottom:    mb-2

/* Total Label */
Color:            foreground

/* Total Value */
Font Size:        text-xl
Color:            foreground

/* Remaining Cash Row */
Font Size:        text-sm

/* Label */
Color:            muted-foreground

/* Value */
Color:            text-success (can afford), text-danger (cannot afford)
```

---

## ⚠️ Alert Messages

### **Insufficient Funds Alert**
```css
Display:          flex items-start gap-2
Padding:          p-3
Background:       bg-danger/10
Border:           border border-danger/30
Border Radius:    rounded-xl (12px)

/* Icon */
Size:             w-5 h-5
Color:            text-danger
Flex Shrink:      flex-shrink-0
Margin Top:       mt-0.5

/* Title */
Color:            text-danger
Font Size:        text-base

/* Description */
Color:            text-danger/80
Font Size:        text-sm
```

---

## 🎬 Footer Section

### **Container**
```css
Padding:          p-6
Border:           border-t border-border
Background:       bg-muted/10
```

### **Button Container**
```css
Display:          flex
Gap:              gap-3
```

### **Cancel Button**
```css
Flex:             flex-1
Padding:          py-3
Background:       bg-muted
Hover:            bg-border
Text Color:       foreground
Border Radius:    rounded-xl (12px)
Transition:       transition-colors
```

### **Buy Button**
```css
Flex:             flex-1
Padding:          py-3
Border Radius:    rounded-xl (12px)
Transition:       transition-all

/* Enabled State */
Background:       gradient-success
Text Color:       white
Hover:            shadow-lg

/* Disabled State */
Background:       bg-muted
Text Color:       muted-foreground
Cursor:           cursor-not-allowed

/* Button Text States */
No Selection:     "Select an Asset"
No Funds:         "Insufficient Funds"
Ready:            "Buy {quantity} {Share/Shares}"
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
Margin Top 2:     8px   (mt-2)
Padding 1:        4px   (p-1)
Padding 2:        8px   (p-2)
Padding 3:        12px  (p-3)
Padding 4:        16px  (p-4)
Padding 6:        24px  (p-6)
```

---

## 🎭 Interactive States

### **Autocomplete Item Hover**
```css
Background:       bg-muted/50
Transition:       transition-colors
```

### **Order Type Button**
```css
/* Hover (Unselected) */
Border:           border-brand-blue/50

/* Selected */
Border:           border-brand-blue
Background:       bg-brand-blue/10
Color:            text-brand-blue
```

### **Close Button Hover**
```css
Text Color:       foreground
Background:       bg-muted
```

### **Learn Button Hover**
```css
Background:       bg-brand-purple/10
```

---

## 📊 Calculations

### **Cost Breakdown**
```javascript
totalCost = selectedAsset.currentPrice * quantity
estimatedFees = totalCost * 0.001  // 0.1% fee
totalWithFees = totalCost + estimatedFees
remainingCash = cashAvailable - totalWithFees
canAfford = remainingCash >= 0
```

### **Max Affordable**
```javascript
maxShares = Math.floor(cashAvailable / selectedAsset.currentPrice)
```

---

## ♿ Accessibility

- Modal traps focus within
- Backdrop click closes modal
- ESC key should close modal (not shown but recommended)
- Input labels properly associated
- Disabled state clearly indicated
- Alert messages have icons and descriptive text
- Interactive elements have hover states
- Touch targets minimum 44×44px

---

## 📝 Notes

- Autocomplete shows on focus and typing
- Search filters by symbol, name, and type
- Limit order shows additional price input
- Fee calculation displayed transparently
- Remaining cash updates in real-time
- Button text dynamically reflects state
- Educational info accessible via BookOpen icon
- Modal centers on screen with padding
- Max height prevents overflow on small screens
- Smooth transitions on all interactive elements
