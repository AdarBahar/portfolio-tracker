# 🎨 Stock Info Modal - UI Style Guide

## 📋 Overview
Educational modal providing comprehensive information about stocks and cryptocurrencies, including price drivers, market factors, sector insights, and investment learning tips. Designed to help users understand the stock market better.

---

## 🎨 Color System

### **Brand Colors**
```css
Primary Blue:     hsl(199, 89%, 48%)  /* #0BA5EC */
Primary Purple:   hsl(262, 83%, 58%)  /* #7C3AED */
```

### **Semantic Colors**
```css
Success:          hsl(142, 76%, 36%)  /* #16A34A - Positive factors */
Warning:          hsl(43, 96%, 56%)   /* #F59E0B - General principles, disclaimer */
Danger:           hsl(0, 84%, 60%)    /* #EF4444 - Negative movements */
```

### **Background Colors**
```css
Background:       hsl(222, 47%, 11%)  /* #0D1829 */
Card:             hsl(222, 43%, 15%)  /* #152035 */
Muted:            hsl(222, 43%, 20%)  /* #1C2842 */
Muted/20:         rgba(28, 40, 66, 0.2)

/* Section Backgrounds */
Brand-blue/10:    rgba(11, 165, 236, 0.1)
Brand-purple/10:  rgba(124, 58, 237, 0.1)
Success/10:       rgba(22, 163, 74, 0.1)
Warning/10:       rgba(245, 158, 11, 0.1)
Brand-purple/20:  rgba(124, 58, 237, 0.2)
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
Brand-blue/30:    rgba(11, 165, 236, 0.3)
Brand-purple/30:  rgba(124, 58, 237, 0.3)
Success/30:       rgba(22, 163, 74, 0.3)
Warning/30:       rgba(245, 158, 11, 0.3)
```

---

## 📐 Typography

### **Font Sizes**
```css
text-xl:          20px  /* 1.25rem - Main heading */
text-base:        16px  /* 1rem - Section headings */
text-sm:          14px  /* 0.875rem - Body text, tips */
text-xs:          12px  /* 0.75rem - Disclaimer */
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
Width:            w-full max-w-3xl (768px)
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

### **Container**
```css
Display:          flex items-center justify-between
Padding:          p-6
Border:           border-b border-border
```

### **Left Section**
```css
Display:          flex items-center gap-3

/* Icon Container */
Padding:          p-2
Background:       bg-brand-purple/20
Border Radius:    rounded-lg
Icon:             BookOpen, w-5 h-5, text-brand-purple

/* Title */
Font Size:        text-xl (h2 default)
Color:            foreground
Margin Bottom:    mb-1
Format:           "Learn About {SYMBOL}"

/* Subtitle */
Font Size:        text-sm
Color:            muted-foreground
Text:             Full asset name
```

### **Close Button**
```css
Padding:          p-2
Text Color:       muted-foreground
Hover:            text-foreground, bg-muted
Border Radius:    rounded-lg
Transition:       transition-colors
Icon:             X, w-5 h-5
```

---

## 📝 Content Section

### **Container**
```css
Flex:             flex-1
Overflow:         overflow-y-auto
Padding:          p-6
Space:            space-y-6
```

---

## 📊 Current Price Movement Card

### **Container**
```css
Background:       bg-muted/20
Border:           border border-border
Border Radius:    rounded-xl (12px)
Padding:          p-4
```

### **Header**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-3

/* Icon */
Size:             w-5 h-5
Color:            text-success (positive), text-danger (negative)
Icon:             TrendingUp (positive), TrendingDown (negative)

/* Heading */
Font Size:        text-base (h3 default)
Color:            foreground
```

### **Description Text**
```css
Font Size:        text-sm
Color:            muted-foreground
Margin Bottom:    mb-2 (first paragraph)

/* Price Highlight */
Format:           ${price.toLocaleString()}

/* Change Highlight */
Color:            text-success (gain), text-danger (loss)
Format:           "gain of 2.45%" or "loss of 3.21%"
```

---

## 🌐 Sector Information Card

### **Container**
```css
Background:       bg-brand-blue/10
Border:           border border-brand-blue/30
Border Radius:    rounded-xl (12px)
Padding:          p-4
```

### **Header**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-2

/* Icon */
Icon:             Globe
Size:             w-5 h-5
Color:            text-brand-blue

/* Heading */
Font Size:        text-base (h3 default)
Color:            foreground
Format:           "Sector: {sector name}"
```

### **Description**
```css
Font Size:        text-sm
Color:            muted-foreground
```

---

## 📈 Key Price Drivers Section

### **Section Header**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-3

/* Icon */
Icon:             BarChart3
Size:             w-5 h-5
Color:            text-brand-purple

/* Heading */
Font Size:        text-base (h3 default)
Color:            foreground
Format:           "What Drives {SYMBOL}'s Price?"
```

### **Driver List**
```css
Space:            space-y-2
```

### **Driver Item**
```css
Display:          flex gap-3
Padding:          p-3
Background:       bg-muted/20
Border Radius:    rounded-lg
Border:           border border-border/30

/* Bullet Point */
Size:             w-1.5 h-1.5
Border Radius:    rounded-full
Background:       bg-brand-purple
Margin Top:       mt-2
Flex Shrink:      flex-shrink-0

/* Text */
Font Size:        text-sm
Color:            muted-foreground
```

---

## 🔥 Recent Market Factors Section

### **Section Header**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-3

/* Icon */
Icon:             TrendingUp
Size:             w-5 h-5
Color:            text-success

/* Heading */
Font Size:        text-base (h3 default)
Color:            foreground
Text:             "Recent Market Factors"
```

### **Factor List**
```css
Space:            space-y-2
```

### **Factor Item**
```css
Display:          flex gap-3
Padding:          p-3
Background:       bg-success/10
Border Radius:    rounded-lg
Border:           border border-success/30

/* Bullet Point */
Size:             w-1.5 h-1.5
Border Radius:    rounded-full
Background:       bg-success
Margin Top:       mt-2
Flex Shrink:      flex-shrink-0

/* Text */
Font Size:        text-sm
Color:            muted-foreground
```

---

## 🌍 General Market Principles Section

### **Section Header**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-3

/* Icon */
Icon:             Globe
Size:             w-5 h-5
Color:            text-warning

/* Heading */
Font Size:        text-base (h3 default)
Color:            foreground
Text:             "General Market Principles"
```

### **Principles List**
```css
Space:            space-y-3
```

### **Principle Card**
```css
Background:       bg-muted/20
Border:           border border-border
Border Radius:    rounded-lg
Padding:          p-4

/* Card Header */
Display:          flex items-center gap-2
Margin Bottom:    mb-2

/* Icon */
Size:             w-4 h-4
Color:            text-warning

/* Title */
Font Size:        text-sm (h4 default)
Color:            foreground

/* Description */
Font Size:        text-sm
Color:            muted-foreground
```

---

## 💡 Investment Learning Tips Section

### **Container**
```css
Background:       bg-brand-purple/10
Border:           border border-brand-purple/30
Border Radius:    rounded-xl (12px)
Padding:          p-4
```

### **Section Header**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-3

/* Icon */
Icon:             Lightbulb
Size:             w-5 h-5
Color:            text-brand-purple

/* Heading */
Font Size:        text-base (h3 default)
Color:            foreground
Text:             "Investment Learning Tips"
```

### **Tips List**
```css
Space:            space-y-2
```

### **Tip Item**
```css
Display:          flex gap-3

/* Bullet Point */
Size:             w-1.5 h-1.5
Border Radius:    rounded-full
Background:       bg-brand-purple
Margin Top:       mt-2
Flex Shrink:      flex-shrink-0

/* Text */
Font Size:        text-sm
Color:            text-brand-purple
```

---

## ⚠️ Disclaimer Section

### **Container**
```css
Background:       bg-warning/10
Border:           border border-warning/30
Border Radius:    rounded-xl (12px)
Padding:          p-4
```

### **Text**
```css
Font Size:        text-xs
Color:            text-warning

/* Strong Text */
Font Weight:      bold (via <strong> tag)
Format:           "Educational Purpose Only:"
```

---

## 🎬 Footer Section

### **Container**
```css
Padding:          p-6
Border:           border-t border-border
Background:       bg-muted/10
```

### **Close Button**
```css
Width:            w-full
Padding:          py-3
Background:       gradient-primary
Text Color:       white
Border Radius:    rounded-xl (12px)
Hover:            shadow-lg
Transition:       transition-all
Text:             "Got it, thanks!"
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
Gap 2:            8px   (gap-2)
Gap 3:            12px  (gap-3)
Margin Bottom 1:  4px   (mb-1)
Margin Bottom 2:  8px   (mb-2)
Margin Bottom 3:  12px  (mb-3)
Margin Top 2:     8px   (mt-2)
Padding 2:        8px   (p-2)
Padding 3:        12px  (p-3)
Padding 4:        16px  (p-4)
Padding 6:        24px  (p-6)
Space Y 2:        8px   (space-y-2)
Space Y 3:        12px  (space-y-3)
Space Y 6:        24px  (space-y-6)
```

---

## 🎭 Interactive States

### **Close Button Hover**
```css
Text Color:       foreground
Background:       bg-muted
Transition:       transition-colors
```

### **Footer Button Hover**
```css
Shadow:           shadow-lg
Transition:       transition-all
```

---

## 📚 Content Structure

### **Educational Sections (In Order)**
1. Current Price Movement
2. Sector Information
3. Key Price Drivers
4. Recent Market Factors
5. General Market Principles
6. Investment Learning Tips
7. Disclaimer

### **Symbol-Specific Content**
The modal dynamically loads educational content for:
- **Stocks**: AAPL, GOOGL, MSFT, TSLA, NVDA, AMZN, META
- **Crypto**: BTC-USD, ETH-USD
- **Fallback**: General market education for unknown symbols

---

## 🎨 Color Coding by Section

```css
/* Current Price */
Positive:         text-success, TrendingUp icon
Negative:         text-danger, TrendingDown icon

/* Sector */
Theme:            brand-blue

/* Key Drivers */
Theme:            brand-purple with bullet points

/* Recent Factors */
Theme:            success (green) with bullet points

/* General Principles */
Theme:            warning (amber) with icons

/* Learning Tips */
Theme:            brand-purple with bullet points

/* Disclaimer */
Theme:            warning (amber)
```

---

## 📊 Data Display

### **Price Formatting**
```javascript
$185.20           // toLocaleString()
$42,350.00        // For crypto
```

### **Percentage Formatting**
```javascript
2.45%             // toFixed(2)
"gain of 2.45%"   // Positive context
"loss of 3.21%"   // Negative context
```

---

## ♿ Accessibility

- Modal traps focus within
- Backdrop click closes modal
- Clear section headers with icons
- Color-coded sections for quick scanning
- Bullet points for easy reading
- Educational language accessible to beginners
- Close button clearly visible
- Touch targets meet minimum 44×44px

---

## 📝 Notes

- Educational focus for teaching stock market concepts
- Symbol-specific insights with fallback content
- Color-coded sections for visual hierarchy
- Bullet points make content scannable
- Icons supplement each section type
- Disclaimer ensures responsible education
- Scrollable content for comprehensive info
- Max height prevents viewport overflow
- Close on backdrop click for easy dismissal
- Friendly button text ("Got it, thanks!")
- Comprehensive coverage: drivers, factors, principles, tips
- Real-time price data contextualized
- Sector-specific insights provided
- Suitable for beginners to intermediate learners
