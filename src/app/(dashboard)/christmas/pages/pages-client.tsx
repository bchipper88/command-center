'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

type PageGrade = {
  path: string
  url: string
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

type SortKey = 'path' | 'overall_score' | 'seo_score' | 'content_quality_score' | 'content_length_score' | 'word_count'

function ScoreCell({ score }: { score: number }) {
  const color = score >= 90 ? 'text-emerald-400' : score >= 80 ? 'text-blue-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'
  return <span className={`font-mono font-bold ${color}`}>{score}</span>
}

export function PagesClient({ grades }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('overall_score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')
  const [imageFilter, setImageFilter] = useState<string>('all')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    grades.forEach(g => {
      const parts = g.path.split('/').filter(Boolean)
      if (parts[0]) cats.add(parts[0])
    })
    return Array.from(cats).sort()
  }, [grades])

  // Filter and sort
  const filtered = useMemo(() => {
    return grades
      .filter(g => {
        if (filter && !g.path.toLowerCase().includes(filter.toLowerCase())) return false
        if (categoryFilter !== 'all') {
          const cat = g.path.split('/').filter(Boolean)[0]
          if (cat !== categoryFilter) return false
        }
        if (scoreFilter === 'excellent' && g.overall_score < 90) return false
        if (scoreFilter === 'good' && (g.overall_score < 80 || g.overall_score >= 90)) return false
        if (scoreFilter === 'needs-work' && g.overall_score >= 80) return false
        if (imageFilter === 'needs-images' && !g.images_needed) return false
        if (imageFilter === 'high-priority' && g.image_priority !== 'HIGH') return false
        if (imageFilter === 'has-images' && g.has_images === 0) return false
        return true
      })
      .sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
      })
  }, [grades, filter, categoryFilter, scoreFilter, imageFilter, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <TableHead 
      className="text-neutral-500 font-mono text-xs cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
        )}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/christmas" className="text-neutral-500 hover:text-white text-sm transition-colors">
              The Best Christmas
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white text-sm font-medium">Page Grades</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{filtered.length} Pages</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search paths..."
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono placeholder:text-neutral-600 w-64"
        />
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono"
        >
          <option value="all">All Categories ({grades.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>/{c}/ ({grades.filter(g => g.path.startsWith(`/${c}/`)).length})</option>
          ))}
        </select>
        <select 
          value={scoreFilter} 
          onChange={e => setScoreFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono"
        >
          <option value="all">All Scores</option>
          <option value="excellent">Excellent (90+)</option>
          <option value="good">Good (80-89)</option>
          <option value="needs-work">Needs Work (&lt;80)</option>
        </select>
        <select 
          value={imageFilter} 
          onChange={e => setImageFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono"
        >
          <option value="all">All Images</option>
          <option value="needs-images">🖼️ Needs Images ({grades.filter(g => g.images_needed).length})</option>
          <option value="high-priority">🔴 HIGH Priority ({grades.filter(g => g.image_priority === 'HIGH').length})</option>
          <option value="has-images">✅ Has Images ({grades.filter(g => g.has_images > 0).length})</option>
        </select>
        {(filter || categoryFilter !== 'all' || scoreFilter !== 'all' || imageFilter !== 'all') && (
          <button 
            onClick={() => { setFilter(''); setCategoryFilter('all'); setScoreFilter('all'); setImageFilter('all') }}
            className="text-xs text-neutral-500 hover:text-white font-mono"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <SortHeader label="PATH" sortKeyName="path" />
                  <SortHeader label="OVERALL" sortKeyName="overall_score" />
                  <SortHeader label="SEO" sortKeyName="seo_score" />
                  <SortHeader label="QUALITY" sortKeyName="content_quality_score" />
                  <SortHeader label="LENGTH" sortKeyName="content_length_score" />
                  <SortHeader label="WORDS" sortKeyName="word_count" />
                  <TableHead className="text-neutral-500 font-mono text-xs">IMAGES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-neutral-600 font-mono py-8">
                      No pages match filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(page => (
                    <TableRow key={page.path} className="border-white/5 hover:bg-white/5">
                      <TableCell className="text-white text-sm max-w-xs">
                        <a 
                          href={`https://www.thebestchristmas.co${page.path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                        >
                          <span className="truncate">{page.path}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
                        </a>
                      </TableCell>
                      <TableCell><ScoreCell score={page.overall_score} /></TableCell>
                      <TableCell><ScoreCell score={page.seo_score} /></TableCell>
                      <TableCell><ScoreCell score={page.content_quality_score} /></TableCell>
                      <TableCell><ScoreCell score={page.content_length_score} /></TableCell>
                      <TableCell className="font-mono text-xs text-neutral-400">{page.word_count.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">
                        {page.images_needed ? (
                          <span className={page.image_priority === 'HIGH' ? 'text-red-400' : 'text-amber-400'}>
                            {page.image_priority === 'HIGH' ? '🔴' : '🟡'} Needs images
                          </span>
                        ) : page.has_images > 0 ? (
                          <span className="text-emerald-400">✅ {page.has_images}</span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="text-xs text-neutral-600 font-mono flex flex-wrap gap-4">
        <span className="text-emerald-400">■ 90-100 Excellent</span>
        <span className="text-blue-400">■ 80-89 Good</span>
        <span className="text-amber-400">■ 70-79 Needs Work</span>
        <span className="text-red-400">■ &lt;70 Poor</span>
      </div>
    </div>
  )
}
