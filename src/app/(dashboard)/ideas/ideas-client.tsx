'use client'

import { useState, useEffect } from 'react'
import { supabase, CeoIdea } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Lightbulb, Check, X, RefreshCw } from 'lucide-react'

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
  const [ideas, setIdeas] = useState<CeoIdea[]>(initialIdeas)
  const [filter, setFilter] = useState<string>('proposed')
  const [loading, setLoading] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch fresh data from Supabase
  const fetchIdeas = async () => {
    setRefreshing(true)
    const { data, error } = await supabase
      .from('ceo_ideas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setIdeas(data)
    }
    setRefreshing(false)
  }

  // Initial fetch on mount to ensure fresh data
  useEffect(() => {
    fetchIdeas()
  }, [])

  const filteredIdeas = filter === 'all' 
    ? ideas 
    : ideas.filter(i => i.status === filter)

  const handleApprove = async (idea: CeoIdea) => {
    setLoading(idea.id)
    try {
      // Create a task for the agent in the kanban
      const siteContext = idea.site_id ? ` [${siteNames[idea.site_id] || idea.site_id}]` : ''
      const { error: taskError } = await supabase.from('tasks').insert({
        title: idea.title + siteContext,
        description: idea.description,
        status: 'todo',
        assigned_to: idea.agent_name,
        priority: idea.priority || 'medium',
      })
      
      if (taskError) {
        console.error('Task insert error:', taskError)
        alert(`Failed to create task: ${taskError.message}`)
        setLoading(null)
        return
      }

      // Update idea status to approved
      const { error: updateError } = await supabase
        .from('ceo_ideas')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', idea.id)
      
      if (updateError) {
        console.error('Idea update error:', updateError)
        alert(`Failed to update idea: ${updateError.message}`)
        setLoading(null)
        return
      }
      
      // Immediately update local state
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: 'approved' } : i))
    } catch (err) {
      console.error('Approve error:', err)
      alert(`Error: ${err}`)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setLoading(id)
    try {
      // Delete the idea
      const { error } = await supabase.from('ceo_ideas').delete().eq('id', id)
      
      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete: ${error.message}`)
        setLoading(null)
        return
      }
      
      // Immediately remove from local state
      setIdeas(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Reject error:', err)
      alert(`Error: ${err}`)
    } finally {
      setLoading(null)
    }
  }

  const proposedCount = ideas.filter(i => i.status === 'proposed').length

  // Known agents with avatars
  const agentsWithAvatars = ['bellatrix', 'severus', 'jovie', 'regulus', 'lucius', 'skeeter', 'narcissa', 'andromeda', 'lockhart', 'jarvis', 'varys']
  
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="text-zinc-400 text-sm">
            {proposedCount} ideas waiting for your review
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchIdeas}
          disabled={refreshing}
          className="text-zinc-400 border-zinc-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                  {agentsWithAvatars.includes(idea.agent_name.toLowerCase()) ? (
                    <img
                      src={`/avatars/${idea.agent_name.toLowerCase()}.png`}
                      alt={idea.agent_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 ring-2 ring-zinc-600 flex items-center justify-center text-xs font-bold text-zinc-300">
                      {getInitials(idea.agent_name)}
                    </div>
                  )}
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
                      disabled={loading === idea.id}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {loading === idea.id ? 'Deleting...' : 'Reject'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(idea)}
                      disabled={loading === idea.id}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {loading === idea.id ? 'Saving...' : 'Approve'}
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
