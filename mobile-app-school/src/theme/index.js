import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import { SCHOOL_CONFIG } from '@/config';

import { useTenant } from '../tenant';

export const ThemeContext = createContext({
  dark: false,
  toggleTheme: () => {},
  theme: {},
  branding: {},
});

export const ThemeProvider = ({ children }) => {
  const { tenant } = useTenant();
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic branding from tenant config
  const branding = {
    primary: tenant?.primaryColor || SCHOOL_CONFIG.primaryColor || '#0A84FF',
    secondary: tenant?.secondaryColor || SCHOOL_CONFIG.secondaryColor || '#00C7BE',
    accent: tenant?.accentColor || SCHOOL_CONFIG.accentColor || '#FF9500',
    logo: tenant?.logo || null,
    schoolName: tenant?.name || SCHOOL_CONFIG.appName || 'School App',
  };

  // Dynamic theme based on school config
  const LIGHT = {
    dark: false,
    bg: tenant?.backgroundColor || SCHOOL_CONFIG.backgroundColor || '#F5F7FA',
    card: '#FFFFFF',
    text: tenant?.textColor || SCHOOL_CONFIG.textColor || '#1E293B',
    subText: '#64748B',
    border: '#E8EDF2',
    primary: branding.primary,
    appBar: branding.primary,
    tabBar: '#FFFFFF',
    tabText: '#94A3B8',
    tabActive: branding.primary,
    input: '#F1F5F9',
    secondary: branding.secondary,
    accent: branding.accent,
  };

  const DARK = {
    dark: true,
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    subText: '#94A3B8',
    border: '#334155',
    primary: branding.primary,
    appBar: '#0F172A',
    tabBar: '#1E293B',
    tabText: '#475569',
    tabActive: branding.primary,
    input: '#334155',
    secondary: branding.secondary,
    accent: branding.accent,
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync('themeMode');
        if (saved !== null) {
          setDark(saved === 'dark');
        }
      } catch (err) {
        console.error('Failed to load theme preference', err);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const theme = dark ? DARK : LIGHT;

  const toggleTheme = async () => {
    const newMode = !dark;
    setDark(newMode);
    try {
      await SecureStore.setItemAsync('themeMode', newMode ? 'dark' : 'light');
    } catch (err) {
      console.error('Failed to save theme preference', err);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: LIGHT.bg }}>
        <ActivityIndicator size="large" color={LIGHT.primary} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, theme, branding }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
