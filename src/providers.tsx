'use client'

import { SessionProvider } from 'next-auth/react'
import { OverlayProvider } from '@react-aria/overlays'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OverlayProvider>
        {children}
      </OverlayProvider>
    </SessionProvider>
  )
}
