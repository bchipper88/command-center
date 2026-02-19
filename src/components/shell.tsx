'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const directoriesNav = [
  { href: '/directories/overview', label: 'Overview', icon: '📊' },
  { href: '/directories/content', label: 'Content', icon: '📝' },
  { href: '/directories/businesses', label: 'Businesses', icon: '🏢' },
  { href: '/directories/seo', label: 'SEO', icon: '🔍' },
  { href: '/reviews?site=directories', label: 'CEO Reviews', icon: '📋' },
]

const jurassicNav = [
  { href: '/jurassic', label: 'Overview', icon: '📊' },
  { href: '/jurassic/content', label: 'Content', icon: '📝' },
  { href: '/jurassic/seo', label: 'SEO', icon: '🔍' },
  { href: '/reviews?site=jurassic', label: 'CEO Reviews', icon: '📋' },
]

const agentsNav = [
  { href: '/agents', label: 'Overview', icon: '🤖' },
  { href: '/tasks', label: 'Tasks', icon: '📋' },
  { href: '/ops', label: 'Operations', icon: '⚙️' },
  { href: '/files', label: 'Files', icon: '📁' },
]

const metaNav = [
  { href: '/reviews?site=command-center', label: 'Product Reviews', icon: '📋' },
  { href: '/reviews', label: 'All Reviews', icon: '📊' },
]

const christmasNav = [
  { href: '/christmas', label: 'Overview', icon: '📊' },
  { href: '/christmas/pages', label: 'Page Grades', icon: '📝' },
  { href: '/reviews?site=christmas', label: 'CEO Reviews', icon: '📋' },
]

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const linkClass = (href: string) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
    isActive(href)
      ? 'bg-red-600/10 text-red-500 border border-red-500/20'
      : 'text-neutral-400 hover:text-white hover:bg-white/5'
  }`

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
          {/* Dashboard */}
          <Link href="/" className={linkClass('/')}>
            <span className="text-base">📊</span>
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Directories section */}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">Directories</span>
          </div>
          {directoriesNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Jurassic Apparel section */}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">Jurassic Apparel</span>
          </div>
          {jurassicNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Agents section */}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">Agents</span>
          </div>
          {agentsNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* The Best Christmas section */}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">The Best Christmas</span>
          </div>
          {christmasNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Meta / Product section */}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">Command Center</span>
          </div>
          {metaNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
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
