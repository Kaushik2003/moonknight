import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { ChatProvider } from '@/contexts/ChatContext'
import { GitHubProvider } from '@/contexts/GitHubContext'
import { BuilderPassProvider } from '@/contexts/BuilderPassContext'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });



export const metadata: Metadata = {
  title: 'MoonKnight',
  description: 'Build Web3 dapps with dual-mode IDE for smart contracts and frontend',
  generator: 'MoonKnight',
  icons: {
    icon: '/dhak.png',
    shortcut: '/dhak.png',
    apple: '/dhak.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f0f0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-zinc-950 text-zinc-100`}>
        <ClerkProvider>
          <GitHubProvider>
            <ChatProvider>
              <BuilderPassProvider>
                {children}
              </BuilderPassProvider>
            </ChatProvider>
          </GitHubProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  )
}
