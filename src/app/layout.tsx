'use client'

import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
 
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,      
        gcTime: 5 * 60 * 1000,    
        retry: 1,                   
        refetchOnWindowFocus: false, 
      },
    },
  }))

  return (
    <html lang="fr">
      <head>
        <title>OpsTrack - Gestion de tickets</title>
        <meta name="description" content="Application de gestion de tickets d'incidents" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
