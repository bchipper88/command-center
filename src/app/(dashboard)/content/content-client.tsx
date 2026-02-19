'use client'

import { useState } from 'react'
import { BlogPost, Site } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { ExternalLink, FileText } from 'lucide-react'

export function ContentClient({ posts, sites }: { posts: BlogPost[]; sites: Pick<Site, 'id' | 'name'>[] }) {
  const searchParams = useSearchParams()
  const initialSite = searchParams.get('site') || 'all'
  const [selectedSite, setSelectedSite] = useState(initialSite)
  const [search, setSearch] = useState('')

  const filteredPosts = posts.filter(post => {
    const matchesSite = selectedSite === 'all' || post.site_id === selectedSite
    const matchesSearch = !search || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.target_keyword?.toLowerCase().includes(search.toLowerCase())
    return matchesSite && matchesSearch
  })

  const getSiteName = (siteId: string) => sites.find(s => s.id === siteId)?.name || 'Unknown'

  const statusColors: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    pending: 'bg-blue-500/20 text-blue-400',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-zinc-400 text-sm">{filteredPosts.length} posts across all sites</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Sites</option>
          {sites.map(site => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Posts Table */}
      {filteredPosts.length === 0 ? (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No posts found</p>
        </div>
      ) : (
        <div className="border border-zinc-700/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr className="text-left text-xs text-zinc-400 uppercase">
                <th className="p-4">Title</th>
                <th className="p-4">Site</th>
                <th className="p-4">Keyword</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-800/30">
                  <td className="p-4">
                    <p className="font-medium text-white truncate max-w-xs">{post.title}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-xs">/{post.slug}</p>
                  </td>
                  <td className="p-4 text-sm text-zinc-400">{getSiteName(post.site_id)}</td>
                  <td className="p-4 text-sm text-zinc-400">
                    {post.target_keyword || '-'}
                    {post.keyword_volume && (
                      <span className="text-xs text-zinc-500 ml-1">({post.keyword_volume})</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[post.status] || 'bg-zinc-700 text-zinc-400'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-zinc-500">
                    {post.published_at 
                      ? new Date(post.published_at).toLocaleDateString()
                      : new Date(post.created_at).toLocaleDateString()
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
