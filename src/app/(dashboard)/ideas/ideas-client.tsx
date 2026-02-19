'use client'

import { useState } from 'react'
import { supabase, CeoIdea } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Lightbulb, Check, X } from 'lucide-react'
import Image from 'next/image'

const statusColors: Record<string, string> = {
  proposed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  implemented: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const siteNames: Record<string, string> = {
  jurassic: 'Jurassic Apparel',
  christmas: 'The Best Christmas',
  lv: 'LV Directory',
  savannah: 'Savannah Directory',
  denver: 'Denver Directory',
  'command-center': 'Command Center',
}

const siteColors: Record<string, string> = {
  jurassic: 'bg-green-500/20 text-green-400',
  christmas: 'bg-red-500/20 text-red-400',
  lv: 'bg-purple-500/20 text-purple-400',
  savannah: 'bg-amber-500/20 text-amber-400',
  denver: 'bg-blue-500/20 text-blue-400',
  'command-center': 'bg-orange-500/20 text-orange-400',
}

export function IdeasClient({ ideas: initialIdeas }: { ideas: CeoIdea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas)
  const [filter, setFilter] = useState<string>('proposed')

  const filteredIdeas = filter === 'all' 
    ? ideas 
    : ideas.filter(i => i.status === filter)

  const handleApprove = async (idea: CeoIdea) => {
    // Create a task for the agent in the kanban
    const siteContext = idea.site_id ? ` [${siteNames[idea.site_id] || idea.site_id}]` : ''
    await supabase.from('tasks').insert({
      title: idea.title + siteContext,
      description: idea.description,
      status: 'todo',
      assigned_to: idea.agent_name,
      priority: idea.priority || 'medium',
    })

    // Update idea status to approved
    await supabase
      .from('ceo_ideas')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', idea.id)
    
    setIdeas(ideas.map(i => i.id === idea.id ? { ...i, status: 'approved' } : i))
  }

  const handleReject = async (id: string) => {
    // Delete the idea
    await supabase.from('ceo_ideas').delete().eq('id', id)
    
    // Remove from local state
    setIdeas(ideas.filter(i => i.id !== id))
  }

  const proposedCount = ideas.filter(i => i.status === 'proposed').length

  const getAvatarUrl = (agentName: string) => {
    const name = agentName.toLowerCase()
    return `/avatars/${name}.png`
  }

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
              <div className="flex items-start gap-4 mb-3">
                {/* Agent Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 ring-2 ring-zinc-600">
                    <Image
                      src={getAvatarUrl(idea.agent_name)}
                      alt={idea.agent_name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials on error
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-white">{idea.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[idea.status]}`}>
                      {idea.status}
                    </span>
                    {idea.site_id && (
                      <span className={`text-xs px-2 py-0.5 rounded ${siteColors[idea.site_id] || 'bg-zinc-700 text-zinc-400'}`}>
                        {siteNames[idea.site_id] || idea.site_id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">{idea.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pl-14">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-400">{idea.agent_name}</span>
                  {idea.category && (
                    <span className="px-2 py-0.5 bg-zinc-800 rounded">
                      {idea.category}
                    </span>
                  )}
                  {idea.priority && (
                    <span className={`px-2 py-0.5 rounded ${
                      idea.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      idea.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>
                      {idea.priority}
                    </span>
                  )}
                </div>

                {idea.status === 'proposed' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(idea.id)}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(idea)}
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
