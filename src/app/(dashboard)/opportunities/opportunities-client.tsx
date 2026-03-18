'use client'

import { useState } from 'react'
import { 
  Lightbulb, 
  DollarSign, 
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Clock,
  TrendingUp
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  category: string
  source: string
  source_url: string
  source_quote: string
  pain_score: number
  money_proof_score: number
  edge_score: number
  speed_score: number
  revenue_clarity_score: number
  total_score: number
  status: string
  competitor_notes: string
  estimated_tam: string
  next_action: string
  notes: string
  created_at: string
}

interface Props {
  opportunities: Opportunity[]
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  researching: 'bg-yellow-100 text-yellow-800',
  validated: 'bg-green-100 text-green-800',
  building: 'bg-purple-100 text-purple-800',
  launched: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-gray-100 text-gray-500',
}

const categoryEmoji: Record<string, string> = {
  saas: '💻',
  shopify_app: '🛒',
  content_site: '📝',
  arbitrage: '💰',
  service: '🛠️',
}

function ScoreBar({ label, score, weight, color }: { 
  label: string
  score: number
  weight: string
  color: string 
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 text-gray-500">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-12 text-right font-mono">{score}</span>
      <span className="w-12 text-gray-400 text-xs">({weight})</span>
    </div>
  )
}

function OpportunityCard({ opp, expanded, onToggle }: { 
  opp: Opportunity
  expanded: boolean
  onToggle: () => void 
}) {
  const scoreColor = opp.total_score >= 70 ? 'text-green-600' : 
                     opp.total_score >= 50 ? 'text-yellow-600' : 'text-gray-500'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Card Header - Two rows for mobile */}
      <div 
        className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        {/* Row 1: Title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base flex-shrink-0">{categoryEmoji[opp.category] || '❓'}</span>
          <h3 className="font-medium text-gray-900 text-sm leading-tight">{opp.title}</h3>
        </div>
        {/* Row 2: Status, Time, Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[opp.status]}`}>
              {opp.status}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(opp.created_at).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-lg font-bold ${scoreColor}`}>
              {opp.total_score?.toFixed(1)}
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {/* Description */}
          {opp.description && (
            <p className="text-gray-600 text-sm mb-4">{opp.description}</p>
          )}

          {/* Quick stats */}
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
            <span className="capitalize">{opp.source}</span>
            {opp.estimated_tam && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {opp.estimated_tam}
              </span>
            )}
            <span>{new Date(opp.created_at).toLocaleDateString()}</span>
          </div>

          {/* Score breakdown */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Score Breakdown</h4>
            <div className="space-y-2">
              <ScoreBar label="Pain" score={opp.pain_score || 0} weight="35%" color="bg-red-400" />
              <ScoreBar label="Money" score={opp.money_proof_score || 0} weight="25%" color="bg-green-400" />
              <ScoreBar label="Edge" score={opp.edge_score || 0} weight="20%" color="bg-blue-400" />
              <ScoreBar label="Speed" score={opp.speed_score || 0} weight="15%" color="bg-purple-400" />
              <ScoreBar label="Revenue" score={opp.revenue_clarity_score || 0} weight="5%" color="bg-yellow-400" />
            </div>
          </div>

          {/* Source quote */}
          {opp.source_quote && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Pain Point</h4>
              <blockquote className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                &ldquo;{opp.source_quote}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Competitor notes */}
          {opp.competitor_notes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Competition</h4>
              <p className="text-sm text-gray-600">{opp.competitor_notes}</p>
            </div>
          )}

          {/* Next action */}
          {opp.next_action && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Next Action</h4>
              <p className="text-sm text-blue-600 font-medium">{opp.next_action}</p>
            </div>
          )}

          {/* Notes */}
          {opp.notes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
              <p className="text-sm text-gray-600">{opp.notes}</p>
            </div>
          )}

          {/* Source link */}
          {opp.source_url && (
            <a 
              href={opp.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              View source <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export function OpportunitiesClient({ opportunities }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'time'>('score')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = opportunities
    .filter(opp => {
      if (filter === 'all') return true
      if (filter === 'hot') return opp.total_score >= 70
      if (filter === 'new') return opp.status === 'new'
      if (filter === 'validated') return opp.status === 'validated'
      if (filter === 'building') return opp.status === 'building'
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.total_score || 0) - (a.total_score || 0)
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const stats = {
    total: opportunities.length,
    hot: opportunities.filter(o => o.total_score >= 70).length,
    new: opportunities.filter(o => o.status === 'new').length,
    validated: opportunities.filter(o => o.status === 'validated').length,
    avgScore: opportunities.length > 0 
      ? (opportunities.reduce((sum, o) => sum + (o.total_score || 0), 0) / opportunities.length).toFixed(1)
      : '0',
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Opportunity Tracker
          </h1>
          <p className="text-gray-500 text-sm">Koerner&apos;s hunted opportunities, scored and ranked</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Ideas</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-200 bg-green-50">
          <div className="text-2xl font-bold text-green-600">{stats.hot}</div>
          <div className="text-sm text-green-600">Hot (70+)</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-200 bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-blue-600">New</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-purple-200 bg-purple-50">
          <div className="text-2xl font-bold text-purple-600">{stats.validated}</div>
          <div className="text-sm text-purple-600">Validated</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.avgScore}</div>
          <div className="text-sm text-gray-500">Avg Score</div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        {['all', 'hot', 'new', 'validated', 'building'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === f 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        
        {/* Sort toggle */}
        <div className="ml-auto flex items-center gap-1">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setSortBy('score')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              sortBy === 'score' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            Score
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              sortBy === 'time' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            Recent
          </button>
        </div>
      </div>

      {/* Opportunities list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No opportunities found</p>
            <p className="text-sm">Koerner is hunting...</p>
          </div>
        ) : (
          filtered.map(opp => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              expanded={expandedId === opp.id}
              onToggle={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
