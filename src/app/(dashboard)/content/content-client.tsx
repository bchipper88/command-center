'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { BlogPost } from '@/lib/supabase'

const statusColors: Record<string, string> = {
  planned: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  writing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  pr_open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export function ContentClient({ posts, sites }: { posts: BlogPost[]; sites: Array<{ id: string; name: string }> }) {
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = posts.filter(p => {
    if (siteFilter !== 'all' && p.site_id !== siteFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Pipeline</h1>
          <p className="text-sm text-neutral-500 font-mono">{posts.length} total posts across all sites</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3">
        {['planned', 'writing', 'pr_open', 'published'].map(status => {
          const count = posts.filter(p => p.status === status).length
          return (
            <Card key={status} className="glass-card bg-transparent border-white/5 cursor-pointer"
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
              <CardContent className="pt-3 pb-2 px-4">
                <p className="text-xs font-mono text-neutral-500 uppercase">{status.replace('_', ' ')}</p>
                <p className={`text-2xl font-bold font-mono ${
                  status === 'published' ? 'text-emerald-400' :
                  status === 'pr_open' ? 'text-blue-400' :
                  status === 'writing' ? 'text-amber-400' : 'text-neutral-400'
                }`}>{count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={siteFilter}
          onChange={e => setSiteFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono"
        >
          <option value="all">All Sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono"
        >
          <option value="all">All Status</option>
          <option value="planned">Planned</option>
          <option value="writing">Writing</option>
          <option value="pr_open">PR Open</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Table */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">SITE</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">TITLE</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">KEYWORD</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">VOL</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">STATUS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">WORDS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">DATE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-neutral-600 font-mono py-8">
                    No posts found. Seed data to populate.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(post => (
                  <TableRow key={post.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-white/10 font-mono">
                        {post.site_id?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white text-sm max-w-[300px] truncate">{post.title}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-400">{post.target_keyword || '—'}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">
                      {post.keyword_volume?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] py-0 px-1.5 border ${statusColors[post.status] || ''}`}>
                        {post.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">
                      {post.word_count?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-neutral-600">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}
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
