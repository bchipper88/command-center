import { supabase, Project, ProjectTask } from '@/lib/supabase'
import { ProjectsClient } from './projects-client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false }) as unknown as { data: Project[] | null }

  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('*')
    .order('sort_order', { ascending: true }) as unknown as { data: ProjectTask[] | null }

  return <ProjectsClient initialProjects={projects || []} initialTasks={tasks || []} />
}
