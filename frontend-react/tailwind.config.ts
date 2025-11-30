/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-color-scheme="dark"]'],
  theme: {
    colors: {
      // Brand colors
      primary: "hsl(199 89% 48%)",
      "brand-blue": "hsl(199 89% 48%)",
      "brand-purple": "hsl(262 83% 58%)",

      // Surface colors - Light mode default, dark mode via CSS variables
      background: "var(--color-background)",
      card: "var(--color-card)",
      popover: "var(--color-popover)",

      // Functional colors
      success: "hsl(142 76% 36%)",
      warning: "hsl(43 96% 56%)",
      danger: "hsl(0 84% 60%)",
      destructive: "hsl(0 84% 60%)",

      // Text colors - Light mode default, dark mode via CSS variables
      foreground: "var(--color-foreground)",
      "muted-foreground": "var(--color-muted-foreground)",

      // Neutral palette - Light mode default, dark mode via CSS variables
      secondary: "var(--color-secondary)",
      muted: "var(--color-muted)",
      border: "var(--color-border)",
      input: "var(--color-input)",

      // Chart colors
      "chart-1": "hsl(199 89% 48%)",
      "chart-2": "hsl(142 76% 36%)",
      "chart-3": "hsl(43 74% 66%)",
      "chart-4": "hsl(27 87% 67%)",
      "chart-5": "hsl(197 37% 24%)",

      // Standard colors
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
    },
    borderRadius: {
      lg: "1rem",
      md: "0.875rem",
      sm: "0.75rem",
      xl: "0.75rem",
    },
    boxShadow: {
      soft: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      card: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
    },
  },
  plugins: [],
}

