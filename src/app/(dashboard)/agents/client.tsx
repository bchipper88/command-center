'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Agent = {
  id: string
  name: string
  description: string | null
  schedule: string | null
  enabled: boolean
  last_run_at: string | null
  next_run_at: string | null
  last_status: string | null
  last_duration_ms: number | null
  consecutive_errors: number
  payload_preview: string | null
  updated_at: string
}

type Props = {
  agents: Agent[]
}

// Categorize agents by their purpose
function categorizeAgent(name: string): string {
  if (name.includes('blog') || name.includes('content')) return 'content'
  if (name.includes('seo') || name.includes('gsc') || name.includes('rank')) return 'seo'
  if (name.includes('directory') || name.includes('business') || name.includes('subcategory')) return 'directories'
  if (name.includes('dino') || name.includes('jurassic') || name.includes('shopify')) return 'jurassic'
  if (name.includes('job') || name.includes('saas') || name.includes('research')) return 'research'
  if (name.includes('briefing') || name.includes('checkin') || name.includes('productivity') || name.includes('goals') || name.includes('review')) return 'productivity'
  if (name.includes('security') || name.includes('audit') || name.includes('update')) return 'system'
  return 'other'
}

const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  content: { label: 'Content Creation', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', icon: '📝' },
  seo: { label: 'SEO & Analytics', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: '🔍' },
  directories: { label: 'Directory Sites', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', icon: '🗂️' },
  jurassic: { label: 'Jurassic Apparel', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', icon: '🦕' },
  research: { label: 'Research & Ideas', color: 'text-pink-400 border-pink-500/30 bg-pink-500/10', icon: '💡' },
  productivity: { label: 'Productivity', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10', icon: '⚡' },
  system: { label: 'System & Security', color: 'text-red-400 border-red-500/30 bg-red-500/10', icon: '🔒' },
  other: { label: 'Other', color: 'text-neutral-400 border-neutral-500/30 bg-neutral-500/10', icon: '⚙️' },
}

function parseSchedule(schedule: string | null): string {
  if (!schedule) return 'No schedule'
  
  // Handle "every Xh" or "every Xd"
  if (schedule.startsWith('every ')) {
    const match = schedule.match(/every (\d+)([hd])/)
    if (match) {
      const [, num, unit] = match
      return `Every ${num}${unit === 'h' ? ' hours' : ' days'}`
    }
    return schedule
  }
  
  // Handle cron expressions
  if (schedule.includes('cron ')) {
    const parts = schedule.replace('cron ', '').split(' ')
    const [min, hour, dayMonth, month, dayWeek] = parts
    
    // Parse time
    const hourNum = parseInt(hour)
    const minNum = parseInt(min)
    const time = `${hourNum > 12 ? hourNum - 12 : hourNum || 12}:${minNum.toString().padStart(2, '0')} ${hourNum >= 12 ? 'PM' : 'AM'}`
    
    // Determine frequency
    if (dayWeek === '0') return `Sundays @ ${time}`
    if (dayWeek === '1') return `Mondays @ ${time}`
    if (dayMonth === '1') return `1st of month @ ${time}`
    if (dayMonth === '*' && month === '*' && dayWeek === '*') return `Daily @ ${time}`
    
    return `${time} MT`
  }
  
  return schedule
}

function getStatusConfig(status: string | null, errors: number) {
  if (errors > 0) return { label: 'Error', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  switch (status) {
    case 'ok': return { label: 'OK', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    case 'idle': return { label: 'Idle', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' }
    case 'running': return { label: 'Running', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    default: return { label: status || 'Unknown', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' }
  }
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

function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function AgentsClient({ agents }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  
  // Group agents by category
  const grouped = agents.reduce((acc, agent) => {
    const category = categorizeAgent(agent.name)
    if (!acc[category]) acc[category] = []
    acc[category].push(agent)
    return acc
  }, {} as Record<string, Agent[]>)

  const categories = Object.keys(grouped).sort((a, b) => {
    const order = ['productivity', 'content', 'jurassic', 'directories', 'seo', 'research', 'system', 'other']
    return order.indexOf(a) - order.indexOf(b)
  })

  const filteredCategories = filter ? categories.filter(c => c === filter) : categories

  const totalAgents = agents.length
  const enabledAgents = agents.filter(a => a.enabled).length
  const okAgents = agents.filter(a => a.last_status === 'ok').length
  const errorAgents = agents.filter(a => a.consecutive_errors > 0).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agents Overview</h1>
        <p className="text-sm text-neutral-500 font-mono">All automated tasks and scheduled jobs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL AGENTS', value: totalAgents, color: 'text-white' },
          { label: 'ENABLED', value: enabledAgents, color: 'text-emerald-400' },
          { label: 'HEALTHY', value: okAgents, color: 'text-blue-400' },
          { label: 'ERRORS', value: errorAgents, color: errorAgents > 0 ? 'text-red-400' : 'text-neutral-600' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card bg-transparent border-white/5">
            <CardContent className="pt-4 pb-3 px-4">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">{stat.label}</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category filters */}
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
        {categories.map(cat => {
          const config = categoryConfig[cat]
          const count = grouped[cat].length
          return (
            <button
              key={cat}
              onClick={() => setFilter(filter === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === cat
                  ? `${config.color} border`
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{config.icon}</span>
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Agent cards by category */}
      {filteredCategories.map(category => {
        const config = categoryConfig[category]
        const categoryAgents = grouped[category]
        
        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <h2 className="text-sm font-mono text-neutral-400 tracking-wider uppercase">{config.label}</h2>
              <span className="text-xs text-neutral-600">({categoryAgents.length})</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryAgents.map(agent => {
                const status = getStatusConfig(agent.last_status, agent.consecutive_errors)
                
                return (
                  <Card 
                    key={agent.id} 
                    className={`glass-card bg-transparent border-white/5 hover:border-white/10 transition-all ${
                      !agent.enabled ? 'opacity-50' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {formatName(agent.name)}
                          </h3>
                          <p className="text-xs text-neutral-500 font-mono mt-0.5">
                            {parseSchedule(agent.schedule)}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] shrink-0 ${status.color}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-600">Last run</span>
                        <span className="text-neutral-400 font-mono">
                          {timeAgo(agent.last_run_at)}
                        </span>
                      </div>
                      
                      {agent.last_duration_ms && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-neutral-600">Duration</span>
                          <span className="text-neutral-400 font-mono">
                            {agent.last_duration_ms > 60000 
                              ? `${(agent.last_duration_ms / 60000).toFixed(1)}m`
                              : `${(agent.last_duration_ms / 1000).toFixed(1)}s`
                            }
                          </span>
                        </div>
                      )}
                      
                      {agent.consecutive_errors > 0 && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-red-600">Errors</span>
                          <span className="text-red-400 font-mono">
                            {agent.consecutive_errors} consecutive
                          </span>
                        </div>
                      )}
                      
                      {!agent.enabled && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Disabled</span>
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
