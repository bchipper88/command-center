'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const nav = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/ops', label: 'Operations', icon: '⚙️' },
  { href: '/files', label: 'Files', icon: '📁' },
]

const sites = [
  { id: 'lv', label: 'Lehigh Valley', short: 'LV', color: 'bg-blue-500', icon: '🏔️' },
  { id: 'denver', label: 'Denver', short: 'DEN', color: 'bg-purple-500', icon: '🏔️' },
  { id: 'savannah', label: 'Savannah', short: 'SAV', color: 'bg-emerald-500', icon: '🌳' },
  { id: 'jurassic', label: 'Jurassic Apparel', short: 'JA', color: 'bg-red-500', icon: '🦕' },
]

const siteSubnav = [
  { href: '', label: 'Overview', icon: '📊' },
  { href: '/content', label: 'Content', icon: '📝' },
  { href: '/businesses', label: 'Businesses', icon: '🏢' },
  { href: '/seo', label: 'SEO', icon: '🔍' },
]

// JA doesn't have businesses
const jaSiteSubnav = [
  { href: '', label: 'Overview', icon: '📊' },
  { href: '/content', label: 'Content', icon: '📝' },
  { href: '/seo', label: 'SEO', icon: '🔍' },
]

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Detect if we're on a site page
  const siteMatch = pathname.match(/^\/site\/(lv|denver|savannah|jurassic)/)
  const activeSiteId = siteMatch ? siteMatch[1] : null
  // const activeSite = sites.find(s => s.id === activeSiteId)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/5 bg-[#080808] flex flex-col">
        <Link href="/" className="block p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏰</span>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider">COMMAND CENTER</h1>
              <p className="text-[10px] text-neutral-600 font-mono">v1.0 • OPERATIONAL</p>
            </div>
          </div>
        </Link>
        
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {/* Global nav */}
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active && !activeSiteId
                    ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Sites section */}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">Sites</span>
          </div>
          {sites.map((site) => {
            const isActive = activeSiteId === site.id
            return (
              <div key={site.id}>
                <Link
                  href={`/site/${site.id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{site.icon}</span>
                  <span className="font-medium">{site.label}</span>
                </Link>
                {/* Subnav when active */}
                {isActive && (
                  <div className="ml-6 pl-3 border-l border-white/10 space-y-0.5 py-1">
                    {(site.id === 'jurassic' ? jaSiteSubnav : siteSubnav).map((sub) => {
                      const subPath = `/site/${site.id}${sub.href}`
                      const subActive = pathname === subPath
                      return (
                        <Link
                          key={sub.href}
                          href={subPath}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                            subActive
                              ? 'text-white bg-white/10'
                              : 'text-neutral-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xs">{sub.icon}</span>
                          <span>{sub.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
