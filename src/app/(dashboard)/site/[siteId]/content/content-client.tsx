'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const siteNames: Record<string, string> = { lv: 'Lehigh Valley', denver: 'Denver', savannah: 'Savannah', jurassic: 'Jurassic Apparel' }

const statusColors: Record<string, string> = {
  planned: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  writing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  pr_open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

type BlogPost = {
  id: string; slug: string; title: string; target_keyword: string | null;
  keyword_volume: number | null; keyword_difficulty: string | null;
  category: string | null; status: string; word_count: number | null;
  internal_link_count: number | null; pr_url: string | null;
  published_at: string | null; created_at: string
}

export function ContentClient({ siteId, blogPosts }: { siteId: string; blogPosts: BlogPost[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const statusCounts: Record<string, number> = {}
  blogPosts.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
  })

  const filtered = statusFilter === 'all' ? blogPosts : blogPosts.filter(p => p.status === statusFilter)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/site/${siteId}`} className="text-neutral-500 hover:text-white text-sm transition-colors">
            {siteNames[siteId]}
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="text-white text-sm font-medium">Content</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Blog Pipeline</h1>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['planned', 'writing', 'pr_open', 'published'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            className={`border rounded-lg p-3 text-left transition-all ${
              statusFilter === status ? 'ring-1 ring-white/30' : ''
            } ${statusColors[status]}`}
          >
            <div className="text-2xl font-bold font-mono">{statusCounts[status] || 0}</div>
            <div className="text-xs font-mono uppercase tracking-wider opacity-60">{status.replace('_', ' ')}</div>
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
                <TableHead className="text-neutral-500 font-mono text-xs">DIFFICULTY</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">STATUS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">WORDS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs text-right">LINKS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">PR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-neutral-600 font-mono py-8">
                    No blog posts yet. The blog cron will populate this.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(p => (
                  <TableRow key={p.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-white text-sm max-w-[300px] truncate">{p.title}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-400 max-w-[200px] truncate">{p.target_keyword || '—'}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">{p.keyword_volume?.toLocaleString() || '—'}</TableCell>
                    <TableCell>
                      {p.keyword_difficulty && (
                        <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-mono ${
                          p.keyword_difficulty === 'LOW' ? 'border-emerald-500/30 text-emerald-400' :
                          p.keyword_difficulty === 'MEDIUM' ? 'border-amber-500/30 text-amber-400' :
                          'border-red-500/30 text-red-400'
                        }`}>{p.keyword_difficulty}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] py-0.5 px-2 font-mono border ${statusColors[p.status]}`}>
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">{p.word_count?.toLocaleString() || '—'}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-neutral-400">{p.internal_link_count || '—'}</TableCell>
                    <TableCell>
                      {p.pr_url ? (
                        <a href={p.pr_url} target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs font-mono">PR ↗</a>
                      ) : '—'}
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
