'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink } from 'lucide-react'

type Site = {
  id: string
  name: string
  domain: string | null
}

type Business = {
  id: string; site_id: string; slug: string; name: string; category: string;
  subcategory: string | null; city: string | null; google_rating: number | null;
  google_review_count: number | null; featured: boolean; score: number | null
}

const siteColors: Record<string, { color: string; borderColor: string }> = {
  lv: { color: 'bg-blue-500', borderColor: 'border-blue-500/30' },
  denver: { color: 'bg-purple-500', borderColor: 'border-purple-500/30' },
  savannah: { color: 'bg-emerald-500', borderColor: 'border-emerald-500/30' },
}

export function DirectoriesBusinessesClient({ businesses, sites }: { businesses: Business[]; sites: Site[] }) {
  const [activeSite, setActiveSite] = useState(sites[0]?.id || 'lv')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const getSite = (siteId: string) => sites.find(s => s.id === siteId)
  
  const getBusinessUrl = (business: Business) => {
    const site = getSite(business.site_id)
    if (!site?.domain) return null
    // Directory sites typically use /category/slug pattern
    return `https://${site.domain}/${business.category.toLowerCase().replace(/\s+/g, '-')}/${business.slug}`
  }

  const siteBusinesses = businesses.filter(b => b.site_id === activeSite)
  const categories = Array.from(new Set(siteBusinesses.map(b => b.category))).sort()

  const filtered = siteBusinesses.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Businesses</h1>
        <p className="text-sm text-neutral-500 font-mono">All directory listings</p>
      </div>

      {/* Site tabs */}
      <div className="flex gap-2">
        {sites.map((s) => {
          const count = businesses.filter(b => b.site_id === s.id).length
          const colors = siteColors[s.id] || { color: 'bg-gray-500', borderColor: 'border-gray-500/30' }
          return (
            <button
              key={s.id}
              onClick={() => { setActiveSite(s.id); setCategoryFilter('all') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSite === s.id
                  ? `bg-white/10 text-white border ${colors.borderColor}`
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${colors.color} mr-2`}></span>
              {s.name}
              <span className="ml-2 text-neutral-600">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search businesses..."
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono placeholder:text-neutral-600 flex-1 max-w-sm"
        />
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono"
        >
          <option value="all">All Categories ({categories.length})</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL', value: siteBusinesses.length, color: 'text-white' },
          { label: 'FEATURED', value: siteBusinesses.filter(b => b.featured).length, color: 'text-amber-400' },
          { label: 'RATED 4.5+', value: siteBusinesses.filter(b => (b.google_rating || 0) >= 4.5).length, color: 'text-emerald-400' },
          { label: 'CATEGORIES', value: categories.length, color: 'text-blue-400' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card bg-transparent border-white/5">
            <CardContent className="pt-3 pb-2 px-4">
              <span className="text-[10px] font-mono text-neutral-500">{stat.label}</span>
              <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
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
                <TableHead className="text-neutral-500 font-mono text-xs text-right">SCORE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-600 font-mono py-8">
                    No businesses found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(0, 100).map(b => {
                  const url = getBusinessUrl(b)
                  return (
                    <TableRow key={b.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="text-white text-sm">
                        {url ? (
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-1 hover:text-orange-400 transition-colors"
                          >
                            {b.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          b.name
                        )}
                        {b.featured && <Badge className="ml-2 bg-amber-500/20 text-amber-400 text-[10px]">Featured</Badge>}
                      </TableCell>
                      <TableCell className="text-neutral-400 text-sm">{b.category}</TableCell>
                      <TableCell className="text-neutral-400 text-sm">{b.city || '—'}</TableCell>
                      <TableCell className="text-right">
                        {b.google_rating ? (
                          <span className={b.google_rating >= 4.5 ? 'text-emerald-400' : 'text-neutral-300'}>
                            ★ {b.google_rating.toFixed(1)}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-neutral-400 font-mono text-sm">
                        {b.google_review_count?.toLocaleString() || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-neutral-300">
                        {b.score?.toFixed(0) || '—'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          {filtered.length > 100 && (
            <p className="text-center text-xs text-neutral-600 font-mono py-3">
              Showing 100 of {filtered.length}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
