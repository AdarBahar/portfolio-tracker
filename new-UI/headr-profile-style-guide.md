Dark Mode (Default)
```css
Background: linear-gradient(135deg, hsl(222, 43%, 15%) 0%, hsl(222, 43%, 17%) 100%)
```
Start: `hsl(222, 43%, 15%)` = `#152035` (dark navy)
End: `hsl(222, 43%, 17%)` = `#182439` (slightly lighter navy)

Light Mode
```css
Background: linear-gradient(135deg, hsl(0, 0%, 100%) 0%, hsl(210, 20%, 99%) 100%)
```
Start: `hsl(0, 0%, 100%)` = `#FFFFFF` (pure white)
End: `hsl(210, 20%, 99%)` = `#FBFCFD` (very light gray-blue)

---

🔲 Border Color & Width

Dark Mode (Default)
```css
Border Color: hsl(222, 43%, 25%) = #243049 (medium dark navy)
Border Width: 1px
Border Class: border border-border
```

Light Mode
```css
Border Color: hsl(210, 20%, 85%) = #D1D9E2 (light blue-gray)
Border Width: 1px
Border Class: border border-border
```

---

📦 Complete Profile Header Styling

```css
/* Container */
className="gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 border border-border shadow-lg"

/* Breakdown */
Background: gradient-card (see above)
Backdrop: backdrop-blur-sm
Border Radius: rounded-2xl (16px)
Padding: 16px (mobile), 24px (desktop)
Margin Bottom: 32px
Border: 1px solid border color
Shadow: shadow-lg
```

---

🎯 Summary Table

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background Start | `hsl(222, 43%, 15%)` #152035 | `hsl(0, 0%, 100%)` #FFFFFF |
| Background End | `hsl(222, 43%, 17%)` #182439 | `hsl(210, 20%, 99%)` #FBFCFD |
| Border Color | `hsl(222, 43%, 25%)` #243049 | `hsl(210, 20%, 85%)` #D1D9E2 |
| Border Width | 1px | 1px |
| Border Style | solid | solid |
