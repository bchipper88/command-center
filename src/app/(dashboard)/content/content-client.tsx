'use client'

import { useState, useEffect } from 'react'
import { BlogPost, Site } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { FileText, ExternalLink, MessageSquare, X, CheckCircle, ChevronRight, ChevronDown } from 'lucide-react'
import { TaskStatus } from './page'

type CommentModal = {
  post: BlogPost
  url: string
} | null

type Comment = {
  id: string
  title: string
  description: string | null
  status: string
  assigned_to: string | null
  created_at: string
}

export function ContentClient({ posts, sites, taskStatus }: { posts: BlogPost[]; sites: Pick<Site, 'id' | 'name' | 'domain'>[]; taskStatus: Record<string, TaskStatus> }) {
  const searchParams = useSearchParams()
  const initialSite = searchParams.get('site') || 'all'
  const [selectedSite, setSelectedSite] = useState(initialSite)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'created' | 'published' | 'unreviewed'>('unreviewed')
  const [commentModal, setCommentModal] = useState<CommentModal>(null)
  const [commentText, setCommentText] = useState('')
  const [commentType, setCommentType] = useState<'issue' | 'learning'>('issue')
  const [submitting, setSubmitting] = useState(false)
  const [reviewedPosts, setReviewedPosts] = useState<Set<string>>(new Set())
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set())

  // Initialize reviewed posts from database
  useEffect(() => {
    const reviewed = new Set(posts.filter(p => p.reviewed).map(p => p.id))
    setReviewedPosts(reviewed)
  }, [posts])

  const filteredPosts = posts.filter(post => {
    const matchesSite = selectedSite === 'all' || post.site_id === selectedSite
    const matchesSearch = !search || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.target_keyword?.toLowerCase().includes(search.toLowerCase())
    return matchesSite && matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'unreviewed') {
      // Unreviewed first, then sort by published date within each group
      const aReviewed = a.reviewed
      const bReviewed = b.reviewed
      if (aReviewed !== bReviewed) {
        return aReviewed ? 1 : -1 // Unreviewed (false) comes first
      }
      // Within same review status, sort by date
      const dateA = a.published_at || a.created_at
      const dateB = b.published_at || b.created_at
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    }
    
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
    if (!site?.domain) return null
    
    // Special handling for Christmas site (thebestchristmas.co)
    if (site.id === 'christmas' || site.domain.includes('thebestchristmas')) {
      if (post.category?.startsWith('recipes/')) {
        const subcategory = post.category.split('/')[1]
        return `https://${site.domain}/christmas-recipes/${subcategory}/${post.slug}/`
      }
      if (post.category?.startsWith('crafts/')) {
        const subcategory = post.category.split('/')[1]
        return `https://${site.domain}/christmas-crafts/${subcategory}/${post.slug}/`
      }
      if (post.category?.startsWith('blog/')) {
        // Blog posts may have subdirectories (e.g. blog/2026/slug)
        const categoryPath = post.category.substring(5) // Remove "blog/" prefix
        if (categoryPath) {
          return `https://${site.domain}/blog/${categoryPath}/${post.slug}/`
        }
        return `https://${site.domain}/blog/${post.slug}/`
      }
      // Fallback
      return `https://${site.domain}/blog/${post.slug}/`
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
          type: commentType,
          siteId: commentModal.post.site_id
        })
      })

      if (response.ok) {
        setCommentModal(null)
        setCommentText('')
        setCommentType('issue')
        
        // Refresh comments for this post if it's expanded
        if (expandedPosts.has(commentModal.post.id)) {
          const refreshResponse = await fetch(`/api/content-comments/${commentModal.post.id}`)
          if (refreshResponse.ok) {
            const data = await refreshResponse.json()
            setPostComments(prev => ({ ...prev, [commentModal.post.id]: data.comments }))
          }
        }
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

  const toggleExpanded = async (postId: string) => {
    const isExpanded = expandedPosts.has(postId)
    
    if (isExpanded) {
      // Collapse
      setExpandedPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    } else {
      // Expand and fetch comments if not already loaded
      setExpandedPosts(prev => new Set(prev).add(postId))
      
      if (!postComments[postId]) {
        setLoadingComments(prev => new Set(prev).add(postId))
        try {
          const response = await fetch(`/api/content-comments/${postId}`)
          if (response.ok) {
            const data = await response.json()
            setPostComments(prev => ({ ...prev, [postId]: data.comments }))
          }
        } catch (error) {
          console.error('Failed to fetch comments:', error)
        } finally {
          setLoadingComments(prev => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }
      }
    }
  }

  const handleMarkReviewed = async (post: BlogPost, url: string) => {
    const isCurrentlyReviewed = reviewedPosts.has(post.id)
    const newReviewedState = !isCurrentlyReviewed
    
    // Toggle local state immediately for instant feedback
    setReviewedPosts(prev => {
      const newSet = new Set(prev)
      if (isCurrentlyReviewed) {
        newSet.delete(post.id)
      } else {
        newSet.add(post.id)
      }
      return newSet
    })
    
    // Update database
    try {
      const response = await fetch('/api/content-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          postTitle: post.title,
          postUrl: url,
          reviewed: newReviewedState
        })
      })

      if (!response.ok) {
        // Revert local state on error
        setReviewedPosts(prev => {
          const newSet = new Set(prev)
          if (isCurrentlyReviewed) {
            newSet.add(post.id)
          } else {
            newSet.delete(post.id)
          }
          return newSet
        })
        alert('Failed to update review status')
      }
    } catch (error) {
      console.error('Review error:', error)
      // Revert local state on error
      setReviewedPosts(prev => {
        const newSet = new Set(prev)
        if (isCurrentlyReviewed) {
          newSet.add(post.id)
        } else {
          newSet.delete(post.id)
        }
        return newSet
      })
      alert('Failed to update review status')
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
          onChange={(e) => setSortBy(e.target.value as 'created' | 'published' | 'unreviewed')}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="published">Latest Published</option>
          <option value="created">Latest Created</option>
          <option value="unreviewed">Unreviewed First</option>
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
                  <th className="p-4 whitespace-nowrap">Issues</th>
                  <th className="p-4 whitespace-nowrap">Date</th>
                  <th className="p-4 whitespace-nowrap"></th>
                </tr>
              </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPosts.map((post) => {
                const url = getPostUrl(post)
                const isExpanded = expandedPosts.has(post.id)
                const comments = postComments[post.id] || []
                const isLoadingComments = loadingComments.has(post.id)
                
                return (
                  <>
                    <tr key={post.id} className="hover:bg-zinc-800/30">
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleExpanded(post.id)}
                            className="p-1 text-zinc-500 hover:text-white transition-colors mt-0.5"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          {url ? (
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group flex-1"
                            >
                              <p className="font-medium text-white truncate max-w-xs group-hover:text-orange-400 transition-colors flex items-center gap-1">
                                {post.title}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </p>
                              <p className="text-xs text-zinc-500 truncate max-w-xs group-hover:text-zinc-400">/{post.slug}</p>
                            </a>
                          ) : (
                            <div className="flex-1">
                              <p className="font-medium text-white truncate max-w-xs">{post.title}</p>
                              <p className="text-xs text-zinc-500 truncate max-w-xs">/{post.slug}</p>
                            </div>
                          )}
                        </div>
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
                    <td className="p-4">
                      {(() => {
                        const status = taskStatus[post.id]
                        if (!status) return <span className="text-xs text-zinc-600">—</span>
                        
                        const lastUpdate = status.lastUpdated 
                          ? new Date(status.lastUpdated).toLocaleDateString() 
                          : 'unknown'
                        
                        if (status.done === status.total) {
                          return (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400" title={`Last updated: ${lastUpdate}`}>
                              ✓ {status.total} fixed
                            </span>
                          )
                        } else if (status.done > 0) {
                          return (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400" title={`Last updated: ${lastUpdate}`}>
                              {status.done}/{status.total} fixed
                            </span>
                          )
                        } else {
                          return (
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                              {status.total} open
                            </span>
                          )
                        }
                      })()}
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
                          className={`p-2 rounded-lg transition-colors ${
                            reviewedPosts.has(post.id)
                              ? 'text-green-400 bg-green-500/20'
                              : 'text-zinc-400 hover:text-green-400 hover:bg-zinc-800'
                          }`}
                          title={reviewedPosts.has(post.id) ? 'Reviewed' : 'Mark as reviewed'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ post, url: url || '' })}
                          className="relative p-2 text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Add comment"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {taskStatus[post.id] && taskStatus[post.id].total > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full px-1">
                              {taskStatus[post.id].total}
                            </span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Comment History */}
                  {isExpanded && (
                    <tr key={`${post.id}-expanded`}>
                      <td colSpan={7} className="p-0 bg-zinc-800/20">
                        <div className="p-6 border-t border-zinc-700/50">
                          <h4 className="text-sm font-medium text-white mb-4">Comment History</h4>
                          {isLoadingComments ? (
                            <div className="text-sm text-zinc-500 py-4">Loading comments...</div>
                          ) : comments.length === 0 ? (
                            <div className="text-sm text-zinc-500 py-4">No comments or tasks yet.</div>
                          ) : (
                            <div className="space-y-3">
                              {comments.map((comment) => (
                                <div 
                                  key={comment.id} 
                                  className={`p-4 rounded-lg border ${
                                    comment.title.startsWith('✨')
                                      ? 'bg-green-500/5 border-green-500/20'
                                      : 'bg-red-500/5 border-red-500/20'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm font-medium text-white">{comment.title}</p>
                                    <span className="text-xs text-zinc-500">
                                      {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  {comment.description && (
                                    <p className="text-sm text-zinc-400">{comment.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      comment.status === 'done' 
                                        ? 'bg-green-500/20 text-green-400'
                                        : comment.status === 'in_progress'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-zinc-700 text-zinc-400'
                                    }`}>
                                      {comment.status}
                                    </span>
                                    {comment.assigned_to && (
                                      <span className="text-xs text-zinc-500">
                                        Assigned to: {comment.assigned_to}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
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
