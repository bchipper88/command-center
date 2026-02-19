"use client"

import { useState, useEffect } from 'react'
import { supabase, Task } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type Status = 'todo' | 'in_progress' | 'blocked' | 'done'
type Priority = 'low' | 'medium' | 'high'

const columns: { id: Status; label: string; color: string; bg: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-zinc-400', bg: 'bg-zinc-800/50' },
  { id: 'in_progress', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-950/30' },
  { id: 'blocked', label: 'Blocked', color: 'text-red-400', bg: 'bg-red-950/30' },
  { id: 'done', label: 'Done', color: 'text-green-400', bg: 'bg-green-950/30' },
]

const priorityColors: Record<Priority, string> = {
  low: 'bg-zinc-600',
  medium: 'bg-yellow-600',
  high: 'bg-red-600',
}

function TaskCard({ task, onDragStart, onEdit, onDelete }: { 
  task: Task
  onDragStart: (e: React.DragEvent, task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-white leading-tight">{task.title}</h4>
        <span className={`${priorityColors[task.priority]} text-xs px-1.5 py-0.5 rounded font-medium`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">@{task.assigned_to}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="text-xs text-zinc-400 hover:text-white px-1">Edit</button>
          <button onClick={() => onDelete(task.id)} className="text-xs text-red-400 hover:text-red-300 px-1">×</button>
        </div>
      </div>
    </div>
  )
}

function Column({ column, tasks, onDragStart, onDrop, onEdit, onDelete }: {
  column: typeof columns[0]
  tasks: Task[]
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDrop: (status: Status) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div
      className={`flex-1 min-w-[260px] ${column.bg} rounded-xl p-4 transition-all ${isDragOver ? 'ring-2 ring-orange-500' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); onDrop(column.id) }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${column.color}`}>{column.label}</h3>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && <p className="text-xs text-zinc-600 text-center py-8">Drop tasks here</p>}
      </div>
    </div>
  )
}

function AddTaskModal({ isOpen, onClose, onSubmit, editingTask }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
  editingTask: Task | null
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('John')
  const [priority, setPriority] = useState<Priority>('medium')
  const [status, setStatus] = useState<Status>('todo')

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setAssignedTo(editingTask.assigned_to)
      setPriority(editingTask.priority)
      setStatus(editingTask.status)
    } else {
      setTitle(''); setDescription(''); setAssignedTo('John'); setPriority('medium'); setStatus('todo')
    }
  }, [editingTask, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ title, description: description || null, assigned_to: assignedTo, priority, status })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 h-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Assigned To</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                <option value="John">John</option>
                <option value="Bellatrix">Bellatrix</option>
                <option value="Severus">Severus</option>
                <option value="Jovie">Jovie</option>
                <option value="Regulus">Regulus</option>
                <option value="Skeeter">Skeeter</option>
                <option value="Molly">Molly</option>
                <option value="Lucius">Lucius</option>
                <option value="Hermione">Hermione</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editingTask ? 'Save' : 'Add Task'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  useEffect(() => {
    const channel = supabase.channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
        if (data) setTasks(data as Task[])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (status: Status) => {
    if (draggedTask && draggedTask.status !== status) {
      const updates: Partial<Task> = { status, updated_at: new Date().toISOString() }
      if (status === 'done') updates.completed_at = new Date().toISOString()
      await supabase.from('tasks').update(updates).eq('id', draggedTask.id)
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (data) setTasks(data as Task[])
    }
    setDraggedTask(null)
  }

  const handleAddOrUpdateTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await supabase.from('tasks').update({ ...taskData, updated_at: new Date().toISOString() }).eq('id', editingTask.id)
    } else {
      await supabase.from('tasks').insert([taskData])
    }
    setEditingTask(null)
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data as Task[])
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await supabase.from('tasks').delete().eq('id', id)
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (data) setTasks(data as Task[])
    }
  }

  const getTasksByStatus = (status: Status) => tasks.filter((t) => t.status === status)
  const stats = { total: tasks.length, todo: getTasksByStatus('todo').length, inProgress: getTasksByStatus('in_progress').length, blocked: getTasksByStatus('blocked').length, done: getTasksByStatus('done').length }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-zinc-400 text-sm">{stats.total} tasks · {stats.done} completed</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setIsModalOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id} className={`${col.bg} rounded-lg p-4`}>
            <p className={`text-2xl font-bold ${col.color}`}>{stats[col.id === 'in_progress' ? 'inProgress' : col.id]}</p>
            <p className="text-sm text-zinc-400">{col.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column key={column.id} column={column} tasks={getTasksByStatus(column.id)}
            onDragStart={handleDragStart} onDrop={handleDrop} onEdit={(task) => { setEditingTask(task); setIsModalOpen(true) }} onDelete={handleDelete} />
        ))}
      </div>

      <AddTaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null) }}
        onSubmit={handleAddOrUpdateTask} editingTask={editingTask} />
    </div>
  )
}
