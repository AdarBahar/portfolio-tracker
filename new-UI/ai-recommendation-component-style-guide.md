# 🎨 AI Recommendations Component - UI Style Guide

## 📋 Overview
The AI Recommendations component provides intelligent buy/sell/hold suggestions with confidence scores, market insights, and actionable recommendations powered by real-time analysis.

---

## 🎨 Color System

### **Brand Colors**
```css
Primary Blue:     hsl(199, 89%, 48%)  /* #0BA5EC */
Primary Purple:   hsl(262, 83%, 58%)  /* #7C3AED */
```

### **Semantic Colors**
```css
Success:          hsl(142, 76%, 36%)  /* #16A34A - Buy recommendations */
Warning:          hsl(43, 96%, 56%)   /* #F59E0B - Volatility */
Danger:           hsl(0, 84%, 60%)    /* #EF4444 - Sell recommendations */
```

### **Background Colors**
```css
Background:       hsl(222, 47%, 11%)  /* #0D1829 */
Card:             hsl(222, 43%, 15%)  /* #152035 */
Muted:            hsl(222, 43%, 20%)  /* #1C2842 */
Muted/30:         rgba(28, 40, 66, 0.3)

/* Recommendation Backgrounds */
Success/10:       rgba(22, 163, 74, 0.1)   /* Buy */
Danger/10:        rgba(239, 68, 68, 0.1)   /* Sell */
Brand-blue/10:    rgba(11, 165, 236, 0.1)  /* Hold */
```

### **Text Colors**
```css
Foreground:       hsl(210, 20%, 98%)  /* #F8FAFC */
Muted Foreground: hsl(210, 20%, 65%)  /* #93A3B8 */
```

### **Border Colors**
```css
Border:           hsl(222, 43%, 25%)  /* #243049 */
Border/50:        rgba(36, 48, 73, 0.5)

/* Recommendation Borders */
Success/30:       rgba(22, 163, 74, 0.3)   /* Buy */
Danger/30:        rgba(239, 68, 68, 0.3)   /* Sell */
Brand-blue/30:    rgba(11, 165, 236, 0.3)  /* Hold */
```

---

## 📐 Typography

### **Font Sizes**
```css
text-xl:          20px  /* 1.25rem - Heading */
text-base:        16px  /* 1rem - Asset symbol */
text-sm:          14px  /* 0.875rem - Asset name, stats, button */
text-xs:          12px  /* 0.75rem - Labels, badges, timestamp */
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
Background:       bg-brand-purple/20
Border Radius:    rounded-lg
Icon:             Sparkles, w-5 h-5, text-brand-purple
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
Text:             "Powered by real-time market analysis"
```

---

## 📊 Market Insights Grid

### **Container**
```css
Display:          grid grid-cols-3
Gap:              gap-3
Margin Bottom:    mb-6
```

### **Insight Card**
```css
Background:       bg-muted/30
Border Radius:    rounded-lg
Padding:          p-3
Border:           border border-border/50
```

### **Card Content**
```css
/* Icon & Label Row */
Display:          flex items-center gap-2
Margin Bottom:    mb-1

/* Icon */
Size:             w-4 h-4
Color:            Varies by insight type

/* Label */
Font Size:        text-xs
Color:            muted-foreground

/* Value */
Font Size:        text-sm
Color:            Varies by insight type
```

### **Insight Icon Colors**
```css
Market Sentiment: text-success (Bullish)
Volatility:       text-warning (Moderate)
Trade Ideas:      text-brand-purple (Active count)
```

---

## 💡 Recommendation Cards

### **Container**
```css
Space:            space-y-3
```

### **Recommendation Card**
```css
Border Radius:    rounded-xl (12px)
Padding:          p-4
Border:           border
Hover:            shadow-md
Transition:       transition-all

/* Background & Border by Type */
Buy:              bg-success/10, border-success/30
Sell:             bg-danger/10, border-danger/30
Hold:             bg-brand-blue/10, border-brand-blue/30
```

---

## 📋 Card Header

### **Layout**
```css
Display:          flex items-start justify-between
Margin Bottom:    mb-3
```

### **Left Section**
```css
Flex:             flex-1
```

### **Action Badge & Asset Info**
```css
Display:          flex items-center gap-2
Margin Bottom:    mb-1

/* Action Badge */
Text Transform:   uppercase
Font Size:        text-xs
Padding:          px-2 py-0.5
Border Radius:    rounded

/* Color by Action */
Buy:              text-success, bg-success/20
Sell:             text-danger, bg-danger/20
Hold:             text-brand-blue, bg-brand-blue/20

/* Symbol */
Font Size:        text-base
Color:            foreground

/* Name */
Font Size:        text-sm
Color:            muted-foreground
Prefix:           "• " (bullet separator)
```

---

## 📝 Recommendation Details

### **Reason Text**
```css
Font Size:        text-sm
Color:            muted-foreground
Margin Bottom:    mb-2
```

### **Stats Row**
```css
Display:          flex items-center gap-4
Font Size:        text-sm

/* Label */
Color:            muted-foreground

/* Value */
Color:            foreground

/* Gain/Loss */
Color:            text-success (positive), text-danger (negative)
Format:           "+5.3%" or "-3.7%"
```

---

## 📊 Confidence & Timestamp Section

### **Container**
```css
Text Align:       text-right
```

### **Confidence Score**
```css
Display:          flex items-center gap-1
Margin Bottom:    mb-2

/* Icon */
Icon:             CheckCircle
Size:             w-4 h-4
Color:            text-brand-blue

/* Score */
Font Size:        text-sm
Color:            text-brand-blue
Format:           "{confidence}%"
```

### **Timestamp**
```css
Display:          flex items-center gap-1
Font Size:        text-xs
Color:            muted-foreground

/* Clock Icon */
Icon:             Clock
Size:             w-3 h-3
```

---

## 🎬 Action Button

### **Styling**
```css
Width:            w-full
Padding:          py-2
Border Radius:    rounded-lg
Text Color:       white
Font Size:        text-sm
Transition:       transition-all
Hover:            shadow-lg

/* Background by Action Type */
Buy:              gradient-success
Sell:             bg-danger
Hold:             bg-brand-blue

/* Button Text by Type */
Buy:              "Execute Buy Order"
Sell:             "Execute Sell Order"
Hold:             "Monitor Position"
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
Margin Bottom 6:  24px  (mb-6)
Padding 2:        8px   (p-2)
Padding 3:        12px  (p-3)
Padding 4:        16px  (p-4)
Padding 6:        24px  (p-6)
Space Y 3:        12px  (space-y-3)
```

---

## 🎭 Interactive States

### **Recommendation Card Hover**
```css
Shadow:           shadow-md
Transition:       transition-all
```

### **Action Button Hover**
```css
Shadow:           shadow-lg
Transition:       transition-all
```

---

## 📊 Data Display

### **Price Formatting**
```javascript
$498.60           // Fixed 2 decimals
$525              // Whole numbers when appropriate
```

### **Percentage Formatting**
```javascript
+5.3%             // Always show sign
-3.7%             // Negative with minus
```

### **Confidence Score**
```javascript
85%               // Percentage value
```

### **Timestamps**
```javascript
"2 minutes ago"
"15 minutes ago"
"1 hour ago"
```

---

## 🎨 Recommendation Type Styles

### **Buy Recommendation**
```css
Background:       bg-success/10
Border:           border-success/30
Badge:            text-success, bg-success/20
Button:           gradient-success
Gain Color:       text-success
```

### **Sell Recommendation**
```css
Background:       bg-danger/10
Border:           border-danger/30
Badge:            text-danger, bg-danger/20
Button:           bg-danger
Loss Color:       text-danger
```

### **Hold Recommendation**
```css
Background:       bg-brand-blue/10
Border:           border-brand-blue/30
Badge:            text-brand-blue, bg-brand-blue/20
Button:           bg-brand-blue
Gain Color:       text-success (if positive)
```

---

## 📊 Market Insights Values

### **Market Sentiment**
```css
Value:            "Bullish", "Bearish", "Neutral"
Icon:             TrendingUp
Color:            text-success
```

### **Volatility Index**
```css
Value:            "Low", "Moderate", "High"
Icon:             AlertCircle
Color:            text-warning
```

### **Trade Ideas**
```css
Value:            "3 Active" (count format)
Icon:             Sparkles
Color:            text-brand-purple
```

---

## ♿ Accessibility

- Clear action badges with color and text
- Confidence scores numerically displayed
- Icons supplement text information
- Interactive buttons have hover states
- Color coded by recommendation type
- Time-sensitive information displayed
- Touch targets meet minimum 44×44px

---

## 📝 Notes

- AI-powered real-time recommendations
- Confidence scores provide transparency
- Actionable buttons for each recommendation
- Market insights provide context
- Color-coded by action type (buy/sell/hold)
- Timestamp shows recency of recommendation
- Target price vs current price comparison
- Potential gain/loss percentage calculated
- Hover effects on cards and buttons
- Gradient success button for buy actions
- Solid colors for sell/hold actions
- Compact grid layout for insights
- Cards expand on interaction
