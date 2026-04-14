'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut, User, Ticket, LayoutDashboard, Plus, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const handleSignOut = async () => {
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/tickets/new', label: 'Nouveau ticket', icon: Plus },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative gradient-primary p-2 rounded-lg">
                <Ticket className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="font-bold text-2xl bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                OpsTrack
              </span>
              <p className="text-xs text-muted-foreground">Gestion d'incidents</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'gap-2',
                      isActive && 'gradient-primary text-white shadow-lg'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <div className="hidden sm:flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-50 to-sky-50 border border-cyan-100">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.email || 'demo@opstrack.com'}</p>
              </div>
            </div>

            <Link href="/profile">
              <Button variant="outline" size="icon" className="sm:hidden">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSignOut}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
