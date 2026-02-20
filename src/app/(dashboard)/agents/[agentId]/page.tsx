'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AgentDetailClient } from './client'

export default function AgentPage() {
  const params = useParams()
  const agentId = params.agentId as string

  const [agent, setAgent] = useState<Parameters<typeof AgentDetailClient>[0]['agent'] | null>(null)
  const [activities, setActivities] = useState<Parameters<typeof AgentDetailClient>[0]['activities']>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!agentId) return
    supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return }
        setAgent(data)
        return supabase
          .from('agent_activity')
          .select('*')
          .eq('agent_name', data.name)
          .order('created_at', { ascending: false })
          .limit(50)
      })
      .then((result) => {
        if (result) setActivities(result.data || [])
        setLoading(false)
      })
  }, [agentId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
        <div className="h-[500px] bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (notFound || !agent) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-neutral-500">Agent not found.</p>
      </div>
    )
  }

  return <AgentDetailClient agent={agent} activities={activities} />
}
