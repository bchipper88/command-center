'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Keyword, GscSnapshot } from '@/lib/supabase'

const siteChartColors: Record<string, string> = {
  lv: '#3b82f6',
  denver: '#a855f7',
  savannah: '#10b981',
  jurassic: '#ef4444',
}

type SortKey = 'keyword' | 'site_id' | 'volume' | 'gsc_position' | 'gsc_impressions' | 'gsc_clicks' | 'gsc_ctr'
type SortDir = 'asc' | 'desc'

function PositionBadge({ pos }: { pos: number | null }) {
  if (!pos) return <span className="text-neutral-600">—</span>
  const color = pos <= 3 ? 'text-emerald-400' : pos <= 10 ? 'text-amber-400' : pos <= 20 ? 'text-orange-400' : 'text-red-400'
  return <span className={`font-mono font-bold ${color}`}>{pos.toFixed(1)}</span>
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />
  return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
}

export function SeoClient({ keywords, sites, gscSnapshots }: {
  keywords: Keyword[]
  sites: Array<{ id: string; name: string }>
  gscSnapshots: GscSnapshot[]
}) {
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('gsc_impressions')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    return keywords
      .filter(k => siteFilter === 'all' || k.site_id === siteFilter)
      .sort((a, b) => {
        const aVal = a[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
        const bVal = b[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
      })
  }, [keywords, siteFilter, sortKey, sortDir])

  // Prepare chart data: group snapshots by date, one line per site
  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {}
    gscSnapshots.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = {}
      byDate[s.date][s.site_id] = s.total_clicks || 0
    })
    return Object.entries(byDate).map(([date, clicks]) => ({ date, ...clicks })).sort((a, b) => a.date.localeCompare(b.date))
  }, [gscSnapshots])

  const totalClicks = keywords.reduce((s, k) => s + (k.gsc_clicks || 0), 0)
  const totalImpressions = keywords.reduce((s, k) => s + (k.gsc_impressions || 0), 0)
  const avgPosition = keywords.filter(k => k.gsc_position).length > 0
    ? (keywords.reduce((s, k) => s + (k.gsc_position || 0), 0) / keywords.filter(k => k.gsc_position).length).toFixed(1)
    : '—'

  const SortableHeader = ({ column, label, align = 'left' }: { column: SortKey; label: string; align?: 'left' | 'right' }) => (
    <TableHead 
      className={`text-neutral-500 font-mono text-xs cursor-pointer hover:text-neutral-300 transition-colors select-none ${align === 'right' ? 'text-right' : ''}`}
      onClick={() => handleSort(column)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">SEO Command</h1>
        <p className="text-sm text-neutral-500 font-mono">{keywords.length} keywords tracked</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-mono text-neutral-500">TOTAL CLICKS</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">{totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-mono text-neutral-500">IMPRESSIONS</p>
            <p className="text-2xl font-bold font-mono text-blue-400">{totalImpressions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-mono text-neutral-500">AVG POSITION</p>
            <p className="text-2xl font-bold font-mono text-amber-400">{avgPosition}</p>
          </CardContent>
        </Card>
      </div>

      {/* GSC Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card bg-transparent border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">CLICK TREND (GSC)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                <Legend />
                {sites.map(s => (
                  <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={siteChartColors[s.id] || '#888'} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)}
        className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono">
        <option value="all">All Sites</option>
        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {/* Keyword Table */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <SortableHeader column="keyword" label="KEYWORD" />
                <SortableHeader column="site_id" label="SITE" />
                <SortableHeader column="volume" label="VOL" align="right" />
                <TableHead className="text-neutral-500 font-mono text-xs">DIFF</TableHead>
                <SortableHeader column="gsc_position" label="POS" align="right" />
                <SortableHeader column="gsc_impressions" label="IMPR" align="right" />
                <SortableHeader column="gsc_clicks" label="CLICKS" align="right" />
                <SortableHeader column="gsc_ctr" label="CTR" align="right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-neutral-600 font-mono py-8">
                    No keywords found. Seed data to populate.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(0, 250).map(k => (
                  <TableRow key={k.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-white text-sm font-mono">{k.keyword}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-white/10 font-mono">
                        {k.site_id?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">
                      {k.volume?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] py-0 px-1.5 border ${
                        k.difficulty === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        k.difficulty === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        k.difficulty === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
                      }`}>
                        {k.difficulty || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right"><PositionBadge pos={k.gsc_position} /></TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">
                      {k.gsc_impressions?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">
                      {k.gsc_clicks?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">
                      {k.gsc_ctr ? `${k.gsc_ctr.toFixed(1)}%` : '—'}
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
