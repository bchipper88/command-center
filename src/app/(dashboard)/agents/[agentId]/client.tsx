'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

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

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
  idle: { label: 'Idle', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30', dot: 'bg-neutral-500' },
  sleeping: { label: 'Sleeping', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-500' },
  summoned: { label: 'Summoned', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500 animate-pulse' },
}

const tierColors: Record<string, string> = {
  command: 'text-red-400',
  ceo: 'text-amber-400',
  operative: 'text-blue-400',
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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function AgentDetailClient({ agent, activities }: { agent: Agent; activities: Activity[] }) {
  const status = statusConfig[agent.status || 'idle']
  const tierColor = tierColors[agent.tier] || 'text-white'
  
  const taskCount = activities.filter(a => a.category === 'task').length
  const messageCount = activities.filter(a => a.category === 'message').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link 
        href="/agents" 
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agents
      </Link>

      {/* Hero section with full photo */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="relative w-full h-[500px] bg-gradient-to-b from-white/5 to-transparent">
          {agent.avatar?.startsWith('http') ? (
            <Image 
              src={agent.avatar} 
              alt={agent.name}
              fill
              className="object-cover object-top"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-9xl">
              {agent.avatar || '🤖'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          {/* Status badge */}
          <Badge variant="outline" className={`absolute top-4 right-4 ${status.color} backdrop-blur-sm`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${status.dot}`}></span>
            {status.label}
          </Badge>
          
          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className={`text-4xl font-bold ${tierColor}`}>{agent.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-lg text-neutral-300">
              <span className="font-medium">{agent.codename}</span>
              <span className="text-neutral-600">•</span>
              <span>{agent.role}</span>
              {agent.site_id && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-400">{siteLabels[agent.site_id] || agent.site_id}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-transparent border-white/10">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-xs font-mono text-neutral-500">TASKS COMPLETED</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{taskCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-transparent border-white/10">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-xs font-mono text-neutral-500">MESSAGES SENT</span>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{messageCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-transparent border-white/10">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-xs font-mono text-neutral-500">LAST ACTIVE</span>
            <div className="text-xl font-bold font-mono text-neutral-300 mt-1">{timeAgo(agent.last_active_at)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Soul section */}
      {agent.soul && (
        <Card className="bg-transparent border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">Soul</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-neutral-400 bg-black/30 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                {agent.soul}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity history */}
      <Card className="bg-transparent border-white/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          {activities.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No activity recorded yet</p>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.category === 'task' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-white">{activity.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0 text-neutral-500">
                        {activity.event_type}
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-neutral-400 mt-1">{activity.description}</p>
                    )}
                    <p className="text-xs text-neutral-600 mt-2">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
