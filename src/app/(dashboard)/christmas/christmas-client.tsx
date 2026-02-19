'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PageGrade = {
  path: string
  title: string
  overall_score: number
  seo_score: number
  content_quality_score: number
  content_length_score: number
  pseo_score: number
  formatting_score: number
  completeness_score: number
  word_count: number
  has_images: number
  images_needed: boolean
  image_priority: string | null
  notes: string | null
}

type Props = {
  grades: PageGrade[]
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? 'bg-emerald-500' : score >= 80 ? 'bg-blue-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="text-white font-mono">{score}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export function ChristmasOverviewClient({ grades }: Props) {
  // Calculate stats
  const totalPages = grades.length
  const avgScore = totalPages > 0 ? Math.round(grades.reduce((sum, g) => sum + g.overall_score, 0) / totalPages) : 0
  const avgSeo = totalPages > 0 ? Math.round(grades.reduce((sum, g) => sum + g.seo_score, 0) / totalPages) : 0
  const avgQuality = totalPages > 0 ? Math.round(grades.reduce((sum, g) => sum + g.content_quality_score, 0) / totalPages) : 0
  const avgLength = totalPages > 0 ? Math.round(grades.reduce((sum, g) => sum + g.content_length_score, 0) / totalPages) : 0
  const avgPseo = totalPages > 0 ? Math.round(grades.reduce((sum, g) => sum + g.pseo_score, 0) / totalPages) : 0
  const avgFormat = totalPages > 0 ? Math.round(grades.reduce((sum, g) => sum + g.formatting_score, 0) / totalPages) : 0
  const avgComplete = totalPages > 0 ? Math.round(grades.reduce((sum, g) => sum + g.completeness_score, 0) / totalPages) : 0
  
  const excellent = grades.filter(g => g.overall_score >= 90).length
  const good = grades.filter(g => g.overall_score >= 80 && g.overall_score < 90).length
  const needsWork = grades.filter(g => g.overall_score < 80).length
  
  // Image stats
  const needsImages = grades.filter(g => g.images_needed).length
  const highPriorityImages = grades.filter(g => g.image_priority === 'HIGH').length
  // const pagesWithImages = grades.filter(g => g.has_images > 0).length
  
  // Top and bottom performers
  const sorted = [...grades].sort((a, b) => b.overall_score - a.overall_score)
  const topPages = sorted.slice(0, 5)
  const bottomPages = sorted.slice(-5).reverse()
  
  // Category breakdown
  const categories: Record<string, PageGrade[]> = {}
  grades.forEach(g => {
    const parts = g.path.split('/').filter(Boolean)
    const category = parts[0] || 'root'
    if (!categories[category]) categories[category] = []
    categories[category].push(g)
  })
  
  const categoryStats = Object.entries(categories).map(([name, pages]) => ({
    name,
    count: pages.length,
    avgScore: Math.round(pages.reduce((sum, p) => sum + p.overall_score, 0) / pages.length)
  })).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🎄 The Best Christmas</h1>
          <a href="https://www.thebestchristmas.co" target="_blank" rel="noopener noreferrer"
            className="text-sm text-neutral-500 font-mono hover:text-emerald-400 transition-colors">
            thebestchristmas.co ↗
          </a>
        </div>
        <Link href="/christmas/pages"
          className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20 transition-colors">
          View All Pages →
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-neutral-500 tracking-wider">TOTAL PAGES</span>
              <span className="text-lg">📄</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">{totalPages}</div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-neutral-500 tracking-wider">AVG SCORE</span>
              <span className="text-lg">📊</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${avgScore >= 85 ? 'text-emerald-400' : avgScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
              {avgScore}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-neutral-500 tracking-wider">EXCELLENT (90+)</span>
              <span className="text-lg">⭐</span>
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400">{excellent}</div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-neutral-500 tracking-wider">NEEDS WORK</span>
              <span className="text-lg">⚠️</span>
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400">{needsWork}</div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-red-500/20">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-neutral-500 tracking-wider">NEEDS IMAGES</span>
              <span className="text-lg">🖼️</span>
            </div>
            <div className="text-3xl font-bold font-mono text-red-400">{needsImages}</div>
            <div className="text-xs text-neutral-500 mt-1">{highPriorityImages} high priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card bg-transparent border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">SCORE BREAKDOWN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar score={avgSeo} label="SEO Adherence" />
            <ScoreBar score={avgQuality} label="Content Quality" />
            <ScoreBar score={avgLength} label="Content Length" />
            <ScoreBar score={avgPseo} label="PSEO Adherence" />
            <ScoreBar score={avgFormat} label="Formatting" />
            <ScoreBar score={avgComplete} label="Completeness" />
          </CardContent>
        </Card>

        <Card className="glass-card bg-transparent border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">CATEGORY BREAKDOWN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {categoryStats.map(cat => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-300 flex-1 truncate">/{cat.name}/</span>
                <span className="text-xs text-neutral-500">{cat.count} pages</span>
                <span className={`text-xs font-mono font-bold w-8 text-right ${
                  cat.avgScore >= 90 ? 'text-emerald-400' : cat.avgScore >= 80 ? 'text-blue-400' : 'text-amber-400'
                }`}>
                  {cat.avgScore}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card bg-transparent border-emerald-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-emerald-400 tracking-wider">🏆 TOP PERFORMERS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPages.map((page, i) => (
              <div key={page.path} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <span className="text-lg w-6">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                <a href={`https://www.thebestchristmas.co${page.path}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-sm text-white truncate hover:text-emerald-400 transition-colors">
                  {page.path}
                </a>
                <span className="text-sm font-mono font-bold text-emerald-400">{page.overall_score}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card bg-transparent border-amber-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-amber-400 tracking-wider">⚠️ NEEDS ATTENTION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bottomPages.map((page) => (
              <div key={page.path} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <span className="text-lg w-6">📝</span>
                <a href={`https://www.thebestchristmas.co${page.path}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-sm text-white truncate hover:text-amber-400 transition-colors">
                  {page.path}
                </a>
                <span className="text-sm font-mono font-bold text-amber-400">{page.overall_score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Distribution */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">SCORE DISTRIBUTION</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-end h-24">
            {[
              { range: '90-100', count: excellent, color: 'bg-emerald-500' },
              { range: '80-89', count: good, color: 'bg-blue-500' },
              { range: '70-79', count: grades.filter(g => g.overall_score >= 70 && g.overall_score < 80).length, color: 'bg-amber-500' },
              { range: '<70', count: grades.filter(g => g.overall_score < 70).length, color: 'bg-red-500' },
            ].map(bucket => {
              const height = totalPages > 0 ? Math.max(8, (bucket.count / totalPages) * 100) : 8
              return (
                <div key={bucket.range} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full ${bucket.color} rounded-t`} style={{ height: `${height}%` }} />
                  <span className="text-[10px] font-mono text-neutral-500">{bucket.range}</span>
                  <span className="text-xs font-mono text-white">{bucket.count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
