'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, GitPullRequest, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface PR {
  repo: string
  number: number
  title: string
  author: string
  state: string
  mergeable: boolean | null
  createdAt: string
  url: string
}

const repos = [
  'bchipper88/christmas',
  'bchipper88/lv-directory',
  'bchipper88/savannah-directory',
  'bchipper88/denver-directory',
]

export function PrsClient() {
  const [prs, setPrs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPRs() {
      try {
        const res = await fetch('/api/prs')
        if (!res.ok) throw new Error('Failed to fetch PRs')
        const data = await res.json()
        setPrs(data.prs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchPRs()
  }, [])

  const needsAttention = prs.filter(pr => pr.mergeable === false)
  const readyToMerge = prs.filter(pr => pr.mergeable === true)
  const unknown = prs.filter(pr => pr.mergeable === null)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">PRs to Review</h1>
          <p className="text-zinc-400 text-sm">Loading pull requests...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">PRs to Review</h1>
          <p className="text-red-400 text-sm">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PRs to Review</h1>
        <p className="text-zinc-400 text-sm">{prs.length} open across {repos.length} repos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Needs Attention</span>
          </div>
          <p className="text-3xl font-bold text-white">{needsAttention.length}</p>
        </div>
        <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Ready to Merge</span>
          </div>
          <p className="text-3xl font-bold text-white">{readyToMerge.length}</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-400 text-sm font-medium">Pending Check</span>
          </div>
          <p className="text-3xl font-bold text-white">{unknown.length}</p>
        </div>
      </div>

      {/* PR List */}
      {prs.length === 0 ? (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-12 text-center">
          <GitPullRequest className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No open pull requests</p>
          <p className="text-zinc-600 text-sm">All caught up! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prs.map((pr) => (
            <a
              key={`${pr.repo}-${pr.number}`}
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block border rounded-xl p-4 transition-colors hover:bg-white/5 ${
                pr.mergeable === false 
                  ? 'border-red-500/30 bg-red-950/10' 
                  : pr.mergeable === true
                  ? 'border-green-500/30 bg-green-950/10'
                  : 'border-zinc-700/50 bg-zinc-800/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GitPullRequest className={`w-4 h-4 flex-shrink-0 ${
                      pr.mergeable === false ? 'text-red-400' : 
                      pr.mergeable === true ? 'text-green-400' : 'text-zinc-400'
                    }`} />
                    <span className="font-medium text-white truncate">{pr.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{pr.repo.split('/')[1]}</span>
                    <span>#{pr.number}</span>
                    <span>by {pr.author}</span>
                    <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pr.mergeable === false && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Conflicts</span>
                  )}
                  {pr.mergeable === true && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Ready</span>
                  )}
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
