/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      // Brand colors
      primary: "hsl(199 89% 48%)",
      "brand-blue": "hsl(199 89% 48%)",
      "brand-purple": "hsl(262 83% 58%)",

      // Surface colors
      background: "hsl(222 47% 11%)",
      card: "hsl(222 43% 15%)",
      popover: "hsl(222 43% 15%)",

      // Functional colors
      success: "hsl(142 76% 36%)",
      warning: "hsl(43 96% 56%)",
      danger: "hsl(0 84% 60%)",
      destructive: "hsl(0 84% 60%)",

      // Text colors
      foreground: "hsl(210 20% 98%)",
      "muted-foreground": "hsl(215 16% 65%)",

      // Neutral palette
      secondary: "hsl(222 40% 20%)",
      muted: "hsl(222 40% 20%)",
      border: "hsl(222 40% 25%)",
      input: "hsl(222 40% 25%)",

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

