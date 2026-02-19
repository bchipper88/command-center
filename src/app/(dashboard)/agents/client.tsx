'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Agent = {
  id: string
  name: string
  codename: string | null
  role: string
  tier: string
  site_id: string | null
  source: string | null
  soul: string | null
  avatar: string | null
  status: string | null
  tasks_completed: number
  messages_sent: number
  last_active_at: string | null
  created_at: string
}

type Activity = {
  id: string
  agent_name: string
  event_type: string
  title: string
  description: string | null
  category: string
  created_at: string
}

type Props = {
  agents: Agent[]
}

const tierConfig: Record<string, { label: string; color: string; border: string }> = {
  command: { label: 'Supreme Command', color: 'text-red-400', border: 'border-red-500/30' },
  ceo: { label: 'Domain Lords', color: 'text-amber-400', border: 'border-amber-500/30' },
  operative: { label: 'Specialized Operatives', color: 'text-blue-400', border: 'border-blue-500/30' },
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
  idle: { label: 'Idle', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30', dot: 'bg-neutral-500' },
  sleeping: { label: 'Sleeping', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-500' },
  summoned: { label: 'Summoned', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500 animate-pulse' },
}

const siteLabels: Record<string, string> = {
  jurassic: 'Jurassic Apparel',
  lv: 'Lehigh Valley',
  denver: 'Denver',
  savannah: 'Savannah',
  christmas: 'Christmas',
}

function timeAgo(date: string | null): string {
  if (!date) return 'Never'
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 604800)}w ago`
}

function getSoulPreview(soul: string | null): string {
  if (!soul) return 'No soul defined.'
  const lines = soul.split('\n').filter(l => l.trim() && !l.startsWith('#'))
  const preview = lines.slice(0, 3).join(' ').trim()
  return preview.slice(0, 200) + (preview.length > 200 ? '...' : '')
}

// Photo Modal Component
function PhotoModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden">
          {agent.avatar?.startsWith('http') ? (
            <Image 
              src={agent.avatar} 
              alt={agent.name}
              fill
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-9xl">
              {agent.avatar || '🤖'}
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
          <p className="text-neutral-400">{agent.codename} • {agent.role}</p>
        </div>
      </div>
    </div>
  )
}

// Activity Modal Component
function ActivityModal({ 
  agent, 
  category,
  activities,
  loading,
  onClose 
}: { 
  agent: Agent
  category: 'task' | 'message'
  activities: Activity[]
  loading: boolean
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-neutral-900 border border-white/10 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">{agent.name}&apos;s {category === 'task' ? 'Tasks' : 'Messages'}</h2>
            <p className="text-sm text-neutral-500">{activities.length} total</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8 text-neutral-500">Loading...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No {category === 'task' ? 'tasks' : 'messages'} yet
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => (
                <div key={activity.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-neutral-400 mt-1">{activity.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {activity.event_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">{timeAgo(activity.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AgentsClient({ agents }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  const [photoModal, setPhotoModal] = useState<Agent | null>(null)
  const [activityModal, setActivityModal] = useState<{ agent: Agent; category: 'task' | 'message' } | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [agentStats, setAgentStats] = useState<Record<string, { tasks: number; messages: number }>>({})

  // Fetch real stats on mount
  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from('agent_activity')
        .select('agent_name, category')
      
      if (data) {
        const stats: Record<string, { tasks: number; messages: number }> = {}
        data.forEach(row => {
          if (!stats[row.agent_name]) {
            stats[row.agent_name] = { tasks: 0, messages: 0 }
          }
          if (row.category === 'task') stats[row.agent_name].tasks++
          else if (row.category === 'message') stats[row.agent_name].messages++
        })
        setAgentStats(stats)
      }
    }
    fetchStats()
  }, [])

  // Fetch activities when modal opens
  useEffect(() => {
    if (!activityModal) return
    
    const { agent, category } = activityModal
    
    async function fetchActivities() {
      setLoadingActivities(true)
      const { data } = await supabase
        .from('agent_activity')
        .select('*')
        .eq('agent_name', agent.name)
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(50)
      
      setActivities(data || [])
      setLoadingActivities(false)
    }
    fetchActivities()
  }, [activityModal])

  // Group agents by tier
  const tiers = ['command', 'ceo', 'operative']
  const grouped = tiers.reduce((acc, tier) => {
    acc[tier] = agents.filter(a => a.tier === tier)
    return acc
  }, {} as Record<string, Agent[]>)

  const filteredTiers = filter ? tiers.filter(t => t === filter) : tiers

  const totalAgents = agents.length
  const activeAgents = agents.filter(a => a.status === 'active').length
  const ceoCount = agents.filter(a => a.tier === 'ceo').length
  const operativeCount = agents.filter(a => a.tier === 'operative').length

  const getAgentStats = (agentName: string) => {
    return agentStats[agentName] || { tasks: 0, messages: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Photo Modal */}
      {photoModal && <PhotoModal agent={photoModal} onClose={() => setPhotoModal(null)} />}
      
      {/* Activity Modal */}
      {activityModal && (
        <ActivityModal 
          agent={activityModal.agent}
          category={activityModal.category}
          activities={activities}
          loading={loadingActivities}
          onClose={() => setActivityModal(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">The Dark Lord&apos;s Court</h1>
        <p className="text-sm text-neutral-500 font-mono">Agents serving the empire</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL AGENTS', value: totalAgents, color: 'text-white' },
          { label: 'ACTIVE NOW', value: activeAgents, color: 'text-emerald-400' },
          { label: 'DOMAIN LORDS', value: ceoCount, color: 'text-amber-400' },
          { label: 'OPERATIVES', value: operativeCount, color: 'text-blue-400' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card bg-transparent border-white/5">
            <CardContent className="pt-4 pb-3 px-4">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">{stat.label}</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === null
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          All ({totalAgents})
        </button>
        {tiers.map(tier => {
          const config = tierConfig[tier]
          const count = grouped[tier]?.length || 0
          return (
            <button
              key={tier}
              onClick={() => setFilter(filter === tier ? null : tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === tier
                  ? `bg-white/10 ${config.color} border ${config.border}`
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Agent cards by tier */}
      {filteredTiers.map(tier => {
        const config = tierConfig[tier]
        const tierAgents = grouped[tier] || []
        if (tierAgents.length === 0) return null
        
        return (
          <div key={tier} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-mono tracking-wider uppercase ${config.color}`}>
                {config.label}
              </h2>
              <span className="text-xs text-neutral-600">({tierAgents.length})</span>
            </div>
            
            <div className={`grid gap-4 ${
              tier === 'command' ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {tierAgents.map(agent => {
                const status = statusConfig[agent.status || 'idle']
                const stats = getAgentStats(agent.name)
                
                return (
                  <Card 
                    key={agent.id} 
                    className={`glass-card bg-transparent border-white/5 hover:border-white/10 transition-all overflow-hidden ${
                      tier === 'command' ? 'border-red-500/20' : ''
                    }`}
                  >
                    {/* Clickable avatar banner */}
                    <div 
                      className={`relative w-full ${tier === 'command' ? 'h-64' : 'h-48'} bg-gradient-to-b from-white/5 to-transparent cursor-pointer`}
                      onClick={() => setPhotoModal(agent)}
                    >
                      {agent.avatar?.startsWith('http') ? (
                        <Image 
                          src={agent.avatar} 
                          alt={agent.name}
                          fill
                          className="object-cover object-top"
                          unoptimized
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 ${tier === 'command' ? 'text-8xl' : 'text-6xl'}`}>
                          {agent.avatar || '🤖'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <Badge variant="outline" className={`absolute top-3 right-3 text-[10px] ${status.color} backdrop-blur-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${status.dot}`}></span>
                        {status.label}
                      </Badge>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className={`font-bold ${tier === 'command' ? 'text-2xl text-red-400' : 'text-xl text-white'}`}>
                          {agent.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                          <span className="font-medium">{agent.codename}</span>
                          {agent.site_id && (
                            <>
                              <span className="text-neutral-500">•</span>
                              <span className="text-neutral-400">{siteLabels[agent.site_id] || agent.site_id}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                        {getSoulPreview(agent.soul)}
                      </p>
                      
                      {/* Clickable stats row */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-neutral-600">
                        <button 
                          onClick={() => setActivityModal({ agent, category: 'task' })}
                          className="hover:text-amber-400 transition-colors"
                        >
                          Tasks: <span className="text-neutral-400">{stats.tasks}</span>
                        </button>
                        <button 
                          onClick={() => setActivityModal({ agent, category: 'message' })}
                          className="hover:text-blue-400 transition-colors"
                        >
                          Messages: <span className="text-neutral-400">{stats.messages}</span>
                        </button>
                        <span>{timeAgo(agent.last_active_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
