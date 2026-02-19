'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const siteNames: Record<string, string> = { lv: 'Lehigh Valley', denver: 'Denver', savannah: 'Savannah' }

type Business = {
  id: string; name: string; slug: string; category: string; subcategory: string | null;
  city: string | null; google_rating: number | null; google_review_count: number | null;
  score: number | null; featured: boolean; website: string | null; added_at: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function HeatmapCell({ count }: { count: number }) {
  const bg = count === 0 ? 'bg-neutral-800' : count < 5 ? 'bg-red-900/60' : count < 10 ? 'bg-amber-900/60' : 'bg-emerald-900/60'
  const text = count === 0 ? 'text-neutral-600' : count < 5 ? 'text-red-400' : count < 10 ? 'text-amber-400' : 'text-emerald-400'
  return (
    <div className={`${bg} ${text} w-full h-10 flex items-center justify-center rounded text-xs font-mono font-bold`}>
      {count}
    </div>
  )
}

export function BusinessesClient({ siteId, businesses }: { siteId: string; businesses: Business[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const cats = new Set<string>()
    businesses.forEach(b => cats.add(b.category))
    return Array.from(cats).sort()
  }, [businesses])

  const subcategoryMap = useMemo(() => {
    const m: Record<string, Record<string, number>> = {}
    businesses.forEach(b => {
      if (!m[b.category]) m[b.category] = {}
      const sub = b.subcategory || '(general)'
      m[b.category][sub] = (m[b.category][sub] || 0) + 1
    })
    return m
  }, [businesses])

  const filtered = businesses.filter(b => {
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/site/${siteId}`} className="text-neutral-500 hover:text-white text-sm transition-colors">
              {siteNames[siteId]}
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white text-sm font-medium">Businesses</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{businesses.length} Businesses</h1>
        </div>
      </div>

      {/* Category Fill Heatmap */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">CATEGORY FILL RATE (target: 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.entries(subcategoryMap).flatMap(([cat, subs]) =>
              Object.entries(subs).map(([sub, count]) => (
                <button
                  key={`${cat}/${sub}`}
                  onClick={() => setCategoryFilter(cat)}
                  className="text-left hover:ring-1 hover:ring-white/20 rounded transition-all"
                >
                  <HeatmapCell count={count} />
                  <p className="text-[10px] font-mono text-neutral-500 mt-1 truncate px-0.5">
                    {sub === '(general)' ? cat : `${cat}/${sub}`}
                  </p>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono">
          <option value="all">All Categories ({businesses.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>{c} ({businesses.filter(b => b.category === c).length})</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search businesses..."
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono placeholder:text-neutral-600 flex-1 max-w-xs"
        />
        {(categoryFilter !== 'all' || search) && (
          <button onClick={() => { setCategoryFilter('all'); setSearch('') }}
            className="text-xs text-neutral-500 hover:text-white font-mono">Clear</button>
        )}
      </div>

      {/* Business Table */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">NAME</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">CATEGORY</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">CITY</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">RATING</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">REVIEWS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">ADDED</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-600 font-mono py-8">No businesses found.</TableCell>
                </TableRow>
              ) : (
                filtered.map(b => (
                  <TableRow key={b.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-white text-sm">
                      <div className="flex items-center gap-2">
                        {b.featured && <span className="text-amber-400 text-xs">⭐</span>}
                        {b.name}
                        {b.website && (
                          <a href={b.website} target="_blank" rel="noopener noreferrer"
                            className="text-neutral-600 hover:text-white text-xs">↗</a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-400">
                      {b.subcategory ? `${b.category}/${b.subcategory}` : b.category}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-400">{b.city || '—'}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {b.google_rating ? (
                        <span className={b.google_rating >= 4.5 ? 'text-emerald-400' : b.google_rating >= 4 ? 'text-amber-400' : 'text-red-400'}>
                          ★ {b.google_rating}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">
                      {b.google_review_count?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-500">
                      {formatDate(b.added_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
