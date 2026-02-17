'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CronJob } from '@/lib/supabase'

function timeAgo(date: string | null) {
  if (!date) return 'never'
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function OpsClient({ cronJobs }: { cronJobs: CronJob[] }) {
  const healthy = cronJobs.filter(j => j.enabled && j.last_status === 'ok').length
  const errored = cronJobs.filter(j => j.last_status === 'error').length
  const disabled = cronJobs.filter(j => !j.enabled).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Operations Center</h1>
        <p className="text-sm text-neutral-500 font-mono">{cronJobs.length} cron jobs registered</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-mono text-neutral-500">HEALTHY</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">{healthy}</p>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-mono text-neutral-500">ERRORED</p>
            <p className="text-2xl font-bold font-mono text-red-400">{errored}</p>
          </CardContent>
        </Card>
        <Card className="glass-card bg-transparent border-white/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-mono text-neutral-500">DISABLED</p>
            <p className="text-2xl font-bold font-mono text-neutral-400">{disabled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cron Jobs List */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">ALL CRON JOBS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {cronJobs.length === 0 ? (
            <p className="text-neutral-600 text-sm font-mono py-4 text-center">No cron jobs synced. Run seed script.</p>
          ) : (
            cronJobs.map(job => (
              <div key={job.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                {/* Status dot */}
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  !job.enabled ? 'bg-neutral-600' :
                  job.last_status === 'ok' ? 'bg-emerald-500' :
                  job.last_status === 'error' ? 'bg-red-500 pulse-dot' :
                  'bg-amber-500'
                }`}></span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{job.name}</span>
                    {!job.enabled && <Badge variant="outline" className="text-[10px] py-0 px-1 border-neutral-600 text-neutral-500">DISABLED</Badge>}
                    {job.consecutive_errors > 0 && (
                      <Badge className="text-[10px] py-0 px-1 bg-red-500/20 text-red-400 border border-red-500/30">
                        {job.consecutive_errors} errors
                      </Badge>
                    )}
                  </div>
                  {job.description && <p className="text-xs text-neutral-500 truncate">{job.description}</p>}
                </div>

                {/* Schedule */}
                <div className="text-right text-xs font-mono text-neutral-500 flex-shrink-0">
                  <p>{job.schedule || '—'}</p>
                  <p className="text-neutral-600">Last: {timeAgo(job.last_run_at)}</p>
                </div>

                {/* Duration */}
                {job.last_duration_ms && (
                  <div className="text-xs font-mono text-neutral-600 flex-shrink-0 w-16 text-right">
                    {job.last_duration_ms > 1000 ? `${(job.last_duration_ms / 1000).toFixed(1)}s` : `${job.last_duration_ms}ms`}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="glass-card bg-transparent border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono text-neutral-400 tracking-wider">SYSTEM HEALTH</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'OpenClaw', value: 'Active', color: 'text-emerald-400' },
              { label: 'Supabase', value: 'Connected', color: 'text-emerald-400' },
              { label: 'Vercel', value: 'Deployed', color: 'text-emerald-400' },
              { label: 'GitHub', value: 'Linked', color: 'text-emerald-400' },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-mono text-neutral-500 mb-1">{item.label}</p>
                <p className={`text-sm font-mono font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
