'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

function extractSoulSection(soul: string | null, section: string): string | null {
  if (!soul) return null
  const regex = new RegExp(`# ${section}\\n([\\s\\S]*?)(?=\\n# |$)`, 'i')
  const match = soul.match(regex)
  return match ? match[1].trim() : null
}

function getSoulPreview(soul: string | null): string {
  if (!soul) return 'No soul defined.'
  // Get first paragraph after # IDENTITY
  const identity = extractSoulSection(soul, 'IDENTITY')
  if (identity) {
    const firstPara = identity.split('\n\n')[0]
    return firstPara.slice(0, 200) + (firstPara.length > 200 ? '...' : '')
  }
  return soul.slice(0, 200) + '...'
}

export function AgentsClient({ agents }: Props) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
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
              tier === 'command' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
            }`}>
              {tierAgents.map(agent => {
                const status = statusConfig[agent.status || 'idle']
                
                return (
                  <Card 
                    key={agent.id} 
                    className={`glass-card bg-transparent border-white/5 hover:border-white/10 transition-all cursor-pointer ${
                      tier === 'command' ? 'border-red-500/20' : ''
                    }`}
                    onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`${tier === 'command' ? 'w-20 h-20' : 'w-16 h-16'} rounded-full overflow-hidden bg-white/5 flex-shrink-0`}>
                          {agent.avatar?.startsWith('http') ? (
                            <img 
                              src={agent.avatar} 
                              alt={agent.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${tier === 'command' ? 'text-4xl' : 'text-3xl'}`}>
                              {agent.avatar || '🤖'}
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold ${tier === 'command' ? 'text-xl text-red-400' : 'text-lg text-white'}`}>
                              {agent.name}
                            </h3>
                            <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${status.dot}`}></span>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                            <span className="font-medium">{agent.codename}</span>
                            {agent.site_id && (
                              <>
                                <span className="text-neutral-600">•</span>
                                <span className="text-neutral-500">{siteLabels[agent.site_id] || agent.site_id}</span>
                              </>
                            )}
                            {agent.source && (
                              <>
                                <span className="text-neutral-600">•</span>
                                <span className="text-neutral-600 text-xs">{agent.source}</span>
                              </>
                            )}
                          </div>
                          
                          <p className="text-sm text-neutral-500 leading-relaxed">
                            {getSoulPreview(agent.soul)}
                          </p>
                          
                          {/* Stats row */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-600">
                            <span>Tasks: <span className="text-neutral-400">{agent.tasks_completed}</span></span>
                            <span>Messages: <span className="text-neutral-400">{agent.messages_sent}</span></span>
                            <span>Last active: <span className="text-neutral-400">{timeAgo(agent.last_active_at)}</span></span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded soul view */}
                      {selectedAgent?.id === agent.id && agent.soul && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <div className="prose prose-invert prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-xs text-neutral-400 bg-black/20 p-4 rounded-lg overflow-x-auto font-mono">
                              {agent.soul}
                            </pre>
                          </div>
                        </div>
                      )}
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
