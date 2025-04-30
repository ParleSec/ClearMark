import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode } from '../types/config';
import { THEMES } from '../utils/constants';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

/**
 * Provider component for theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'system'
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Check if theme is stored in localStorage
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('markflow-theme') as ThemeMode | null;
      return storedTheme || defaultTheme;
    }
    return defaultTheme;
  });
  
  // Derived state: is dark mode active
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Handle system theme changes
  useEffect(() => {
    if (theme === 'system') {
      // Check system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };
      
      // Initial check
      setIsDarkMode(mediaQuery.matches);
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // Direct theme setting
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);
  
  // Apply theme to document
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove(
      'theme-light', 
      'theme-dark', 
      'theme-sepia'
    );
    
    // Add appropriate class
    if (theme === 'system') {
      document.documentElement.classList.add(
        isDarkMode ? 'theme-dark' : 'theme-light'
      );
    } else {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    // Add dark mode class for Tailwind
    if (isDarkMode || theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isDarkMode]);
  
  // Set theme and save to localStorage
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('markflow-theme', newTheme);
    }
  };
  
  const value = {
    theme,
    setTheme,
    isDarkMode,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Available theme options for the UI
 */
export const themeOptions = [
  { value: THEMES.LIGHT, label: 'Light' },
  { value: THEMES.DARK, label: 'Dark' },
  { value: THEMES.SEPIA, label: 'Sepia' },
  { value: THEMES.SYSTEM, label: 'System' },
];