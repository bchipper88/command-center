'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export function AgentsClient() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.from('agents').select('*').order('tier').order('name')
      .then(({ data }) => { 
        if (data) setAgents(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">The Dark Lord&apos;s Court</h1>
          <p className="text-sm text-neutral-500 font-mono">Summoning agents...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

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
              tier === 'command' ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {tierAgents.map(agent => {
                const status = statusConfig[agent.status || 'idle']
                
                return (
                  <Link key={agent.id} href={`/agents/${agent.id}`}>
                    <Card 
                      className={`glass-card bg-transparent border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden ${
                        tier === 'command' ? 'border-red-500/20 hover:border-red-500/40' : ''
                      }`}
                    >
                      {/* Avatar banner */}
                      <div className={`relative w-full ${tier === 'command' ? 'h-64' : 'h-48'} bg-gradient-to-b from-white/5 to-transparent`}>
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
                        
                        {/* Stats row */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-neutral-600">
                          <span>Tasks: <span className="text-amber-400">{agent.tasks_completed ?? 0}</span></span>
                          <span>Messages: <span className="text-blue-400">{agent.messages_sent ?? 0}</span></span>
                          <span>{timeAgo(agent.last_active_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
