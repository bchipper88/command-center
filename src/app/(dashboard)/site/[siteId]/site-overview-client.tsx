'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const siteNames: Record<string, string> = {
  lv: 'Lehigh Valley',
  denver: 'Denver',
  savannah: 'Savannah',
  jurassic: 'Jurassic Apparel',
}

const siteDomains: Record<string, string> = {
  lv: 'lehighvalleybest.com',
  denver: 'bestofdenver.org',
  savannah: 'bestsavannahga.com',
  jurassic: 'jurassicapparel.shop',
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const eventIcons: Record<string, string> = {
  blog_written: '📝',
  business_added: '🏢',
  pr_created: '🔀',
  cron_ran: '⚙️',
  keyword_discovered: '🔍',
  rank_change: '📈',
}

type Props = {
  siteId: string
  site: Record<string, unknown> | null
  businesses: Array<{ category: string; subcategory?: string | null }>
  blogPosts: Array<{ status: string }>
  keywords: Array<{ gsc_clicks?: number | null; gsc_position?: number | null }>
  activity: Array<{ id: string; event_type: string; title: string; description?: string | null; created_at: string }>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SiteOverviewClient({ siteId, site, businesses, blogPosts, keywords, activity }: Props) {
  const isDirectory = siteId !== 'jurassic'

  // Category breakdown
  const categoryCounts: Record<string, number> = {}
  businesses.forEach(b => {
    const key = b.subcategory ? `${b.category}/${b.subcategory}` : b.category
    categoryCounts[key] = (categoryCounts[key] || 0) + 1
  })
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])

  // Blog status breakdown
  const blogByStatus: Record<string, number> = {}
  blogPosts.forEach(p => {
    blogByStatus[p.status] = (blogByStatus[p.status] || 0) + 1
  })

  const totalClicks = keywords.reduce((sum, k) => sum + (k.gsc_clicks || 0), 0)
  const avgPosition = keywords.filter(k => k.gsc_position).length > 0
    ? (keywords.reduce((sum, k) => sum + (k.gsc_position || 0), 0) / keywords.filter(k => k.gsc_position).length).toFixed(1)
    : '—'

  const kpis = isDirectory
    ? [
        { label: 'BUSINESSES', value: businesses.length, icon: '🏢', color: 'text-blue-400' },
        { label: 'BLOG POSTS', value: blogPosts.length, icon: '📝', color: 'text-purple-400' },
        { label: 'KEYWORDS', value: keywords.length, icon: '🔍', color: 'text-amber-400' },
        { label: 'ORGANIC CLICKS', value: totalClicks, icon: '📈', color: 'text-emerald-400' },
      ]
    : [
        { label: 'BLOG POSTS', value: blogPosts.length, icon: '📝', color: 'text-purple-400' },
        { label: 'KEYWORDS', value: keywords.length, icon: '🔍', color: 'text-amber-400' },
        { label: 'ORGANIC CLICKS', value: totalClicks, icon: '📈', color: 'text-emerald-400' },
        { label: 'AVG POSITION', value: avgPosition, icon: '🎯', color: 'text-red-400' },
      ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{siteNames[siteId]}</h1>
          <a href={`https://${siteDomains[siteId]}`} target="_blank" rel="noopener noreferrer"
            className="text-sm text-neutral-500 font-mono hover:text-red-400 transition-colors">
            {siteDomains[siteId]} ↗
          </a>
        </div>
        <div className="flex gap-2">
          {isDirectory && (
            <Link href={`/site/${siteId}/businesses`}
              className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20 transition-colors">
              View All Businesses →
            </Link>
          )}
          <Link href={`/site/${siteId}/content`}
            className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20 transition-colors">
            View Content →
          </Link>
          <Link href={`/site/${siteId}/seo`}
            className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20 transition-colors">
            View SEO →
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-card bg-transparent border-white/5">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neutral-500 tracking-wider">{kpi.label}</span>
                <span className="text-lg">{kpi.icon}</span>
              </div>
              <div className={`text-3xl font-bold font-mono ${kpi.color}`}>
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown (directories only) */}
        {isDirectory && sortedCategories.length > 0 && (
          <Card className="glass-card bg-transparent border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">CATEGORY BREAKDOWN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {sortedCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-300 flex-1 truncate">{cat}</span>
                  <div className="w-32 bg-white/5 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${count >= 10 ? 'bg-emerald-500' : count >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(count / 10 * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono font-bold w-6 text-right ${count >= 10 ? 'text-emerald-400' : count >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                    {count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Blog Status */}
        <Card className="glass-card bg-transparent border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">BLOG STATUS</CardTitle>
          </CardHeader>
          <CardContent>
            {blogPosts.length === 0 ? (
              <p className="text-neutral-600 text-sm font-mono">No blog posts yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(blogByStatus).map(([status, count]) => {
                  const colors: Record<string, string> = {
                    planned: 'border-neutral-500/30 text-neutral-400',
                    writing: 'border-amber-500/30 text-amber-400',
                    pr_open: 'border-blue-500/30 text-blue-400',
                    published: 'border-emerald-500/30 text-emerald-400',
                  }
                  return (
                    <div key={status} className={`border rounded-lg p-3 ${colors[status] || 'border-white/10 text-white'}`}>
                      <div className="text-2xl font-bold font-mono">{count}</div>
                      <div className="text-xs font-mono uppercase tracking-wider opacity-60">{status.replace('_', ' ')}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="glass-card bg-transparent border-white/5 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">RECENT ACTIVITY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-neutral-600 text-sm font-mono">No activity recorded yet.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="text-base mt-0.5">{eventIcons[item.event_type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-neutral-500 truncate">{item.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600 whitespace-nowrap">{timeAgo(item.created_at)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
