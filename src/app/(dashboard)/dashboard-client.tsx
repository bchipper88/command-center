'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Props = {
  data: {
    kpis: { totalBusinesses: number; totalBlogPosts: number; totalKeywords: number; totalClicks: number }
    sites: Array<{ id: string; name: string; domain: string | null; total_businesses: number; total_blog_posts: number }>
    businesses: Array<{ id: string; site_id: string; category: string }>
    blogPosts: Array<{ id: string; site_id: string; status: string }>
    cronJobs: Array<{ id: string; name: string; last_status: string | null; enabled: boolean; last_run_at: string | null; schedule: string | null }>
    activity: Array<{ id: string; site_id: string | null; event_type: string; title: string; description: string | null; created_at: string }>
    gscSnapshots: Array<{ site_id: string; date: string; total_clicks: number | null }>
  }
}

const kpiConfig = [
  { key: 'totalBusinesses' as const, label: 'BUSINESSES', icon: '🏢', color: 'text-blue-400' },
  { key: 'totalBlogPosts' as const, label: 'BLOG POSTS', icon: '📝', color: 'text-purple-400' },
  { key: 'totalKeywords' as const, label: 'KEYWORDS', icon: '🔍', color: 'text-amber-400' },
  { key: 'totalClicks' as const, label: 'ORGANIC CLICKS', icon: '📈', color: 'text-emerald-400' },
]

const siteColors: Record<string, string> = {
  lv: 'border-blue-500/30 bg-blue-500/5',
  denver: 'border-purple-500/30 bg-purple-500/5',
  savannah: 'border-emerald-500/30 bg-emerald-500/5',
  jurassic: 'border-red-500/30 bg-red-500/5',
}

const siteIcons: Record<string, string> = {
  lv: '🏔️',
  denver: '🏔️',
  savannah: '🌳',
  jurassic: '🦕',
}

const eventIcons: Record<string, string> = {
  blog_written: '📝',
  business_added: '🏢',
  pr_created: '🔀',
  cron_ran: '⚙️',
  keyword_discovered: '🔍',
  rank_change: '📈',
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function DashboardClient({ data }: Props) {
  const { kpis, sites, cronJobs, activity } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-neutral-500 font-mono">Operations Overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.map((kpi) => (
          <Card key={kpi.key} className="glass-card bg-transparent border-white/5">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neutral-500 tracking-wider">{kpi.label}</span>
                <span className="text-lg">{kpi.icon}</span>
              </div>
              <div className={`kpi-number ${kpi.color}`}>
                {kpis[kpi.key].toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle Row: Activity + Cron */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Feed */}
        <Card className="glass-card bg-transparent border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">ACTIVITY FEED</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-neutral-600 text-sm font-mono">No activity yet. Seed data to populate.</p>
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
                  <div className="text-[10px] font-mono text-neutral-600 whitespace-nowrap">
                    {item.site_id && <Badge variant="outline" className="mr-1 text-[10px] py-0 px-1 border-white/10">{item.site_id.toUpperCase()}</Badge>}
                    {timeAgo(item.created_at)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cron Status Grid */}
        <Card className="glass-card bg-transparent border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">CRON STATUS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-80 overflow-y-auto">
            {cronJobs.length === 0 ? (
              <p className="text-neutral-600 text-sm font-mono">No cron jobs synced yet.</p>
            ) : (
              cronJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    !job.enabled ? 'bg-neutral-600' :
                    job.last_status === 'ok' ? 'bg-emerald-500' :
                    job.last_status === 'error' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`}></span>
                  <span className="text-sm text-white flex-1 truncate font-mono">{job.name}</span>
                  <span className="text-[10px] font-mono text-neutral-600">{job.schedule || '—'}</span>
                  {job.last_run_at && (
                    <span className="text-[10px] font-mono text-neutral-600">{timeAgo(job.last_run_at)}</span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Site Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(sites.length > 0 ? sites : [
          { id: 'lv', name: 'Lehigh Valley', domain: 'lehighvalleybest.com', total_businesses: 0, total_blog_posts: 0 },
          { id: 'denver', name: 'Denver', domain: 'bestofdenver.org', total_businesses: 0, total_blog_posts: 0 },
          { id: 'savannah', name: 'Savannah', domain: 'bestsavannahga.com', total_businesses: 0, total_blog_posts: 0 },
          { id: 'jurassic', name: 'Jurassic Apparel', domain: 'jurassicapparel.shop', total_businesses: 0, total_blog_posts: 0 },
        ]).map((site) => (
          <a key={site.id} href={`/site/${site.id}`} className="block group">
            <Card className={`border transition-all group-hover:ring-1 group-hover:ring-white/20 ${siteColors[site.id] || 'border-white/5'}`}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{siteIcons[site.id] || '🌐'}</span>
                    <span className="font-semibold text-white text-sm">{site.name}</span>
                  </div>
                  <span className="text-neutral-600 group-hover:text-white text-xs transition-colors">→</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {site.id !== 'jurassic' && (
                    <div>
                      <span className="text-neutral-500">Businesses</span>
                      <p className="text-white font-bold text-lg">{site.total_businesses}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-500">Blog Posts</span>
                    <p className="text-white font-bold text-lg">{site.total_blog_posts}</p>
                  </div>
                </div>
                {site.domain && (
                  <p className="text-[10px] font-mono text-neutral-600 mt-2">{site.domain}</p>
                )}
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
