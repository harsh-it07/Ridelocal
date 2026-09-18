import { createContext, useContext, useEffect } from "react";

// Simplified: single warm-dark theme, no toggle needed.
// The liquid glass aesthetic uses one consistent warm gradient canvas.
// We keep the provider structure for API compatibility with other pages.

type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply dark class for any Tailwind dark: utilities still in use
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
