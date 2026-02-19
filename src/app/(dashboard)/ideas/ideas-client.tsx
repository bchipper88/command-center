'use client'

import { useState } from 'react'
import { supabase, CeoIdea } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Lightbulb, ThumbsUp, ThumbsDown, Check, X } from 'lucide-react'

const statusColors: Record<string, string> = {
  proposed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  implemented: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export function IdeasClient({ ideas: initialIdeas }: { ideas: CeoIdea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas)
  const [filter, setFilter] = useState<string>('proposed')

  const filteredIdeas = filter === 'all' 
    ? ideas 
    : ideas.filter(i => i.status === filter)

  const handleRate = async (id: string, status: 'approved' | 'rejected') => {
    await supabase
      .from('ceo_ideas')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    setIdeas(ideas.map(i => i.id === id ? { ...i, status } : i))
  }

  const proposedCount = ideas.filter(i => i.status === 'proposed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="text-zinc-400 text-sm">
            {proposedCount} ideas waiting for your review
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['proposed', 'approved', 'rejected', 'implemented', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'proposed' && proposedCount > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-xs px-1.5 rounded-full">
                {proposedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ideas List */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-12 text-center">
          <Lightbulb className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No ideas in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="border border-zinc-700/50 bg-zinc-800/30 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{idea.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[idea.status]}`}>
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{idea.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>From: {idea.agent_name}</span>
                  {idea.category && <span>Category: {idea.category}</span>}
                  {idea.impact_score && (
                    <span>Impact: {idea.impact_score}/10</span>
                  )}
                  {idea.effort_score && (
                    <span>Effort: {idea.effort_score}/10</span>
                  )}
                </div>

                {idea.status === 'proposed' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRate(idea.id, 'rejected')}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRate(idea.id, 'approved')}
                      className="bg-green-600 hover:bg-green-500"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
