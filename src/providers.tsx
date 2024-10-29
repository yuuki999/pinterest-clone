'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { type ThemeProviderProps } from "next-themes/dist/types"

interface ProvidersProps extends ThemeProviderProps {
  children: React.ReactNode;
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      {...props}
    >
      <SessionProvider>
        {children}
      </SessionProvider>
    </NextThemesProvider>
  )
}
