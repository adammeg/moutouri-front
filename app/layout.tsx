import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/toast"
import SchemaMarkup from "@/components/schema-markup"

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
      <link rel="icon" href="/logo-moutouri.ico" />
  
  <link rel="icon" type="image/png" sizes="32x32" href="/logo-moutouri.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/logo-moutouri.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/logo-moutouri.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
  <meta name="msapplication-TileColor" content="#2d89ef" />
  <meta name="theme-color" content="#ffffff" />

        
        <meta name="google-site-verification" content="ZF2aqD1mmPfeqT3XitJg05krx-rii2plB9f9_I63GkQ" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-adsense-account" content="ca-pub-9017132503634604"></meta>

        {/* Open Graph Protocol - for social sharing and search engines */}
        <meta property="og:title" content="Moutouri - Marketplace de Motos" />
        <meta property="og:description" content="Achetez, vendez et échangez des motos, scooters et pièces en Tunisie" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.moutouri.tn" />
        <meta property="og:image" content="https://www.moutouri.tn/logo-moutouri.ico" />
        <meta property="og:site_name" content="Moutouri" />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Moutouri - Marketplace de Motos" />
        <meta name="twitter:description" content="Achetez, vendez et échangez des motos, scooters et pièces en Tunisie" />
        <meta name="twitter:image" content="https://www.moutouri.tn/logo-moutouri.ico" />
      </head>
      <body className={inter.className}>
        <SpeedInsights/> 
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>

        {/* Google AdSense Script */}
        <Script
          id="pub-9017132503634604"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9017132503634604"
        />
        <SchemaMarkup />
      </body>
    </html>
  )
}