import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moutouri - Marketplace de Motos",
  description: "Achetez, vendez et échangez des motos, scooters et pièces",
  generator: 'Moutouri'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
      <meta name="google-site-verification" content="ZF2aqD1mmPfeqT3XitJg05krx-rii2plB9f9_I63GkQ" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-adsense-account" content="ca-pub-9017132503634604"></meta>
      </head>
      <body className={inter.className}>
        <SpeedInsights />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
        
        {/* Google AdSense Script */}
        <Script
          id="pub-9017132503634604"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9017132503634604"
        />
      </body>
    </html>
  )
}