import { supabase, PersonalGoal, GoalMilestone, GoalSnapshot } from '@/lib/supabase'
import { GoalsClient } from './goals-client'

export const dynamic = 'force-dynamic'

export default async function PersonalGoalsPage() {
  const { data: goals } = await supabase
    .from('personal_goals')
    .select('*')
    .eq('status', 'active')
    .order('created_at') as unknown as { data: PersonalGoal[] | null }

  const { data: milestones } = await supabase
    .from('goal_milestones')
    .select('*')
    .order('sort_order') as unknown as { data: GoalMilestone[] | null }

  // Get latest snapshots for each goal
  const { data: snapshots } = await supabase
    .from('goal_snapshots')
    .select('*')
    .order('date', { ascending: false }) as unknown as { data: GoalSnapshot[] | null }

  return (
    <GoalsClient 
      initialGoals={goals || []} 
      initialMilestones={milestones || []}
      initialSnapshots={snapshots || []}
    />
  )
}
