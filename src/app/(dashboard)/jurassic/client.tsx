'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Site = { id: string; name: string; domain: string | null; total_businesses: number; total_blog_posts: number }
type BlogPost = { id: string; title: string; status: string; target_keyword: string | null; keyword_volume: number | null }
type Keyword = { id: string; keyword: string; volume: number | null; difficulty: string | null; gsc_clicks: number | null; gsc_position: number | null }

type Props = {
  site: Site | null
  blogPosts: BlogPost[]
  keywords: Keyword[]
}

export function JurassicOverviewClient({ site, blogPosts, keywords }: Props) {
  const totalVolume = keywords.reduce((sum, k) => sum + (k.volume || 0), 0)
  const totalClicks = keywords.reduce((sum, k) => sum + (k.gsc_clicks || 0), 0)
  const publishedPosts = blogPosts.filter(p => p.status === 'published').length
  const topKeywords = keywords.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🦕</span>
          <div>
            <h1 className="text-2xl font-bold text-white">Jurassic Apparel</h1>
            {site && (
              <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
                 className="text-sm text-neutral-500 hover:text-white transition-colors">
                {site.domain} ↗
              </a>
            )}
          </div>
        </div>
        <p className="text-sm text-neutral-500 font-mono">E-commerce dinosaur apparel store</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'BLOG POSTS', value: blogPosts.length, color: 'text-purple-400' },
          { label: 'PUBLISHED', value: publishedPosts, color: 'text-emerald-400' },
          { label: 'KEYWORDS', value: keywords.length, color: 'text-amber-400' },
          { label: 'GSC CLICKS', value: totalClicks.toLocaleString(), color: 'text-blue-400' },
        ].map(kpi => (
          <Card key={kpi.label} className="glass-card bg-transparent border-red-500/20">
            <CardContent className="pt-4 pb-3 px-4">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">{kpi.label}</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${kpi.color}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Keywords */}
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4">
            <h3 className="text-sm font-mono text-neutral-400 mb-3">TOP KEYWORDS</h3>
            <div className="space-y-2">
              {topKeywords.length === 0 ? (
                <p className="text-neutral-600 text-sm">No keywords tracked yet</p>
              ) : (
                topKeywords.map(k => (
                  <div key={k.id} className="flex justify-between items-center">
                    <span className="text-sm text-white">{k.keyword}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-neutral-500">{k.volume?.toLocaleString() || 0} vol</span>
                      {k.difficulty && (
                        <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-mono ${
                          k.difficulty === 'LOW' ? 'border-emerald-500/30 text-emerald-400' :
                          k.difficulty === 'MEDIUM' ? 'border-amber-500/30 text-amber-400' :
                          'border-red-500/30 text-red-400'
                        }`}>{k.difficulty}</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4">
            <h3 className="text-sm font-mono text-neutral-400 mb-3">RECENT BLOG POSTS</h3>
            <div className="space-y-2">
              {blogPosts.length === 0 ? (
                <p className="text-neutral-600 text-sm">No blog posts yet</p>
              ) : (
                blogPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex justify-between items-center">
                    <span className="text-sm text-white truncate max-w-[250px]">{post.title}</span>
                    <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-mono ${
                      post.status === 'published' ? 'border-emerald-500/30 text-emerald-400' :
                      'border-neutral-500/30 text-neutral-400'
                    }`}>{post.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="glass-card bg-transparent border-red-500/10">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">SEO Summary</h3>
              <p className="text-sm text-neutral-500">Total keyword volume being targeted</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-400">{totalVolume.toLocaleString()}</div>
              <div className="text-xs text-neutral-500">monthly searches</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
