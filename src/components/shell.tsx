'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'

const personalNav = [
  { href: '/personal', label: 'Goals', icon: '🎯' },
  { href: '/personal/tasks', label: 'My Tasks', icon: '✅' },
]

const doNav = [
  { href: '/tasks', label: 'Tasks', icon: '📋' },
  { href: '/prs', label: 'PRs to Review', icon: '🔀' },
  { href: '/ideas', label: 'Ideas', icon: '💡' },
  { href: '/opportunities', label: 'Opportunities', icon: '🎯' },
]

const monitorNav = [
  { href: '/sites', label: 'Sites', icon: '🌐' },
  { href: '/agents', label: 'Agents', icon: '🤖' },
  { href: '/comms', label: 'Agent Comms', icon: '💬' },
  { href: '/ops', label: 'Cron Jobs', icon: '⚙️' },
]

const jurassicNav = [
  { href: '/jurassic', label: 'Overview', icon: '🦖' },
  { href: '/jurassic/designs', label: 'T-Shirt Designs', icon: '👕' },
]

const exploreNav = [
  { href: '/content', label: 'Content', icon: '📝' },
  { href: '/directories/businesses', label: 'Businesses', icon: '🏢' },
  { href: '/seo', label: 'SEO', icon: '🔍' },
  { href: '/reviews', label: 'Reviews', icon: '📊' },
  { href: '/files', label: 'Files', icon: '📁' },
  { href: '/christmas', label: 'Christmas', icon: '🎄' },
]

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const linkClass = (href: string) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
    isActive(href)
      ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20'
      : 'text-neutral-400 hover:text-white hover:bg-white/5'
  }`

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const navContent = (
    <>
      <Link href="/" className="block p-4 border-b border-white/5 hover:bg-white/5 transition-colors" onClick={closeMobileMenu}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏰</span>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider">COMMAND CENTER</h1>
            <p className="text-[10px] text-neutral-600 font-mono">v2.0 • ROLE-BASED</p>
          </div>
        </div>
      </Link>
      
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {/* Dashboard */}
        <Link href="/" className={linkClass('/')} onClick={closeMobileMenu}>
          <span className="text-base">🏠</span>
          <span className="font-medium">Dashboard</span>
        </Link>

        {/* PERSONAL section */}
        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-mono text-purple-600/60 tracking-widest uppercase">Personal</span>
        </div>
        {personalNav.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={closeMobileMenu}>
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* DO section */}
        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-mono text-orange-600/60 tracking-widest uppercase">Do</span>
        </div>
        {doNav.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={closeMobileMenu}>
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* MONITOR section */}
        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-mono text-blue-600/60 tracking-widest uppercase">Monitor</span>
        </div>
        {monitorNav.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={closeMobileMenu}>
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* JURASSIC section */}
        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-mono text-emerald-600/60 tracking-widest uppercase">Jurassic</span>
        </div>
        {jurassicNav.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={closeMobileMenu}>
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* EXPLORE section */}
        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-mono text-green-600/60 tracking-widest uppercase">Explore</span>
        </div>
        {exploreNav.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={closeMobileMenu}>
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <div className="text-[10px] text-neutral-600 font-mono">
          Mission: Financial Independence
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#080808] border-b border-white/5 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏰</span>
          <h1 className="text-xs font-bold text-white tracking-wider">COMMAND CENTER</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/5 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide-over drawer */}
      <aside
        className={`
          fixed md:static
          top-0 left-0 bottom-0
          z-50 md:z-auto
          w-56 flex-shrink-0
          border-r border-white/5 bg-[#080808]
          flex flex-col
          transform md:transform-none transition-transform duration-200
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {navContent}
      </aside>

      {/* Main - Add top padding on mobile for fixed header */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a] pt-14 md:pt-0">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
