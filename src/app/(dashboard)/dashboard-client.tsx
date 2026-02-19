'use client'

import Link from 'next/link'
import { Site, CronJob, ActivityLog } from '@/lib/supabase'
import { AlertTriangle, CheckCircle, Clock, ArrowRight, Lightbulb } from 'lucide-react'

interface DashboardData {
  sites: Site[]
  cronJobs: CronJob[]
  activity: ActivityLog[]
  taskStats: {
    total: number
    blocked: number
    inProgress: number
    highPriority: number
  }
  ideasCount: number
  failedCrons: number
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const { sites, activity, taskStats, ideasCount, failedCrons } = data

  const hasIssues = taskStats.blocked > 0 || failedCrons > 0
  const hasPending = ideasCount > 0 || taskStats.highPriority > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 text-sm">
          {hasIssues ? '⚠️ Some things need attention' : hasPending ? '📋 You have items to review' : '✅ All systems operational'}
        </p>
      </div>

      {/* Action Cards - What needs you */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blocked Tasks */}
        <Link
          href="/tasks?filter=blocked"
          className={`border rounded-xl p-5 transition-colors hover:bg-white/5 ${
            taskStats.blocked > 0 
              ? 'border-red-500/30 bg-red-950/20' 
              : 'border-zinc-700/50 bg-zinc-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className={`w-5 h-5 ${taskStats.blocked > 0 ? 'text-red-400' : 'text-zinc-600'}`} />
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </div>
          <p className={`text-3xl font-bold ${taskStats.blocked > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
            {taskStats.blocked}
          </p>
          <p className="text-sm text-zinc-500">Blocked Tasks</p>
        </Link>

        {/* High Priority Tasks */}
        <Link
          href="/tasks?filter=high"
          className={`border rounded-xl p-5 transition-colors hover:bg-white/5 ${
            taskStats.highPriority > 0 
              ? 'border-orange-500/30 bg-orange-950/20' 
              : 'border-zinc-700/50 bg-zinc-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className={`w-5 h-5 ${taskStats.highPriority > 0 ? 'text-orange-400' : 'text-zinc-600'}`} />
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </div>
          <p className={`text-3xl font-bold ${taskStats.highPriority > 0 ? 'text-orange-400' : 'text-zinc-400'}`}>
            {taskStats.highPriority}
          </p>
          <p className="text-sm text-zinc-500">High Priority</p>
        </Link>

        {/* Ideas to Review */}
        <Link
          href="/ideas"
          className={`border rounded-xl p-5 transition-colors hover:bg-white/5 ${
            ideasCount > 0 
              ? 'border-yellow-500/30 bg-yellow-950/20' 
              : 'border-zinc-700/50 bg-zinc-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Lightbulb className={`w-5 h-5 ${ideasCount > 0 ? 'text-yellow-400' : 'text-zinc-600'}`} />
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </div>
          <p className={`text-3xl font-bold ${ideasCount > 0 ? 'text-yellow-400' : 'text-zinc-400'}`}>
            {ideasCount}
          </p>
          <p className="text-sm text-zinc-500">Ideas to Review</p>
        </Link>

        {/* Failed Crons */}
        <Link
          href="/ops"
          className={`border rounded-xl p-5 transition-colors hover:bg-white/5 ${
            failedCrons > 0 
              ? 'border-red-500/30 bg-red-950/20' 
              : 'border-green-500/30 bg-green-950/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            {failedCrons > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </div>
          <p className={`text-3xl font-bold ${failedCrons > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {failedCrons > 0 ? failedCrons : '✓'}
          </p>
          <p className="text-sm text-zinc-500">{failedCrons > 0 ? 'Failed Crons' : 'Crons Healthy'}</p>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sites Overview */}
        <div className="border border-zinc-700/50 rounded-xl">
          <div className="p-4 border-b border-zinc-700/50 flex items-center justify-between">
            <h2 className="font-semibold">Sites</h2>
            <Link href="/sites" className="text-sm text-orange-400 hover:text-orange-300">View all →</Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {sites.slice(0, 5).map((site) => (
              <div key={site.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{site.name}</p>
                  <p className="text-xs text-zinc-500">{site.domain}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">{site.total_blog_posts || 0} posts</p>
                  {site.total_businesses > 0 && (
                    <p className="text-xs text-zinc-500">{site.total_businesses} listings</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border border-zinc-700/50 rounded-xl">
          <div className="p-4 border-b border-zinc-700/50">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No recent activity</div>
            ) : (
              activity.slice(0, 8).map((item) => (
                <div key={item.id} className="p-4">
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.event_type} • {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Summary Bar */}
      <div className="border border-zinc-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-white">{taskStats.total}</p>
              <p className="text-xs text-zinc-500">Total Tasks</p>
            </div>
            <div className="h-8 w-px bg-zinc-700" />
            <div>
              <p className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</p>
              <p className="text-xs text-zinc-500">In Progress</p>
            </div>
          </div>
          <Link
            href="/tasks"
            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Kanban →
          </Link>
        </div>
      </div>
    </div>
  )
}
