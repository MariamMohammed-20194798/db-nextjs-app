'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  // Empty interface since we're only using system theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Apply system theme on component mount
  useEffect(() => {
    // Set up system theme detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Function to apply theme based on system preference
    const applySystemTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply theme initially
    applySystemTheme(mediaQuery.matches);

    // Set up listener for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      applySystemTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return <ThemeContext.Provider value={{}}>{children}</ThemeContext.Provider>;
}

// Keep useTheme hook for compatibility with existing code
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  // Return empty object since we're not using theme selection anymore
  return {};
}
