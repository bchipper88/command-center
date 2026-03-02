'use client'

import { useState } from 'react'
import { PersonalGoal, GoalMilestone, GoalSnapshot } from '@/lib/supabase'

const categoryIcons: Record<string, string> = {
  weight: '⚖️',
  business: '💰',
  golf: '⛳',
  health: '❤️',
}

const categoryColors: Record<string, string> = {
  weight: 'from-green-600/20 to-green-600/5 border-green-500/30',
  business: 'from-yellow-600/20 to-yellow-600/5 border-yellow-500/30',
  golf: 'from-blue-600/20 to-blue-600/5 border-blue-500/30',
  health: 'from-red-600/20 to-red-600/5 border-red-500/30',
}

type Props = {
  initialGoals: PersonalGoal[]
  initialMilestones: GoalMilestone[]
  initialSnapshots: GoalSnapshot[]
}

export function GoalsClient({ initialGoals, initialMilestones, initialSnapshots }: Props) {
  const [goals] = useState(initialGoals)
  const [milestones] = useState(initialMilestones)
  const [snapshots] = useState(initialSnapshots)

  const getLatestSnapshot = (goalId: string) => {
    return snapshots.find(s => s.goal_id === goalId)
  }

  const getGoalMilestones = (goalId: string) => {
    return milestones.filter(m => m.goal_id === goalId)
  }

  const calculateProgress = (goal: PersonalGoal) => {
    if (!goal.current_value || !goal.target_value) return 0
    const current = parseFloat(goal.current_value)
    const target = parseFloat(goal.target_value)
    
    if (goal.category === 'weight') {
      // Weight goes down, so we need inverse calculation
      const start = 220 // Starting weight
      const lost = start - current
      const toLoose = start - target
      return Math.min(100, Math.max(0, (lost / toLoose) * 100))
    }
    
    // For business/golf, progress is current/target
    return Math.min(100, (current / target) * 100)
  }

  const formatValue = (goal: PersonalGoal, value: string | null) => {
    if (!value) return '—'
    if (goal.category === 'weight') return `${value} lbs`
    if (goal.category === 'business') return `$${parseInt(value).toLocaleString()}`
    if (goal.category === 'golf') return value
    return value
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Personal Goals</h1>
          <p className="text-neutral-500 text-sm mt-1">Track your progress toward what matters</p>
        </div>
      </div>

      {/* Reframes Banner */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-purple-400 font-semibold text-sm mb-2">🧠 Remember Your Reframes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="text-neutral-300">
            <span className="text-neutral-500">Diet ≠ restriction →</span> healthy body, healthy kid
          </div>
          <div className="text-neutral-300">
            <span className="text-neutral-500">Business ≠ extra work →</span> freedom + fun process
          </div>
          <div className="text-neutral-300">
            <span className="text-neutral-500">Cardio ≠ torture →</span> heart health + antidepressant
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal)
          const goalMilestones = getGoalMilestones(goal.id)
          const latestSnapshot = getLatestSnapshot(goal.id)
          const achievedCount = goalMilestones.filter(m => m.achieved).length
          
          return (
            <div
              key={goal.id}
              className={`bg-gradient-to-br ${categoryColors[goal.category]} border rounded-lg p-5`}
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categoryIcons[goal.category]}</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">{goal.name}</h2>
                    <p className="text-neutral-400 text-sm">{goal.why}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-400">Progress</span>
                  <span className="text-white font-mono">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Current vs Target */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-neutral-500 text-xs uppercase tracking-wider">Current</div>
                  <div className="text-white text-xl font-bold mt-1">
                    {formatValue(goal, goal.current_value)}
                  </div>
                  {latestSnapshot && (
                    <div className="text-neutral-500 text-xs mt-1">
                      as of {new Date(latestSnapshot.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-neutral-500 text-xs uppercase tracking-wider">Target</div>
                  <div className="text-orange-400 text-xl font-bold mt-1">
                    {formatValue(goal, goal.target_value)}
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {goalMilestones.length > 0 && (
                <div>
                  <div className="text-neutral-400 text-xs uppercase tracking-wider mb-2">
                    Milestones ({achievedCount}/{goalMilestones.length})
                  </div>
                  <div className="space-y-1">
                    {goalMilestones.map((milestone) => (
                      <div 
                        key={milestone.id}
                        className={`flex items-center gap-2 text-sm ${
                          milestone.achieved ? 'text-green-400' : 'text-neutral-400'
                        }`}
                      >
                        <span>{milestone.achieved ? '✅' : '⬜'}</span>
                        <span>{milestone.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Motivation Footer */}
      <div className="text-center py-6 border-t border-white/5">
        <p className="text-neutral-500 text-sm">
          <span className="text-red-400">Not changing = Pain.</span>
          {' '}
          <span className="text-green-400">Changing = Pleasure.</span>
        </p>
      </div>
    </div>
  )
}
