'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Keyword = {
  id: string; keyword: string; volume: number | null; cpc: number | null;
  difficulty: string | null; category: string | null;
  gsc_position: number | null; gsc_impressions: number | null;
  gsc_clicks: number | null; gsc_ctr: number | null
}

function PositionBadge({ pos }: { pos: number | null }) {
  if (!pos) return <span className="text-neutral-600">—</span>
  const color = pos <= 3 ? 'text-emerald-400' : pos <= 10 ? 'text-amber-400' : pos <= 20 ? 'text-orange-400' : 'text-red-400'
  return <span className={`font-mono font-bold ${color}`}>{pos.toFixed(1)}</span>
}

export function JurassicSEOClient({ keywords }: { keywords: Keyword[] }) {
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('all')

  const filtered = keywords.filter(k => {
    if (search && !k.keyword.toLowerCase().includes(search.toLowerCase())) return false
    if (diffFilter !== 'all' && k.difficulty !== diffFilter) return false
    return true
  })

  const totalVolume = keywords.reduce((s, k) => s + (k.volume || 0), 0)
  const totalClicks = keywords.reduce((s, k) => s + (k.gsc_clicks || 0), 0)
  const rankedKws = keywords.filter(k => k.gsc_position)
  const avgPosition = rankedKws.length > 0
    ? (rankedKws.reduce((s, k) => s + (k.gsc_position || 0), 0) / rankedKws.length).toFixed(1)
    : '—'

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🦕</span>
          <h1 className="text-2xl font-bold text-white">Jurassic Apparel SEO</h1>
        </div>
        <p className="text-sm text-neutral-500 font-mono">Keywords & search rankings</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'KEYWORDS', value: keywords.length, color: 'text-amber-400' },
          { label: 'TOTAL VOLUME', value: totalVolume.toLocaleString(), color: 'text-blue-400' },
          { label: 'GSC CLICKS', value: totalClicks.toLocaleString(), color: 'text-emerald-400' },
          { label: 'AVG POSITION', value: avgPosition, color: 'text-purple-400' },
        ].map(kpi => (
          <Card key={kpi.label} className="glass-card bg-transparent border-red-500/20">
            <CardContent className="pt-4 pb-3 px-4">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">{kpi.label}</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${kpi.color}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search keywords..."
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono placeholder:text-neutral-600 flex-1 max-w-sm"
        />
        <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono">
          <option value="all">All Difficulty</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      {/* Table */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">KEYWORD</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">VOLUME</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">DIFFICULTY</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">POSITION</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">CLICKS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">IMPRESSIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-600 font-mono py-8">
                    No keywords tracked yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(k => (
                  <TableRow key={k.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-white text-sm max-w-[300px] truncate">{k.keyword}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-300">{k.volume?.toLocaleString() || '—'}</TableCell>
                    <TableCell>
                      {k.difficulty && (
                        <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-mono ${
                          k.difficulty === 'LOW' ? 'border-emerald-500/30 text-emerald-400' :
                          k.difficulty === 'MEDIUM' ? 'border-amber-500/30 text-amber-400' :
                          'border-red-500/30 text-red-400'
                        }`}>{k.difficulty}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right"><PositionBadge pos={k.gsc_position} /></TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">{k.gsc_clicks?.toLocaleString() || '—'}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">{k.gsc_impressions?.toLocaleString() || '—'}</TableCell>
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
