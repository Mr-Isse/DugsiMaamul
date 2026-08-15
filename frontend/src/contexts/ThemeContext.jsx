import { createContext, useContext, useEffect, useState } from 'react';
import { designTokens } from '../lib/designTokens';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('dugsi-theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState(theme);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Update CSS custom properties based on theme
    if (theme === 'dark') {
      root.style.setProperty('--background', designTokens.colors.dark.background);
      root.style.setProperty('--surface', designTokens.colors.dark.surface);
      root.style.setProperty('--surface-secondary', designTokens.colors.dark.surfaceSecondary);
      root.style.setProperty('--surface-tertiary', designTokens.colors.dark.surfaceTertiary);
      root.style.setProperty('--surface-elevated', designTokens.colors.dark.surfaceElevated);
      root.style.setProperty('--border', designTokens.colors.dark.border);
      root.style.setProperty('--border-hover', designTokens.colors.dark.borderHover);
      root.style.setProperty('--hover', designTokens.colors.dark.hover);
      root.style.setProperty('--hover-secondary', designTokens.colors.dark.hoverSecondary);
      root.style.setProperty('--text', designTokens.colors.dark.text);
      root.style.setProperty('--text-secondary', designTokens.colors.dark.textSecondary);
      root.style.setProperty('--text-tertiary', designTokens.colors.dark.textTertiary);
      root.style.setProperty('--text-muted', designTokens.colors.dark.textMuted);
      root.style.setProperty('--text-inverse', designTokens.colors.dark.textInverse);
    } else {
      root.style.setProperty('--background', designTokens.colors.neutral.white);
      root.style.setProperty('--surface', designTokens.colors.neutral[50]);
      root.style.setProperty('--surface-secondary', designTokens.colors.neutral[100]);
      root.style.setProperty('--surface-tertiary', designTokens.colors.neutral[200]);
      root.style.setProperty('--surface-elevated', designTokens.colors.neutral.white);
      root.style.setProperty('--border', designTokens.colors.neutral[200]);
      root.style.setProperty('--border-hover', designTokens.colors.neutral[300]);
      root.style.setProperty('--hover', designTokens.colors.neutral[50]);
      root.style.setProperty('--hover-secondary', designTokens.colors.neutral[100]);
      root.style.setProperty('--text', designTokens.colors.neutral[900]);
      root.style.setProperty('--text-secondary', designTokens.colors.neutral[600]);
      root.style.setProperty('--text-tertiary', designTokens.colors.neutral[500]);
      root.style.setProperty('--text-muted', designTokens.colors.neutral[400]);
      root.style.setProperty('--text-inverse', designTokens.colors.neutral.white);
    }
    
    setResolvedTheme(theme);
    localStorage.setItem('dugsi-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setSystemTheme = () => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
