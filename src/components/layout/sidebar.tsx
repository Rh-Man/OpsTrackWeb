'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/lib/api/user'
import {
  LayoutDashboard,
  Plus,
  Ticket,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  Users,
  BarChart3,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    router.push('/login')
  }

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe,
  })

  const isAdmin = currentUser?.role === 'admin'
  const isSupervisor = currentUser?.role === 'supervisor'
  const canManage = isAdmin || isSupervisor

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/tickets/new', label: 'Nouveau ticket', icon: Plus },
  ]

  const adminItems = [
    { href: '/admin/users', label: 'Utilisateurs', icon: Users, roles: ['admin'] },
    { href: '/reports', label: 'Rapports', icon: BarChart3, roles: ['admin', 'supervisor'] },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      <div className={cn('p-6', collapsed && 'px-3')}>
        <Link
          href="/dashboard"
          className={cn('flex items-center space-x-3 group', collapsed && 'justify-center')}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative gradient-primary p-2.5 rounded-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-xl text-gray-900">OpsTrack</span>
              <p className="text-xs text-gray-500">Gestion d&apos;incidents</p>
            </div>
          )}
        </Link>
      </div>

      <nav className={cn('flex-1 px-3 space-y-1 overflow-y-auto', collapsed && 'px-2')}>
        <p className={cn(
          'text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2',
          collapsed && 'text-center px-0'
        )}>
          {collapsed ? '•••' : 'Navigation'}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <div
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all',
                  active ? 'gradient-primary text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0')} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            </Link>
          )
        })}

        {canManage && (
          <>
            <p className={cn(
              'text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-4',
              collapsed && 'text-center px-0'
            )}>
              {collapsed ? '•••' : 'Administration'}
            </p>
            {adminItems
              .filter(item => item.roles.includes(currentUser?.role || ''))
              .map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all',
                        active ? 'gradient-primary text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn('h-5 w-5 flex-shrink-0')} />
                      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                  </Link>
                )
              })}
          </>
        )}
      </nav>

      <div className={cn('p-4 border-t relative', collapsed && 'px-2')} ref={profileMenuRef}>
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={cn(
            'flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group w-full',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {(user?.email?.charAt(0) || 'U').toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-sm truncate text-gray-900">
                  {user?.email?.split('@')[0] || 'utilisateur'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.role ? (
                    <span className="capitalize font-medium text-cyan-600">{currentUser.role}</span>
                  ) : user?.email || ''}
                </p>
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isProfileMenuOpen && 'rotate-180'
              )} />
            </>
          )}
        </button>

        {isProfileMenuOpen && (
          <div className={cn(
            'absolute bottom-full mb-2 bg-white rounded-lg shadow-xl border-2 border-gray-200 overflow-hidden z-50',
            collapsed ? 'left-2 right-2' : 'left-4 right-4'
          )}>
            <Link
              href="/profile"
              onClick={() => { setIsProfileMenuOpen(false); setIsMobileMenuOpen(false) }}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-900"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Mon Profil</span>
            </Link>
            <div className="border-t border-gray-200"></div>
            <button
              onClick={() => { setIsProfileMenuOpen(false); handleSignOut() }}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        )}
      </div>

      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsCollapsed(!collapsed)}
          className={cn(
            'hidden lg:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors shadow-md z-50',
            collapsed && 'rotate-180'
          )}
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}
    </>
  )

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex-col z-40 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      <div
        className={cn(
          'hidden lg:block flex-shrink-0 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      />

      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
