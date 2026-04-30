'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  console.log('[PostHog] Initializing with key:', process.env.NEXT_PUBLIC_POSTHOG_KEY?.slice(0, 10) + '...')
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
  })
} else {
  console.warn('[PostHog] Not initialized - missing key or not in browser')
}

function PostHogUserSync() {
  const { user, isAuthenticated } = useAuth()
  const ph = usePostHog()

  useEffect(() => {
    if (isAuthenticated && user) {
      ph.identify(user.userId, {
        email: user.email,
      })
    } else {
      ph.reset()
    }
  }, [isAuthenticated, user, ph])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <PostHogUserSync />
      {children}
    </PHProvider>
  )
}
