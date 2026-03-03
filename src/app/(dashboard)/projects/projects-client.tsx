"use client"

import { useState, useEffect } from 'react'
import { supabase, Project, ProjectTask } from '@/lib/supabase'
import { ChevronDown, ChevronRight, Plus, CheckCircle2, Circle, Clock } from 'lucide-react'

type ProjectStatus = 'planning' | 'in_progress' | 'blocked' | 'completed'
type TaskStatus = 'todo' | 'in_progress' | 'done'

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  planning: { label: 'Planning', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  blocked: { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-500/20' },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-zinc-400' },
  medium: { label: 'Medium', color: 'text-yellow-400' },
  high: { label: 'High', color: 'text-red-400' },
}

const taskStatusIcons: Record<TaskStatus, typeof Circle> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
}

function ProjectCard({ 
  project, 
  tasks, 
  isExpanded, 
  onToggle,
  onTaskStatusChange,
  onStatusChange
}: { 
  project: Project
  tasks: ProjectTask[]
  isExpanded: boolean
  onToggle: () => void
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void
  onStatusChange: (projectId: string, status: ProjectStatus) => void
}) {
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const status = statusConfig[project.status]
  const priority = priorityConfig[project.priority]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div 
        className="p-5 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button className="mt-1 text-zinc-400 hover:text-white transition-colors">
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg text-white">{project.name}</h3>
                {project.site_id && (
                  <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                    {project.site_id}
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-zinc-400 mb-3">{project.description}</p>
              )}
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <span className={`text-xs ${priority.color}`}>
                  {priority.label} Priority
                </span>
                <span className="text-xs text-zinc-500">
                  {completedTasks}/{totalTasks} tasks
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{progress}%</span>
            </div>
            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-zinc-800 p-5 bg-zinc-950/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-zinc-300">Tasks</h4>
            <select
              value={project.status}
              onChange={(e) => onStatusChange(project.id, e.target.value as ProjectStatus)}
              onClick={(e) => e.stopPropagation()}
              className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => {
              const Icon = taskStatusIcons[task.status]
              const isComplete = task.status === 'done'
              return (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const nextStatus: TaskStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo'
                      onTaskStatusChange(task.id, nextStatus)
                    }}
                    className={`${isComplete ? 'text-green-400' : task.status === 'in_progress' ? 'text-blue-400' : 'text-zinc-500'} hover:text-white transition-colors`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                  <span className={`flex-1 text-sm ${isComplete ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                    {task.title}
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => {
                      e.stopPropagation()
                      onTaskStatusChange(task.id, e.target.value as TaskStatus)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              )
            })}
            {tasks.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No tasks yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function ProjectsClient({ 
  initialProjects, 
  initialTasks 
}: { 
  initialProjects: Project[]
  initialTasks: ProjectTask[]
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')

  // Refresh data on mount
  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('project_tasks').select('*').order('sort_order', { ascending: true })
      ])
      if (projectsRes.data) setProjects(projectsRes.data as Project[])
      if (tasksRes.data) setTasks(tasksRes.data as ProjectTask[])
    }
    fetchData()
  }, [])

  // Real-time subscriptions
  useEffect(() => {
    const projectsChannel = supabase.channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, async () => {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        if (data) setProjects(data as Project[])
      })
      .subscribe()

    const tasksChannel = supabase.channel('project_tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks' }, async () => {
        const { data } = await supabase.from('project_tasks').select('*').order('sort_order', { ascending: true })
        if (data) setTasks(data as ProjectTask[])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(tasksChannel)
    }
  }, [])

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    const updates: Partial<ProjectTask> = { status }
    if (status === 'done') {
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed_at = null
    }
    await supabase.from('project_tasks').update(updates).eq('id', taskId)
    const { data } = await supabase.from('project_tasks').select('*').order('sort_order', { ascending: true })
    if (data) setTasks(data as ProjectTask[])
  }

  const handleProjectStatusChange = async (projectId: string, status: ProjectStatus) => {
    await supabase.from('projects').update({ status, updated_at: new Date().toISOString() }).eq('id', projectId)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) setProjects(data as Project[])
  }

  const getTasksForProject = (projectId: string) => tasks.filter(t => t.project_id === projectId)
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter)

  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    blocked: projects.filter(p => p.status === 'blocked').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-zinc-400 text-sm">
            {stats.total} projects · {completedTasks}/{totalTasks} tasks completed
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { key: 'planning', ...statusConfig.planning, count: stats.planning },
          { key: 'in_progress', ...statusConfig.in_progress, count: stats.inProgress },
          { key: 'blocked', ...statusConfig.blocked, count: stats.blocked },
          { key: 'completed', ...statusConfig.completed, count: stats.completed },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(filter === stat.key ? 'all' : stat.key as ProjectStatus)}
            className={`${stat.bg} rounded-lg p-4 text-left transition-all ${filter === stat.key ? 'ring-2 ring-orange-500' : 'hover:opacity-80'}`}
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-sm text-zinc-400">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            tasks={getTasksForProject(project.id)}
            isExpanded={expandedProjects.has(project.id)}
            onToggle={() => toggleProject(project.id)}
            onTaskStatusChange={handleTaskStatusChange}
            onStatusChange={handleProjectStatusChange}
          />
        ))}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            {filter === 'all' ? 'No projects yet' : `No ${statusConfig[filter].label.toLowerCase()} projects`}
          </div>
        )}
      </div>
    </div>
  )
}
