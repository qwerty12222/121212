"use client"

import { TonConnectUIProvider } from "@tonconnect/ui-react"
import type React from "react"

/**
 * Wrapper to host TonConnectUIProvider on the client side.
 * Server Components may safely render <TonProvider> now.
 */
export default function TonProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // NOTE: hard-coded URL (could come from env if needed on server side)
  const manifestUrl = "https://giftboss.vercel.app/tonconnect-manifest.json"

  return <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>
}
