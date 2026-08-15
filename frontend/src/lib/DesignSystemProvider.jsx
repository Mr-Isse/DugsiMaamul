import React, { useContext, useState, useEffect } from 'react';
import { designTokens } from './designTokens';

const DesignSystemContext = React.createContext(null);

export const DesignSystemProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
      return;
    }
    
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };
  
  // Get CSS custom properties for current theme
  const getCSSVariables = () => {
    const neutral = designTokens.colors.neutral;

    if (isDarkMode) {
      const dark = designTokens.colors.dark;
      return {
        '--color-primary':            designTokens.colors.primary.DEFAULT,
        '--color-secondary':          designTokens.colors.secondary.DEFAULT,
        '--color-success':            designTokens.colors.success.DEFAULT,
        '--color-warning':            designTokens.colors.warning.DEFAULT,
        '--color-danger':             designTokens.colors.danger.DEFAULT,
        '--color-info':               designTokens.colors.info.DEFAULT,
        '--color-surface':            dark.surface,
        '--color-surface-secondary':  dark.surfaceSecondary,
        '--color-surface-tertiary':   dark.surfaceTertiary,
        '--color-border':             dark.border,
        '--color-hover':              dark.hover,
        '--color-text':               dark.text,
        '--color-text-secondary':     dark.textSecondary,
        '--color-text-tertiary':      dark.textTertiary,
        '--color-bg':                 dark.background,
      };
    }

    return {
      '--color-primary':            designTokens.colors.primary.DEFAULT,
      '--color-secondary':          designTokens.colors.secondary.DEFAULT,
      '--color-success':            designTokens.colors.success.DEFAULT,
      '--color-warning':            designTokens.colors.warning.DEFAULT,
      '--color-danger':             designTokens.colors.danger.DEFAULT,
      '--color-info':               designTokens.colors.info.DEFAULT,
      '--color-surface':            neutral.white,
      '--color-surface-secondary':  neutral[50],
      '--color-surface-tertiary':   neutral[100],
      '--color-border':             neutral[200],
      '--color-hover':              neutral[50],
      '--color-text':               neutral[900],
      '--color-text-secondary':     neutral[600],
      '--color-text-tertiary':      neutral[400],
      '--color-bg':                 neutral.white,
    };
  };
  
  const value = {
    isDarkMode,
    toggleDarkMode,
    tokens: designTokens,
    cssVariables: getCSSVariables(),
  };
  
  return (
    <DesignSystemContext.Provider value={value}>
      <div style={value.cssVariables} className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </DesignSystemContext.Provider>
  );
};

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};

export { designTokens };