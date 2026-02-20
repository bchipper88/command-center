'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AgentDetailClient } from './client'

type Activity = Parameters<typeof AgentDetailClient>[0]['activities'][0]

export default function AgentPage() {
  const params = useParams()
  const agentId = params.agentId as string

  const [agent, setAgent] = useState<Parameters<typeof AgentDetailClient>[0]['agent'] | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!agentId) return

    supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()
      .then(async ({ data: agentData }) => {
        if (!agentData) { setNotFound(true); setLoading(false); return }
        setAgent(agentData)

        // Fetch activity log entries
        const { data: activityRows } = await supabase
          .from('agent_activity')
          .select('*')
          .eq('agent_name', agentData.name)
          .order('created_at', { ascending: false })
          .limit(30)

        // Fetch CEO reviews as activity
        const { data: reviewRows } = await supabase
          .from('ceo_reviews')
          .select('id, agent_name, review_date, summary, created_at')
          .eq('agent_name', agentData.name)
          .order('created_at', { ascending: false })
          .limit(10)

        // Merge and normalise
        const activityItems: Activity[] = [
          ...(activityRows || []),
          ...(reviewRows || []).map((r) => ({
            id: r.id,
            agent_name: r.agent_name,
            event_type: 'ceo_review',
            title: `Weekly CEO Review — ${r.review_date}`,
            description: r.summary?.slice(0, 200) ?? null,
            category: 'task',
            created_at: r.created_at,
          })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setActivities(activityItems)
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
