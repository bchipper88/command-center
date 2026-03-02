import { supabase, PersonalTask, PersonalGoal } from '@/lib/supabase'
import { PersonalTasksClient } from './tasks-client'

export const dynamic = 'force-dynamic'

export default async function PersonalTasksPage() {
  const { data: tasks } = await supabase
    .from('personal_tasks')
    .select('*')
    .order('created_at', { ascending: false }) as unknown as { data: PersonalTask[] | null }

  const { data: goals } = await supabase
    .from('personal_goals')
    .select('id, name, category')
    .eq('status', 'active') as unknown as { data: Pick<PersonalGoal, 'id' | 'name' | 'category'>[] | null }

  return <PersonalTasksClient initialTasks={tasks || []} goals={goals || []} />
}
