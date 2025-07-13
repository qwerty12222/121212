import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import TonProvider from "@/components/ton-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gifts Boss - Telegram Game",
  description: "Open amazing gift cases and win real rewards in this exciting Telegram game!",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#000000",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

const manifestUrl = "https://giftboss.vercel.app/tonconnect-manifest.json"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        {/* Client-side provider wrapped safely */}
        <TonProvider>{children}</TonProvider>
      </body>
    </html>
  )
}
