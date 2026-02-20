'use client'

import { useState } from 'react'
import { BlogPost, Site } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { FileText, ExternalLink, MessageSquare, X, CheckCircle } from 'lucide-react'

type CommentModal = {
  post: BlogPost
  url: string
} | null

export function ContentClient({ posts, sites }: { posts: BlogPost[]; sites: Pick<Site, 'id' | 'name' | 'domain'>[] }) {
  const searchParams = useSearchParams()
  const initialSite = searchParams.get('site') || 'all'
  const [selectedSite, setSelectedSite] = useState(initialSite)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'created' | 'published'>('published')
  const [commentModal, setCommentModal] = useState<CommentModal>(null)
  const [commentText, setCommentText] = useState('')
  const [commentType, setCommentType] = useState<'issue' | 'learning'>('issue')
  const [submitting, setSubmitting] = useState(false)

  const filteredPosts = posts.filter(post => {
    const matchesSite = selectedSite === 'all' || post.site_id === selectedSite
    const matchesSearch = !search || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.target_keyword?.toLowerCase().includes(search.toLowerCase())
    return matchesSite && matchesSearch
  }).sort((a, b) => {
    const dateA = sortBy === 'published' 
      ? (a.published_at || a.created_at) 
      : a.created_at
    const dateB = sortBy === 'published' 
      ? (b.published_at || b.created_at) 
      : b.created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  const getSite = (siteId: string) => sites.find(s => s.id === siteId)
  const getSiteName = (siteId: string) => getSite(siteId)?.name || 'Unknown'
  
  const getPostUrl = (post: BlogPost) => {
    const site = getSite(post.site_id)
    if (!site?.domain) {
      console.log('[URL Debug] No domain for site:', post.site_id)
      return null
    }
    
    console.log('[URL Debug]', {
      slug: post.slug,
      siteId: site.id,
      domain: site.domain,
      category: post.category,
      isChristmas: site.id === 'christmas',
      domainIncludes: site.domain.includes('thebestchristmas'),
      categoryStartsWithRecipes: post.category?.startsWith('recipes/')
    })
    
    // Special handling for Christmas site (thebestchristmas.co)
    if (site.id === 'christmas' || site.domain.includes('thebestchristmas')) {
      if (post.category?.startsWith('recipes/')) {
        const subcategory = post.category.split('/')[1]
        const url = `https://${site.domain}/christmas-recipes/${subcategory}/${post.slug}/`
        console.log('[URL Debug] Generated recipe URL:', url)
        return url
      }
      if (post.category?.startsWith('crafts/')) {
        const subcategory = post.category.split('/')[1]
        const url = `https://${site.domain}/christmas-crafts/${subcategory}/${post.slug}/`
        console.log('[URL Debug] Generated craft URL:', url)
        return url
      }
      if (post.category?.startsWith('blog/')) {
        // Blog posts may have subdirectories (e.g. blog/2026/slug)
        const categoryPath = post.category.substring(5) // Remove "blog/" prefix
        if (categoryPath) {
          const url = `https://${site.domain}/blog/${categoryPath}/${post.slug}/`
          console.log('[URL Debug] Generated blog URL with subdirectory:', url)
          return url
        }
        const url = `https://${site.domain}/blog/${post.slug}/`
        console.log('[URL Debug] Generated blog URL:', url)
        return url
      }
      // Fallback
      const url = `https://${site.domain}/blog/${post.slug}/`
      console.log('[URL Debug] Fallback URL for Christmas:', url)
      return url
    }
    
    // Directory sites (LV, Savannah, Denver) - format: /{category}/blog/{slug}
    if (post.category) {
      return `https://${site.domain}/${post.category}/blog/${post.slug}`
    }
    // Fallback for posts without category
    return `https://${site.domain}/blog/${post.slug}`
  }

  const statusColors: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    pending: 'bg-blue-500/20 text-blue-400',
  }

  const handleSubmitComment = async () => {
    if (!commentModal || !commentText.trim()) return
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/content-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: commentModal.post.id,
          postTitle: commentModal.post.title,
          postUrl: commentModal.url,
          comment: commentText,
          type: commentType
        })
      })

      if (response.ok) {
        setCommentModal(null)
        setCommentText('')
        setCommentType('issue')
        // Could add a toast notification here
      } else {
        alert('Failed to submit comment')
      }
    } catch (error) {
      console.error('Comment submission error:', error)
      alert('Failed to submit comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkReviewed = async (post: BlogPost, url: string) => {
    if (!confirm(`Mark "${post.title}" as reviewed?`)) return
    
    try {
      const response = await fetch('/api/content-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          postTitle: post.title,
          postUrl: url
        })
      })

      if (response.ok) {
        // Could add a toast notification here
      } else {
        alert('Failed to mark as reviewed')
      }
    } catch (error) {
      console.error('Review error:', error)
      alert('Failed to mark as reviewed')
    }
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'created' | 'published')}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="published">Latest Published</option>
          <option value="created">Latest Created</option>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr className="text-left text-xs text-zinc-400 uppercase">
                  <th className="p-4 whitespace-nowrap">Title</th>
                  <th className="p-4 whitespace-nowrap">Site</th>
                  <th className="p-4 whitespace-nowrap">Keyword</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Date</th>
                  <th className="p-4 whitespace-nowrap"></th>
                </tr>
              </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPosts.map((post) => {
                const url = getPostUrl(post)
                return (
                  <tr key={post.id} className="hover:bg-zinc-800/30">
                    <td className="p-4">
                      {url ? (
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <p className="font-medium text-white truncate max-w-xs group-hover:text-orange-400 transition-colors flex items-center gap-1">
                            {post.title}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-xs text-zinc-500 truncate max-w-xs group-hover:text-zinc-400">/{post.slug}</p>
                        </a>
                      ) : (
                        <>
                          <p className="font-medium text-white truncate max-w-xs">{post.title}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-xs">/{post.slug}</p>
                        </>
                      )}
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
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkReviewed(post, url || '')}
                          className="p-2 text-zinc-400 hover:text-green-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Mark as reviewed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ post, url: url || '' })}
                          className="p-2 text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Add comment"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Add Comment</h3>
                <p className="text-sm text-zinc-400 mt-1">{commentModal.post.title}</p>
              </div>
              <button
                onClick={() => setCommentModal(null)}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Comment Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCommentType('issue')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      commentType === 'issue'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    🚨 Issue (creates task)
                  </button>
                  <button
                    onClick={() => setCommentType('learning')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      commentType === 'learning'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    ✨ Learning (logs success)
                  </button>
                </div>
              </div>

              {/* Comment textarea */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {commentType === 'issue' ? 'What needs to be fixed?' : 'What worked well?'}
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 min-h-[120px]"
                  placeholder={
                    commentType === 'issue'
                      ? 'Describe the issue or improvement needed...'
                      : 'Describe what made this content effective...'
                  }
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCommentModal(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || submitting}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {submitting ? 'Submitting...' : `Submit ${commentType === 'issue' ? 'Issue' : 'Learning'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
