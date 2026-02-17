'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const nav = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/content', label: 'Content', icon: '📝' },
  { href: '/directories', label: 'Directories', icon: '🏢' },
  { href: '/seo', label: 'SEO', icon: '🔍' },
  { href: '/ops', label: 'Operations', icon: '⚙️' },
  { href: '/files', label: 'Files', icon: '📁' },
]

const sites = [
  { id: 'lv', label: 'LV', color: 'bg-blue-500' },
  { id: 'denver', label: 'DEN', color: 'bg-purple-500' },
  { id: 'savannah', label: 'SAV', color: 'bg-emerald-500' },
  { id: 'jurassic', label: 'JA', color: 'bg-red-500' },
]

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/5 bg-[#080808] flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏰</span>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider">COMMAND CENTER</h1>
              <p className="text-[10px] text-neutral-600 font-mono">v1.0 • OPERATIONAL</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex gap-1.5">
            {sites.map((site) => (
              <div
                key={site.id}
                className={`flex-1 text-center py-1 rounded text-[10px] font-mono font-bold text-white/80 ${site.color}/20 border border-white/5`}
                title={site.label}
              >
                {site.label}
              </div>
            ))}
          </div>
        </div>
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
