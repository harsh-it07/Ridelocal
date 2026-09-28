/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        crimson: {
          950: "#360208",
          900: "#4E050E",
          850: "#5D0812",
          800: "#680A16", // Primary background
          750: "#740D1A",
          700: "#821220",
          600: "#9C1A2B",
        },
        blush: {
          50: "#FFFFFF",
          100: "#FDF1EF",
          200: "#F9D3CD", // Primary text / highlight
          300: "#F1B7AE",
          400: "#DFA8A0", // Secondary text / muted
          500: "#C9887F",
        },
      },
      fontFamily: {
        headline: ["'Bebas Neue'", "'Barlow Condensed'", "system-ui", "sans-serif"],
        display: ["'Barlow Condensed'", "'DM Sans'", "system-ui", "sans-serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
