'use client';

import { useState, useEffect, useCallback } from 'react';

// ============ TYPES ============
interface Task {
  id: string;
  text: string;
  priority: 'P0' | 'P1' | 'P2';
  done: boolean;
  assignee?: string;
  category?: string;
}

interface Initiative {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  blockers?: string | null;
  nextSteps: string[];
  repo?: string;
  lastActivity?: string;
}

interface ActivityEntry {
  id?: string;
  time: string;
  text: string;
  type: string;
  category?: string;
}

interface AgentStatus {
  online: boolean;
  currentTask?: string;
  sessionStart?: string;
  tokensUsed?: number;
}

interface Session {
  id: string;
  label?: string;
  channel?: string;
  lastMessage?: string;
  lastActivity?: string;
  messageCount?: number;
}

// ============ COMPONENTS ============

function StatusHeader({ agentStatus, time }: { agentStatus: AgentStatus; time: Date }) {
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { 
    hour12: false, timeZone: 'America/Denver', hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { 
    timeZone: 'America/Denver', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <header className="cyber-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-wider">
            <span className="text-[var(--accent-cyan)]">WAR</span>
            <span className="text-[var(--text-muted)]"> // </span>
            <span className="text-[var(--accent-magenta)]">ROOM</span>
          </h1>
          <p className="text-[var(--text-muted)] font-mono text-sm mt-1">{formatDate(time)}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono text-[var(--accent-cyan)]">{formatTime(time)}</div>
          <div className="flex items-center gap-2 justify-end mt-2">
            <div className={`w-2 h-2 rounded-full ${agentStatus.online ? 'bg-[var(--accent-green)] animate-pulse' : 'bg-[var(--text-muted)]'}`}></div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Bellatrix {agentStatus.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ActiveNowPanel({ agentStatus, currentTasks }: { agentStatus: AgentStatus; currentTasks: Task[] }) {
  const activeTasks = currentTasks.filter(t => !t.done && t.assignee === 'Bellatrix').slice(0, 3);
  
  return (
    <div className="cyber-card p-6 border-l-4 border-[var(--accent-green)]">
      <h2 className="text-lg font-mono text-[var(--accent-green)] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse"></span>
        ACTIVE NOW
      </h2>
      
      {agentStatus.currentTask ? (
        <div className="bg-[var(--bg-elevated)] p-4 rounded mb-4">
          <div className="text-sm text-[var(--text-muted)] mb-1">Currently working on:</div>
          <div className="text-[var(--text-primary)] font-mono">{agentStatus.currentTask}</div>
        </div>
      ) : (
        <div className="bg-[var(--bg-elevated)] p-4 rounded mb-4 text-[var(--text-muted)] text-sm">
          Awaiting instructions...
        </div>
      )}

      {activeTasks.length > 0 && (
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider">Bellatrix&apos;s Queue</div>
          {activeTasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 text-sm py-1">
              <span className="text-[var(--accent-cyan)]">→</span>
              <span className="text-[var(--text-primary)]">{task.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityLog({ entries, onAdd }: { entries: ActivityEntry[]; onAdd: (text: string, type: string) => void }) {
  const [newEntry, setNewEntry] = useState('');
  const [newType, setNewType] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.trim()) {
      onAdd(newEntry.trim(), newType);
      setNewEntry('');
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      code: '💻', design: '🎨', deploy: '🚀', fix: '🔧', research: '🔍',
      email: '📧', meeting: '📞', planning: '📋', general: '✨'
    };
    return icons[type] || '✨';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      code: 'var(--accent-cyan)', deploy: 'var(--accent-green)', fix: 'var(--accent-amber)',
      design: 'var(--accent-magenta)', research: 'var(--accent-cyan)'
    };
    return colors[type] || 'var(--text-muted)';
  };

  // Group by hour
  const grouped = entries.reduce((acc, entry) => {
    const hour = entry.time.split(':')[0] + ':00';
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(entry);
    return acc;
  }, {} as Record<string, ActivityEntry[]>);

  return (
    <div className="space-y-4">
      {/* Add entry form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={newEntry} 
          onChange={(e) => setNewEntry(e.target.value)} 
          placeholder="Log activity..."
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none" 
        />
        <select 
          value={newType} 
          onChange={(e) => setNewType(e.target.value)}
          className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-2 py-2 text-xs font-mono text-[var(--text-primary)]"
        >
          <option value="general">General</option>
          <option value="code">Code</option>
          <option value="deploy">Deploy</option>
          <option value="fix">Fix</option>
          <option value="design">Design</option>
          <option value="research">Research</option>
          <option value="planning">Planning</option>
        </select>
        <button type="submit" className="bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)] rounded px-4 py-2 text-xs font-mono text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30">
          LOG
        </button>
      </form>

      {/* Activity entries */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(grouped).reverse().map(([hour, hourEntries]) => (
          <div key={hour}>
            <div className="text-xs font-mono text-[var(--text-muted)] mb-2 sticky top-0 bg-[var(--bg-primary)] py-1">
              {hour}
            </div>
            {hourEntries.map((entry, i) => (
              <div 
                key={entry.id || i} 
                className="flex gap-3 py-2 border-l-2 pl-3 ml-2 hover:bg-[var(--bg-elevated)]/50"
                style={{ borderColor: getTypeColor(entry.type) }}
              >
                <span className="text-sm shrink-0">{getTypeIcon(entry.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-primary)]">{entry.text}</div>
                  <div className="text-xs text-[var(--text-muted)]">{entry.time}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-8">
            No activity logged today. Start working!
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectsPanel({ initiatives, onUpdate }: { 
  initiatives: Initiative[]; 
  onUpdate: (id: string, updates: Partial<Initiative>) => void;
}) {
  const getStatusColor = (status: string) => {
    if (status === 'active') return 'var(--accent-green)';
    if (status === 'completed') return 'var(--accent-cyan)';
    return 'var(--accent-amber)';
  };

  const activeProjects = initiatives.filter(i => i.status === 'active');
  const pausedProjects = initiatives.filter(i => i.status === 'paused');

  return (
    <div className="space-y-4">
      {/* Active Projects */}
      {activeProjects.map((project) => (
        <div 
          key={project.id} 
          className="bg-[var(--bg-elevated)] p-4 rounded border-l-4"
          style={{ borderColor: getStatusColor(project.status) }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-lg text-[var(--text-primary)]">{project.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono" style={{ color: getStatusColor(project.status) }}>
                {project.progress}%
              </span>
              <select 
                value={project.status}
                onChange={(e) => onUpdate(project.id, { status: e.target.value as Initiative['status'] })}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs font-mono text-[var(--text-primary)]"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-[var(--bg-primary)] rounded overflow-hidden mb-3">
            <div 
              className="h-full transition-all duration-500" 
              style={{ 
                width: project.progress + '%',
                backgroundColor: getStatusColor(project.status)
              }} 
            />
          </div>
          
          {project.blockers && (
            <div className="mb-3 text-sm text-[var(--accent-pink)] font-mono p-2 bg-[var(--accent-pink)]/10 rounded">
              ⚠ BLOCKED: {project.blockers}
            </div>
          )}
          
          {project.nextSteps.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Next Steps</div>
              {project.nextSteps.map((step, j) => (
                <div key={j} className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--accent-cyan)]">→</span>
                  <span className="text-[var(--text-muted)]">{step}</span>
                </div>
              ))}
            </div>
          )}

          {project.repo && (
            <a 
              href={project.repo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-mono text-[var(--accent-magenta)] hover:underline"
            >
              View Repo →
            </a>
          )}
        </div>
      ))}

      {/* Paused Projects */}
      {pausedProjects.length > 0 && (
        <div className="pt-4 border-t border-[var(--border-color)]">
          <div className="text-xs font-mono text-[var(--text-muted)] mb-3 uppercase tracking-wider">
            Paused ({pausedProjects.length})
          </div>
          {pausedProjects.map((project) => (
            <div 
              key={project.id} 
              className="flex items-center justify-between py-2 px-3 bg-[var(--bg-elevated)]/50 rounded mb-2"
            >
              <span className="text-sm text-[var(--text-muted)]">{project.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-muted)]">{project.progress}%</span>
                <button 
                  onClick={() => onUpdate(project.id, { status: 'active' })}
                  className="text-xs font-mono text-[var(--accent-cyan)] hover:underline"
                >
                  Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {initiatives.length === 0 && (
        <div className="text-center text-[var(--text-muted)] text-sm py-8">
          No projects tracked yet
        </div>
      )}
    </div>
  );
}

function TaskQueue({ tasks, onToggle, onAdd, onDelete }: { 
  tasks: Task[]; 
  onToggle: (id: string) => void;
  onAdd: (text: string, priority: string, assignee: string) => void;
  onDelete: (id: string) => void;
}) {
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('P1');
  const [newAssignee, setNewAssignee] = useState('John');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAdd(newTask.trim(), newPriority, newAssignee);
      setNewTask('');
    }
  };

  const getPriorityClass = (priority: string) => {
    if (priority === 'P0') return 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]';
    if (priority === 'P1') return 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]';
    return 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]';
  };

  const johnTasks = tasks.filter(t => !t.done && t.assignee === 'John');
  const bellatrixTasks = tasks.filter(t => !t.done && t.assignee === 'Bellatrix');
  const completedTasks = tasks.filter(t => t.done);

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center gap-3 p-2 bg-[var(--bg-elevated)] rounded group hover:bg-[var(--bg-elevated)]/80">
      <input 
        type="checkbox" 
        className="w-4 h-4 accent-[var(--accent-green)]" 
        checked={task.done} 
        onChange={() => onToggle(task.id)} 
      />
      <span className={`text-xs font-mono px-2 py-0.5 rounded ${getPriorityClass(task.priority)}`}>
        {task.priority}
      </span>
      <span className={`text-sm flex-1 ${task.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
        {task.text}
      </span>
      <button 
        onClick={() => onDelete(task.id)} 
        className="opacity-0 group-hover:opacity-100 text-[var(--accent-pink)] text-lg font-bold"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Add task form */}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <input 
          type="text" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="Add task..."
          className="flex-1 min-w-48 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none" 
        />
        <select 
          value={newPriority} 
          onChange={(e) => setNewPriority(e.target.value)}
          className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-2 py-2 text-xs font-mono text-[var(--text-primary)]"
        >
          <option value="P0">P0 🔥</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
        <select 
          value={newAssignee} 
          onChange={(e) => setNewAssignee(e.target.value)}
          className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-2 py-2 text-xs font-mono text-[var(--text-primary)]"
        >
          <option value="John">John</option>
          <option value="Bellatrix">Bellatrix</option>
        </select>
        <button 
          type="submit" 
          className="bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)] rounded px-4 py-2 text-xs font-mono text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30"
        >
          ADD
        </button>
      </form>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {/* John's tasks */}
        {johnTasks.length > 0 && (
          <div>
            <div className="text-xs font-mono text-[var(--accent-cyan)] mb-2 uppercase tracking-wider flex items-center gap-2">
              <span>👤</span> John ({johnTasks.length})
            </div>
            <div className="space-y-2">
              {johnTasks.sort((a, b) => a.priority.localeCompare(b.priority)).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Bellatrix's tasks */}
        {bellatrixTasks.length > 0 && (
          <div>
            <div className="text-xs font-mono text-[var(--accent-magenta)] mb-2 uppercase tracking-wider flex items-center gap-2">
              <span>🖤</span> Bellatrix ({bellatrixTasks.length})
            </div>
            <div className="space-y-2">
              {bellatrixTasks.sort((a, b) => a.priority.localeCompare(b.priority)).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
        
        {/* Completed */}
        {completedTasks.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-color)]">
            <div className="text-xs font-mono text-[var(--text-muted)] mb-2">
              ✓ Completed ({completedTasks.length})
            </div>
            {completedTasks.slice(0, 5).map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-4">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}

function RecentSessions({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center text-[var(--text-muted)] text-sm py-4">
        No recent sessions
      </div>
    );
  }

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {sessions.map((session) => (
        <div key={session.id} className="bg-[var(--bg-elevated)] p-3 rounded hover:bg-[var(--bg-elevated)]/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-mono text-[var(--accent-cyan)]">
              {session.label || session.channel || 'Session'}
            </span>
            {session.lastActivity && (
              <span className="text-xs text-[var(--text-muted)]">{formatTime(session.lastActivity)}</span>
            )}
          </div>
          {session.lastMessage && (
            <div className="text-sm text-[var(--text-muted)] truncate">{session.lastMessage}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============ MAIN DASHBOARD ============

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({ online: true });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, initiativesRes, activityRes, sessionsRes, statusRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/initiatives'),
        fetch('/api/accomplishments'),
        fetch('/api/subagents'),
        fetch('/api/agent-status'),
      ]);
      
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (initiativesRes.ok) setInitiatives(await initiativesRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (statusRes.ok) {
        const status = await statusRes.json();
        setAgentStatus(status);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Task handlers
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await fetch('/api/tasks', { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id, done: !task.done }) 
    });
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = async (text: string, priority: string, assignee: string) => {
    const res = await fetch('/api/tasks', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ text, priority, assignee }) 
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
    }
  };

  const handleDeleteTask = async (id: string) => {
    await fetch('/api/tasks?id=' + id, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Activity handlers
  const handleAddActivity = async (text: string, type: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const res = await fetch('/api/accomplishments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type, time })
    });
    
    if (res.ok) {
      const newEntry = await res.json();
      setActivity([...activity, newEntry]);
    }
  };

  // Initiative handlers
  const handleUpdateInitiative = async (id: string, updates: Partial<Initiative>) => {
    await fetch('/api/initiatives', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    setInitiatives(initiatives.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const pendingTaskCount = tasks.filter(t => !t.done).length;

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* HEADER */}
        <StatusHeader agentStatus={agentStatus} time={time} />

        {/* TOP ROW: Active Now + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ActiveNowPanel agentStatus={agentStatus} currentTasks={tasks} />
          </div>
          <div className="lg:col-span-2">
            <div className="cyber-card p-6 h-full">
              <h2 className="text-lg font-mono text-[var(--accent-cyan)] mb-4">
                📋 TODAY&apos;S ACTIVITY LOG
              </h2>
              <ActivityLog entries={activity} onAdd={handleAddActivity} />
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Projects + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-green)] mb-4">
              🚀 PROJECTS
            </h2>
            <ProjectsPanel initiatives={initiatives} onUpdate={handleUpdateInitiative} />
          </div>
          <div className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-amber)] mb-4">
              ✅ TASK QUEUE ({pendingTaskCount})
            </h2>
            <TaskQueue 
              tasks={tasks} 
              onToggle={handleToggleTask} 
              onAdd={handleAddTask} 
              onDelete={handleDeleteTask} 
            />
          </div>
        </div>

        {/* BOTTOM ROW: Recent Sessions */}
        <div className="cyber-card p-6">
          <h2 className="text-lg font-mono text-[var(--accent-magenta)] mb-4">
            💬 RECENT SESSIONS
          </h2>
          <RecentSessions sessions={sessions} />
        </div>

        {/* FOOTER */}
        <footer className="text-center text-[var(--text-muted)] text-sm font-mono py-4">
          ◈ WAR ROOM v1.0 ◈ Powered by Bellatrix 🖤
        </footer>
      </div>
    </div>
  );
}
