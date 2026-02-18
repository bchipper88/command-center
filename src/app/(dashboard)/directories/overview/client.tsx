'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const sites = [
  { id: 'lv', label: 'Lehigh Valley', color: 'bg-blue-500', borderColor: 'border-blue-500/30' },
  { id: 'denver', label: 'Denver', color: 'bg-purple-500', borderColor: 'border-purple-500/30' },
  { id: 'savannah', label: 'Savannah', color: 'bg-emerald-500', borderColor: 'border-emerald-500/30' },
]

type Site = { id: string; name: string; domain: string | null; total_businesses: number; total_blog_posts: number }
type Business = { id: string; site_id: string; name: string; category: string }
type BlogPost = { id: string; site_id: string; title: string; status: string }
type Keyword = { id: string; site_id: string; keyword: string; volume: number | null; gsc_clicks: number | null }
type Activity = { id: string; site_id: string | null; event_type: string; title: string; created_at: string }

type Props = {
  sites: Site[]
  businesses: Business[]
  blogPosts: BlogPost[]
  keywords: Keyword[]
  activity: Activity[]
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function DirectoriesOverviewClient({ sites: siteData, businesses, blogPosts, keywords, activity }: Props) {
  const [activeSite, setActiveSite] = useState('lv')

  const site = siteData.find(s => s.id === activeSite)
  const siteBusinesses = businesses.filter(b => b.site_id === activeSite)
  const siteBlogPosts = blogPosts.filter(b => b.site_id === activeSite)
  const siteKeywords = keywords.filter(k => k.site_id === activeSite)
  const siteActivity = activity.filter(a => a.site_id === activeSite)

  const totalVolume = siteKeywords.reduce((sum, k) => sum + (k.volume || 0), 0)
  const totalClicks = siteKeywords.reduce((sum, k) => sum + (k.gsc_clicks || 0), 0)
  const categories = [...new Set(siteBusinesses.map(b => b.category))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Directories Overview</h1>
        <p className="text-sm text-neutral-500 font-mono">All directory sites at a glance</p>
      </div>

      {/* Site tabs */}
      <div className="flex gap-2">
        {sites.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSite(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSite === s.id
                ? `bg-white/10 text-white border ${s.borderColor}`
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${s.color} mr-2`}></span>
            {s.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'BUSINESSES', value: siteBusinesses.length, color: 'text-blue-400' },
          { label: 'BLOG POSTS', value: siteBlogPosts.length, color: 'text-purple-400' },
          { label: 'KEYWORDS', value: siteKeywords.length, color: 'text-amber-400' },
          { label: 'TOTAL VOLUME', value: totalVolume.toLocaleString(), color: 'text-emerald-400' },
        ].map(kpi => (
          <Card key={kpi.label} className="glass-card bg-transparent border-white/5">
            <CardContent className="pt-4 pb-3 px-4">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">{kpi.label}</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${kpi.color}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Categories breakdown */}
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4">
            <h3 className="text-sm font-mono text-neutral-400 mb-3">CATEGORIES ({categories.length})</h3>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 15).map(cat => {
                const count = siteBusinesses.filter(b => b.category === cat).length
                return (
                  <Badge key={cat} variant="outline" className="text-xs border-white/10">
                    {cat} <span className="text-neutral-500 ml-1">({count})</span>
                  </Badge>
                )
              })}
              {categories.length > 15 && (
                <Badge variant="outline" className="text-xs border-white/10 text-neutral-500">
                  +{categories.length - 15} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4">
            <h3 className="text-sm font-mono text-neutral-400 mb-3">RECENT ACTIVITY</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {siteActivity.length === 0 ? (
                <p className="text-neutral-600 text-sm">No recent activity</p>
              ) : (
                siteActivity.slice(0, 10).map(a => (
                  <div key={a.id} className="flex justify-between items-center text-sm">
                    <span className="text-neutral-300 truncate">{a.title}</span>
                    <span className="text-neutral-600 text-xs font-mono">{timeAgo(a.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site info */}
      {site && (
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{site.name}</h3>
                <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" 
                   className="text-sm text-neutral-500 hover:text-white transition-colors">
                  {site.domain} ↗
                </a>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-500">GSC Clicks</div>
                <div className="text-xl font-bold text-emerald-400">{totalClicks.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
