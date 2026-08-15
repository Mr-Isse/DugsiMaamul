import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { STORAGE_KEYS } from '@/config/app.config'

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={STORAGE_KEYS.theme}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
