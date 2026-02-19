'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight, Check, X, Play } from 'lucide-react'
import type { CeoIdea, CeoReview } from './page'

type Props = {
  ideas: CeoIdea[]
  reviews: CeoReview[]
}

const siteConfig: Record<string, { name: string; icon: string; color: string; agentEmoji: string }> = {
  'command-center': { name: 'Command Center', icon: '🎛️', color: 'text-rose-400', agentEmoji: '📋' },
  jurassic: { name: 'Jurassic Apparel', icon: '🦕', color: 'text-red-400', agentEmoji: '🐍' },
  lv: { name: 'Lehigh Valley', icon: '🏔️', color: 'text-blue-400', agentEmoji: '🧣' },
  denver: { name: 'Denver', icon: '🏔️', color: 'text-purple-400', agentEmoji: '🦚' },
  savannah: { name: 'Savannah', icon: '🌳', color: 'text-emerald-400', agentEmoji: '📚' },
}

const statusIcons: Record<string, string> = {
  proposed: '○',
  approved: '◐',
  in_progress: '◑',
  completed: '●',
  rejected: '✗',
}

const priorityDots: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🔵',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Supabase config for client-side updates
const SUPABASE_URL = 'https://heetkfaggxclbwfrmhln.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZXRrZmFnZ3hjbGJ3ZnJtaGxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM2MjM2NCwiZXhwIjoyMDg2OTM4MzY0fQ.gtiZl6zhq6UKgaUmOqdeKxA7ItZBViwssUIjM7XgBc8'

async function updateIdeaStatus(ideaId: string, status: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ceo_ideas?id=eq.${ideaId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ status, updated_at: new Date().toISOString() })
  })
  return res.ok
}

export function ReviewsClient({ ideas, reviews }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const siteParam = searchParams.get('site')
  
  const [showCompleted, setShowCompleted] = useState(false)
  const [expandedIdeas, setExpandedIdeas] = useState<Set<string>>(new Set())
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIdeas(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleStatusChange = async (ideaId: string, newStatus: string) => {
    setUpdatingIds(prev => new Set(prev).add(ideaId))
    const success = await updateIdeaStatus(ideaId, newStatus)
    setUpdatingIds(prev => {
      const next = new Set(prev)
      next.delete(ideaId)
      return next
    })
    if (success) {
      router.refresh()
    }
  }

  // Determine which sites to show
  const directorySites = ['lv', 'denver', 'savannah']
  const visibleSites = siteParam === 'jurassic' 
    ? ['jurassic'] 
    : siteParam === 'directories' 
      ? directorySites 
      : siteParam === 'command-center'
        ? ['command-center']
        : ['command-center', 'jurassic', 'lv', 'denver', 'savannah']

  // Get latest review per site
  const latestReviews = visibleSites.reduce((acc, site) => {
    const siteReviews = reviews.filter(r => r.site_id === site)
    if (siteReviews.length > 0) {
      acc[site] = siteReviews[0]
    }
    return acc
  }, {} as Record<string, CeoReview>)

  // Group ideas by site
  const ideasBySite = visibleSites.reduce((acc, site) => {
    acc[site] = ideas
      .filter(i => i.site_id === site)
      .filter(i => showCompleted || (i.status !== 'completed' && i.status !== 'rejected'))
      .sort((a, b) => {
        const statusOrder = { in_progress: 0, approved: 1, proposed: 2, completed: 3, rejected: 4 }
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
        if (statusDiff !== 0) return statusDiff
        const priorityDiff = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
        if (priorityDiff !== 0) return priorityDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    return acc
  }, {} as Record<string, CeoIdea[]>)

  // Stats
  const totalActive = ideas.filter(i => visibleSites.includes(i.site_id) && i.status !== 'completed' && i.status !== 'rejected').length
  const totalCompleted = ideas.filter(i => visibleSites.includes(i.site_id) && i.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {siteParam === 'jurassic' ? '🦕 Jurassic Reviews' : 
             siteParam === 'directories' ? '📊 Directory Reviews' : 
             siteParam === 'command-center' ? '🎛️ Product Reviews' :
             '📋 CEO Reviews'}
          </h1>
          <p className="text-sm text-neutral-500 font-mono">
            {siteParam === 'command-center' 
              ? 'Percy\'s product reviews and improvement backlog'
              : 'Latest strategic reviews from The Dark Lord\'s Court'}
          </p>
        </div>
      </div>

      {/* Latest Review Narratives */}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleSites.map(siteId => {
          const site = siteConfig[siteId]
          const review = latestReviews[siteId]
          
          if (!site) return null
          
          if (!review) {
            return (
              <Card key={siteId} className="glass-card bg-transparent border-white/5">
                <CardContent className="py-6 px-5 text-center">
                  <span className="text-2xl">{site.icon}</span>
                  <p className="text-neutral-600 text-sm mt-2">No reviews yet for {site.name}</p>
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={siteId} className="glass-card bg-gradient-to-br from-purple-900/10 to-transparent border-purple-500/10">
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{site.agentEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${site.color}`}>{review.agent_name}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-xs text-neutral-500">{site.name}</span>
                      <span className="text-xs text-neutral-600 font-mono ml-auto">{formatDate(review.review_date)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">{review.summary}</p>
                
                {/* Quick Stats */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 text-xs">✓</span>
                    <span className="text-xs text-neutral-500">{review.wins?.length || 0} wins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-xs">!</span>
                    <span className="text-xs text-neutral-500">{review.challenges?.length || 0} challenges</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Ideas Section Header */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white">💡 Ideas Backlog</h2>
          <p className="text-xs text-neutral-500 font-mono">
            {totalActive} active • {totalCompleted} completed
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showCompleted} 
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded bg-neutral-800 border-neutral-700"
          />
          Show completed/rejected
        </label>
      </div>

      {/* Sites with Ideas */}
      <div className="grid gap-6">
        {visibleSites.map(siteId => {
          const site = siteConfig[siteId]
          const siteIdeas = ideasBySite[siteId] || []
          
          if (!site) return null
          
          if (siteIdeas.length === 0) {
            return (
              <Card key={siteId} className="glass-card bg-transparent border-white/5">
                <CardHeader className="py-3 px-4">
                  <CardTitle className={`text-base font-medium flex items-center gap-2 ${site.color}`}>
                    <span>{site.icon}</span>
                    {site.name}
                    <span className="text-neutral-600 text-sm font-normal">(0 ideas)</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            )
          }

          return (
            <Card key={siteId} className="glass-card bg-transparent border-white/5">
              <CardHeader className="py-3 px-4 border-b border-white/5">
                <CardTitle className={`text-base font-medium flex items-center gap-2 ${site.color}`}>
                  <span>{site.icon}</span>
                  {site.name}
                  <span className="text-neutral-600 text-sm font-normal">
                    ({siteIdeas.filter(i => i.status !== 'completed' && i.status !== 'rejected').length} active)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-white/5">
                {siteIdeas.map((idea) => {
                  const isExpanded = expandedIdeas.has(idea.id)
                  const isUpdating = updatingIds.has(idea.id)
                  const isActionable = idea.status === 'proposed'
                  const isInProgress = idea.status === 'in_progress' || idea.status === 'approved'
                  const isDone = idea.status === 'completed' || idea.status === 'rejected'
                  
                  return (
                    <div 
                      key={idea.id} 
                      className={`${isDone ? 'opacity-50' : ''} ${isUpdating ? 'opacity-70' : ''}`}
                    >
                      {/* Main Row */}
                      <div 
                        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => toggleExpanded(idea.id)}
                      >
                        {/* Expand Icon */}
                        <span className="text-neutral-600 w-4">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                        
                        {/* Status */}
                        <span className="text-neutral-500 w-5" title={idea.status}>
                          {statusIcons[idea.status]}
                        </span>
                        
                        {/* Priority */}
                        <span className="w-5" title={idea.priority}>
                          {priorityDots[idea.priority]}
                        </span>
                        
                        {/* Title */}
                        <span className={`flex-1 text-sm ${isDone ? 'line-through text-neutral-500' : 'text-white'}`}>
                          {idea.title}
                          {idea.category && (
                            <span className="ml-2 text-xs text-neutral-600">[{idea.category}]</span>
                          )}
                        </span>
                        
                        {/* Effort */}
                        <span className="text-xs text-neutral-600 w-6 text-right">
                          {idea.effort === 'low' ? '⚡' : idea.effort === 'high' ? '🏗️' : ''}
                        </span>
                        
                        {/* Quick Actions (visible on hover/always for proposed) */}
                        {isActionable && !isUpdating && (
                          <div className="flex gap-1 ml-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleStatusChange(idea.id, 'approved')}
                              className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                              title="Accept → Queue for agent"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(idea.id, 'rejected')}
                              className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        
                        {/* In Progress Actions */}
                        {isInProgress && !isUpdating && (
                          <div className="flex gap-1 ml-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleStatusChange(idea.id, 'in_progress')}
                              className={`p-1 rounded transition-colors ${
                                idea.status === 'in_progress' 
                                  ? 'bg-amber-500/30 text-amber-300' 
                                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                              }`}
                              title="Mark as in progress"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(idea.id, 'completed')}
                              className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                              title="Mark complete"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        
                        {isUpdating && (
                          <span className="text-xs text-neutral-500 ml-2">...</span>
                        )}
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 ml-14 border-l-2 border-white/5">
                          {idea.description ? (
                            <p className="text-sm text-neutral-400 leading-relaxed">{idea.description}</p>
                          ) : (
                            <p className="text-sm text-neutral-600 italic">No description provided.</p>
                          )}
                          
                          <div className="flex gap-4 mt-3 text-xs text-neutral-600">
                            <span>Priority: <span className="text-neutral-400">{idea.priority}</span></span>
                            <span>Effort: <span className="text-neutral-400">{idea.effort}</span></span>
                            <span>Status: <span className="text-neutral-400">{idea.status}</span></span>
                            <span>Added: <span className="text-neutral-400">{formatDate(idea.created_at)}</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Legend */}
      <div className="text-xs text-neutral-600 font-mono flex flex-wrap gap-4">
        <span>○ proposed</span>
        <span>◐ approved (queued)</span>
        <span>◑ in progress</span>
        <span>● completed</span>
        <span>✗ rejected</span>
        <span className="ml-4">🔴 high</span>
        <span>🟡 medium</span>
        <span>🔵 low</span>
        <span className="ml-4">⚡ quick win</span>
        <span>🏗️ major effort</span>
      </div>
    </div>
  )
}
