'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const sites = [
  { id: 'lv', label: 'Lehigh Valley', color: 'bg-blue-500', borderColor: 'border-blue-500/30' },
  { id: 'denver', label: 'Denver', color: 'bg-purple-500', borderColor: 'border-purple-500/30' },
  { id: 'savannah', label: 'Savannah', color: 'bg-emerald-500', borderColor: 'border-emerald-500/30' },
]

type BlogPost = {
  id: string; site_id: string; slug: string; title: string; target_keyword: string | null;
  keyword_volume: number | null; keyword_difficulty: string | null;
  category: string | null; status: string; word_count: number | null;
  pr_url: string | null; published_at: string | null; created_at: string
}

const statusColors: Record<string, string> = {
  draft: 'border-neutral-500/30 text-neutral-400',
  writing: 'border-blue-500/30 text-blue-400',
  review: 'border-amber-500/30 text-amber-400',
  published: 'border-emerald-500/30 text-emerald-400',
}

export function DirectoriesContentClient({ blogPosts }: { blogPosts: BlogPost[] }) {
  const [activeSite, setActiveSite] = useState('lv')
  const [statusFilter, setStatusFilter] = useState('all')

  const sitePosts = blogPosts.filter(p => p.site_id === activeSite)
  const statuses = [...new Set(sitePosts.map(p => p.status))]
  
  const filtered = statusFilter === 'all' 
    ? sitePosts 
    : sitePosts.filter(p => p.status === statusFilter)

  const totalVolume = sitePosts.reduce((sum, p) => sum + (p.keyword_volume || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Pipeline</h1>
        <p className="text-sm text-neutral-500 font-mono">Blog posts across all directories</p>
      </div>

      {/* Site tabs */}
      <div className="flex gap-2">
        {sites.map((s) => {
          const count = blogPosts.filter(p => p.site_id === s.id).length
          return (
            <button
              key={s.id}
              onClick={() => { setActiveSite(s.id); setStatusFilter('all') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSite === s.id
                  ? `bg-white/10 text-white border ${s.borderColor}`
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${s.color} mr-2`}></span>
              {s.label}
              <span className="ml-2 text-neutral-600">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL POSTS', value: sitePosts.length, color: 'text-white' },
          { label: 'PUBLISHED', value: sitePosts.filter(p => p.status === 'published').length, color: 'text-emerald-400' },
          { label: 'IN PROGRESS', value: sitePosts.filter(p => ['draft', 'writing', 'review'].includes(p.status)).length, color: 'text-amber-400' },
          { label: 'TARGET VOLUME', value: totalVolume.toLocaleString(), color: 'text-blue-400' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card bg-transparent border-white/5">
            <CardContent className="pt-3 pb-2 px-4">
              <span className="text-[10px] font-mono text-neutral-500">{stat.label}</span>
              <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
            statusFilter === 'all' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
          }`}
        >
          All
        </button>
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              statusFilter === status ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">TITLE</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">KEYWORD</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">VOLUME</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">STATUS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">WORDS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-neutral-600 font-mono py-8">
                    No blog posts yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(post => (
                  <TableRow key={post.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-white text-sm max-w-[300px] truncate">{post.title}</TableCell>
                    <TableCell className="text-neutral-400 text-sm">{post.target_keyword || '—'}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-neutral-300">
                      {post.keyword_volume?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-mono ${statusColors[post.status] || ''}`}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-neutral-400">
                      {post.word_count?.toLocaleString() || '—'}
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
