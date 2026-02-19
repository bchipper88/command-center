'use client'

import { Site } from '@/lib/supabase'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

const siteEmojis: Record<string, string> = {
  'jurassic': '🦖',
  'christmas': '🎄',
  'lv': '🏔️',
  'denver': '🏔️',
  'savannah': '🌴',
}

const siteColors: Record<string, string> = {
  'jurassic': 'border-green-500/30 bg-green-950/20',
  'christmas': 'border-red-500/30 bg-red-950/20',
  'lv': 'border-orange-500/30 bg-orange-950/20',
  'denver': 'border-blue-500/30 bg-blue-950/20',
  'savannah': 'border-emerald-500/30 bg-emerald-950/20',
}

function getSiteKey(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('jurassic')) return 'jurassic'
  if (lower.includes('christmas')) return 'christmas'
  if (lower.includes('lv') || lower.includes('vegas')) return 'lv'
  if (lower.includes('denver')) return 'denver'
  if (lower.includes('savannah')) return 'savannah'
  return 'lv'
}

export function SitesClient({ sites }: { sites: Site[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sites</h1>
        <p className="text-zinc-400 text-sm">All your digital properties at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((site) => {
          const key = getSiteKey(site.name)
          const emoji = siteEmojis[key] || '🌐'
          const colorClass = siteColors[key] || 'border-zinc-500/30 bg-zinc-950/20'
          
          return (
            <div
              key={site.id}
              className={`border rounded-xl p-5 ${colorClass} hover:border-opacity-50 transition-colors`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <h3 className="font-semibold text-white">{site.name}</h3>
                    {site.domain && (
                      <a 
                        href={`https://${site.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                      >
                        {site.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">{site.total_blog_posts || 0}</p>
                  <p className="text-xs text-zinc-500">Blog Posts</p>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">{site.total_businesses || 0}</p>
                  <p className="text-xs text-zinc-500">Businesses</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/content?site=${site.id}`}
                  className="flex-1 text-center text-xs bg-white/5 hover:bg-white/10 rounded-lg py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Content
                </Link>
                <Link 
                  href={`/seo?site=${site.id}`}
                  className="flex-1 text-center text-xs bg-white/5 hover:bg-white/10 rounded-lg py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  SEO
                </Link>
                {site.total_businesses > 0 && (
                  <Link 
                    href={`/businesses?site=${site.id}`}
                    className="flex-1 text-center text-xs bg-white/5 hover:bg-white/10 rounded-lg py-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    Listings
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
