'use client'

import { useState } from 'react'
import { PersonalTask, PersonalGoal, supabase } from '@/lib/supabase'

const statusColumns = ['todo', 'in_progress', 'done'] as const
const statusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}
const statusColors: Record<string, string> = {
  todo: 'border-neutral-600',
  in_progress: 'border-blue-500',
  done: 'border-green-500',
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
}

const categoryIcons: Record<string, string> = {
  weight: '⚖️',
  business: '💰',
  golf: '⛳',
  health: '❤️',
}

type Props = {
  initialTasks: PersonalTask[]
  goals: Pick<PersonalGoal, 'id' | 'name' | 'category'>[]
}

export function PersonalTasksClient({ initialTasks, goals }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    goal_id: '' as string,
  })

  const getGoalForTask = (goalId: string | null) => {
    if (!goalId) return null
    return goals.find(g => g.id === goalId)
  }

  const moveTask = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from('personal_tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : null
      })
      .eq('id', taskId)

    if (!error) {
      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { ...t, status: newStatus as PersonalTask['status'], completed_at: newStatus === 'done' ? new Date().toISOString() : null }
          : t
      ))
    }
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return

    const { data, error } = await supabase
      .from('personal_tasks')
      .insert({
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        goal_id: newTask.goal_id || null,
        status: 'todo',
      })
      .select()
      .single()

    if (!error && data) {
      setTasks([data as PersonalTask, ...tasks])
      setNewTask({ title: '', description: '', priority: 'medium', goal_id: '' })
      setShowAddModal(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('personal_tasks')
      .delete()
      .eq('id', taskId)

    if (!error) {
      setTasks(tasks.filter(t => t.id !== taskId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-neutral-500 text-sm mt-1">Personal action items toward your goals</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((status) => {
          const columnTasks = tasks.filter(t => t.status === status)
          
          return (
            <div key={status} className={`border-t-2 ${statusColors[status]} bg-white/5 rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{statusLabels[status]}</h3>
                <span className="text-neutral-500 text-sm">{columnTasks.length}</span>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map((task) => {
                  const goal = getGoalForTask(task.goal_id)
                  
                  return (
                    <div
                      key={task.id}
                      className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-white text-sm font-medium">{task.title}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-neutral-400 text-xs mb-2 line-clamp-2">{task.description}</p>
                      )}

                      {/* Goal Tag */}
                      {goal && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mb-3">
                          <span>{categoryIcons[goal.category]}</span>
                          <span>{goal.name}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        {status !== 'todo' && (
                          <button
                            onClick={() => moveTask(task.id, 'todo')}
                            className="text-xs text-neutral-500 hover:text-white transition-colors"
                          >
                            ← To Do
                          </button>
                        )}
                        {status !== 'in_progress' && (
                          <button
                            onClick={() => moveTask(task.id, 'in_progress')}
                            className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            🔄 Start
                          </button>
                        )}
                        {status !== 'done' && (
                          <button
                            onClick={() => moveTask(task.id, 'done')}
                            className="text-xs text-green-500 hover:text-green-400 transition-colors"
                          >
                            ✓ Done
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-xs text-red-500 hover:text-red-400 transition-colors ml-auto"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-neutral-600 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-400 text-sm mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-sm mb-1">Description (optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Any additional details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-1">Goal (optional)</label>
                  <select
                    value={newTask.goal_id}
                    onChange={(e) => setNewTask({ ...newTask, goal_id: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">No goal</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {categoryIcons[goal.category]} {goal.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
