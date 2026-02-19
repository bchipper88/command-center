import { supabase, Task } from '@/lib/supabase'
import { TasksClient } from './tasks-client'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false }) as unknown as { data: Task[] | null }

  return <TasksClient initialTasks={tasks || []} />
}
