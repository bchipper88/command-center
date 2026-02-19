'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowRight, Clock, CheckCircle } from 'lucide-react'

type Message = {
  id: string
  sender: string
  recipient: string
  message: string
  priority: string
  read: boolean
  read_at: string | null
  created_at: string
}

type Stats = {
  total: number
  unread: number
  byAgent: Record<string, { sent: number; received: number; unread: number }>
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  normal: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  low: 'bg-neutral-700/20 text-neutral-500 border-neutral-700/30',
}

const agentColors: Record<string, string> = {
  Bellatrix: 'text-red-400',
  Severus: 'text-green-400',
  Jovie: 'text-pink-400',
  Regulus: 'text-amber-400',
  Skeeter: 'text-purple-400',
  Lucius: 'text-blue-400',
  Percy: 'text-cyan-400',
  Hermione: 'text-orange-400',
  Molly: 'text-rose-400',
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function CommsClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/agent-comms')
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || [])
        setStats(data.stats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredMessages = filter
    ? messages.filter(m => m.sender === filter || m.recipient === filter)
    : messages

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-neutral-500">Loading communications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Communications</h1>
          <p className="text-neutral-500 text-sm">Inter-agent messaging and collaboration</p>
        </div>
        {stats && (
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-neutral-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stats.unread}</div>
              <div className="text-xs text-neutral-500">Unread</div>
            </div>
          </div>
        )}
      </div>

      {/* Agent filter chips */}
      {stats?.byAgent && Object.keys(stats.byAgent).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !filter ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {Object.entries(stats.byAgent).map(([agent, agentStats]) => (
            <button
              key={agent}
              onClick={() => setFilter(filter === agent ? null : agent)}
              className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-2 ${
                filter === agent ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
              }`}
            >
              <span className={agentColors[agent] || 'text-white'}>{agent}</span>
              {agentStats.unread > 0 && (
                <span className="bg-amber-500/20 text-amber-400 text-xs px-1.5 rounded-full">
                  {agentStats.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Messages list */}
      <Card className="bg-transparent border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {filter ? `Messages involving ${filter}` : 'Recent Messages'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No messages yet</p>
              <p className="text-sm mt-1">Agents will start communicating as they collaborate</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    msg.read
                      ? 'bg-white/5 border-white/5'
                      : 'bg-amber-500/5 border-amber-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`font-medium ${agentColors[msg.sender] || 'text-white'}`}>
                        {msg.sender}
                      </span>
                      <ArrowRight className="w-3 h-3 text-neutral-600" />
                      <span className={`font-medium ${agentColors[msg.recipient] || 'text-white'}`}>
                        {msg.recipient}
                      </span>
                      <Badge variant="outline" className={priorityColors[msg.priority]}>
                        {msg.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      {msg.read ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-500" />
                      )}
                      {timeAgo(msg.created_at)}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
