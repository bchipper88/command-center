'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type BlogPost = {
  id: string; slug: string; title: string; target_keyword: string | null;
  keyword_volume: number | null; keyword_difficulty: string | null;
  status: string; word_count: number | null; published_at: string | null; created_at: string
}

const statusColors: Record<string, string> = {
  draft: 'border-neutral-500/30 text-neutral-400',
  writing: 'border-blue-500/30 text-blue-400',
  review: 'border-amber-500/30 text-amber-400',
  published: 'border-emerald-500/30 text-emerald-400',
}

export function JurassicContentClient({ blogPosts }: { blogPosts: BlogPost[] }) {
  const [statusFilter, setStatusFilter] = useState('all')

  const statuses = Array.from(new Set(blogPosts.map(p => p.status)))
  const filtered = statusFilter === 'all' ? blogPosts : blogPosts.filter(p => p.status === statusFilter)
  const totalVolume = blogPosts.reduce((sum, p) => sum + (p.keyword_volume || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🦕</span>
          <h1 className="text-2xl font-bold text-white">Jurassic Apparel Content</h1>
        </div>
        <p className="text-sm text-neutral-500 font-mono">Blog posts & content pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL POSTS', value: blogPosts.length, color: 'text-white' },
          { label: 'PUBLISHED', value: blogPosts.filter(p => p.status === 'published').length, color: 'text-emerald-400' },
          { label: 'IN PROGRESS', value: blogPosts.filter(p => ['draft', 'writing', 'review'].includes(p.status)).length, color: 'text-amber-400' },
          { label: 'TARGET VOLUME', value: totalVolume.toLocaleString(), color: 'text-red-400' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card bg-transparent border-red-500/20">
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
                    No blog posts yet. Time to create some content! 🦖
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
