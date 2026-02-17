'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Business } from '@/lib/supabase'

function HeatmapCell({ count }: { count: number }) {
  const bg = count === 0 ? 'bg-neutral-800' : count < 5 ? 'bg-red-900/60' : count < 10 ? 'bg-amber-900/60' : 'bg-emerald-900/60'
  const text = count === 0 ? 'text-neutral-600' : count < 5 ? 'text-red-400' : count < 10 ? 'text-amber-400' : 'text-emerald-400'
  return (
    <div className={`${bg} ${text} w-12 h-10 flex items-center justify-center rounded text-xs font-mono font-bold`}>
      {count}
    </div>
  )
}

export function DirectoriesClient({ businesses, sites }: { businesses: Business[]; sites: Array<{ id: string; name: string }> }) {
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const directorySites = sites.filter(s => s.id !== 'jurassic')
  const siteIds = directorySites.map(s => s.id)
  
  const categories = useMemo(() => {
    const cats = new Set<string>()
    businesses.filter(b => siteIds.includes(b.site_id)).forEach(b => cats.add(b.category))
    return Array.from(cats).sort()
  }, [businesses, siteIds])

  const heatmapData = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      counts: Object.fromEntries(siteIds.map(sid => [
        sid,
        businesses.filter(b => b.site_id === sid && b.category === cat).length
      ]))
    }))
  }, [categories, businesses, siteIds])

  const filtered = businesses.filter(b => {
    if (siteFilter !== 'all' && b.site_id !== siteFilter) return false
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Directories</h1>
        <p className="text-sm text-neutral-500 font-mono">{businesses.length} businesses across {directorySites.length} directories</p>
      </div>

      {/* Heatmap */}
      {heatmapData.length > 0 && (
        <Card className="glass-card bg-transparent border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">CATEGORY FILL RATE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-mono text-neutral-500 pb-2 pr-4">Category</th>
                    {directorySites.map(s => (
                      <th key={s.id} className="text-center text-xs font-mono text-neutral-500 pb-2 px-1">{s.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.slice(0, 20).map(row => (
                    <tr key={row.category}>
                      <td className="text-xs text-neutral-300 py-0.5 pr-4 font-mono truncate max-w-[200px]">{row.category}</td>
                      {siteIds.map(sid => (
                        <td key={sid} className="py-0.5 px-1">
                          <HeatmapCell count={row.counts[sid] || 0} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-3 text-[10px] font-mono text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-900/60"></span> &lt;5</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-900/60"></span> 5-9</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-900/60"></span> 10+</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono">
          <option value="all">All Sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Business Table */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">SITE</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">NAME</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">CATEGORY</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">CITY</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">RATING</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">REVIEWS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-600 font-mono py-8">
                    No businesses found. Seed data to populate.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(0, 100).map(b => (
                  <TableRow key={b.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-white/10 font-mono">
                        {b.site_id?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white text-sm">{b.name}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-400">{b.category}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filtered.length > 100 && (
            <p className="text-center text-xs text-neutral-600 font-mono py-3">Showing 100 of {filtered.length}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
