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
  created_at?: string;
}

interface Initiative {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  blockers?: string | null;
  nextSteps: string[];
  repo?: string;
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
}

interface Session {
  id: string;
  label?: string;
  channel?: string;
  lastMessage?: string;
  lastActivity?: string;
  messageCount?: number;
}

interface DayStats {
  tasksCompleted: number;
  tasksCreated: number;
  activityCount: number;
  projectsActive: number;
}

// ============ UTILITY FUNCTIONS ============
const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    code: '💻', design: '🎨', deploy: '🚀', fix: '🔧', research: '🔍',
    email: '📧', meeting: '📞', planning: '📋', general: '✨', build: '🏗️',
    test: '🧪', review: '👁️', write: '✍️', automate: '🤖'
  };
  return icons[type] || '✨';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    code: 'var(--accent-cyan)', deploy: 'var(--accent-green)', fix: 'var(--accent-amber)',
    design: 'var(--accent-magenta)', research: 'var(--accent-cyan)', build: 'var(--accent-green)',
    automate: 'var(--accent-magenta)'
  };
  return colors[type] || 'var(--text-muted)';
};

// ============ COMPONENTS ============

function StatsBar({ stats, time }: { stats: DayStats; time: Date }) {
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { 
    hour12: false, timeZone: 'America/Denver', hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="cyber-card p-4 text-center border-t-2 border-[var(--accent-cyan)]">
        <div className="text-3xl font-mono font-bold text-[var(--accent-cyan)]">{formatTime(time)}</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Mountain Time</div>
      </div>
      <div className="cyber-card p-4 text-center border-t-2 border-[var(--accent-green)]">
        <div className="text-3xl font-mono font-bold text-[var(--accent-green)]">{stats.tasksCompleted}</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Tasks Done</div>
      </div>
      <div className="cyber-card p-4 text-center border-t-2 border-[var(--accent-magenta)]">
        <div className="text-3xl font-mono font-bold text-[var(--accent-magenta)]">{stats.activityCount}</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Activities</div>
      </div>
      <div className="cyber-card p-4 text-center border-t-2 border-[var(--accent-amber)]">
        <div className="text-3xl font-mono font-bold text-[var(--accent-amber)]">{stats.projectsActive}</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Active Projects</div>
      </div>
      <div className="cyber-card p-4 text-center border-t-2 border-[var(--accent-pink)] col-span-2 md:col-span-1">
        <div className="text-3xl font-mono font-bold text-[var(--accent-pink)]">{stats.tasksCreated}</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">New Tasks</div>
      </div>
    </div>
  );
}

function StatusHeader({ agentStatus, time }: { agentStatus: AgentStatus; time: Date }) {
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { 
    timeZone: 'America/Denver', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <header className="cyber-card p-6 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(var(--accent-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--accent-cyan) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-mono font-bold tracking-wider">
            <span className="text-[var(--accent-cyan)] glitch-text">WAR</span>
            <span className="text-[var(--text-muted)]"> // </span>
            <span className="text-[var(--accent-magenta)]">ROOM</span>
          </h1>
          <p className="text-[var(--text-muted)] font-mono text-sm mt-1">{formatDate(time)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3 justify-end">
            <div className={`relative ${agentStatus.online ? 'animate-pulse' : ''}`}>
              <div className={`w-3 h-3 rounded-full ${agentStatus.online ? 'bg-[var(--accent-green)]' : 'bg-[var(--text-muted)]'}`}></div>
              {agentStatus.online && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-[var(--accent-green)] animate-ping opacity-50"></div>
              )}
            </div>
            <span className="text-sm font-mono text-[var(--text-primary)]">
              BELLATRIX {agentStatus.online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          {agentStatus.currentTask && (
            <div className="mt-2 text-xs font-mono text-[var(--accent-cyan)] max-w-xs truncate">
              ▸ {agentStatus.currentTask}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ActiveNowPanel({ agentStatus, currentTasks }: { agentStatus: AgentStatus; currentTasks: Task[] }) {
  const myTasks = currentTasks.filter(t => !t.done && t.assignee === 'Bellatrix').slice(0, 5);
  
  return (
    <div className="cyber-card p-6 border-l-4 border-[var(--accent-green)] h-full">
      <h2 className="text-lg font-mono text-[var(--accent-green)] mb-4 flex items-center gap-2">
        <span className="relative">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] inline-block"></span>
          <span className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--accent-green)] animate-ping"></span>
        </span>
        BELLATRIX STATUS
      </h2>
      
      {agentStatus.currentTask ? (
        <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 p-4 rounded mb-4">
          <div className="text-xs text-[var(--accent-green)] mb-1 uppercase tracking-wider">Currently Executing</div>
          <div className="text-[var(--text-primary)] font-mono text-sm">{agentStatus.currentTask}</div>
        </div>
      ) : (
        <div className="bg-[var(--bg-elevated)] p-4 rounded mb-4">
          <div className="text-[var(--text-muted)] text-sm font-mono flex items-center gap-2">
            <span className="animate-pulse">▸</span> Monitoring... awaiting orders
          </div>
        </div>
      )}

      {myTasks.length > 0 && (
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wider">Task Queue</div>
          <div className="space-y-2">
            {myTasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-2 text-sm group">
                <span className="text-[var(--accent-cyan)] opacity-50 group-hover:opacity-100 transition-opacity">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  task.priority === 'P0' ? 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]' :
                  task.priority === 'P1' ? 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]' :
                  'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
                }`}>{task.priority}</span>
                <span className="text-[var(--text-primary)] truncate">{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myTasks.length === 0 && !agentStatus.currentTask && (
        <div className="text-center py-4">
          <div className="text-[var(--text-muted)] text-sm">Queue empty</div>
          <div className="text-xs text-[var(--accent-cyan)] mt-1">Assign tasks to Bellatrix →</div>
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
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors" 
        />
        <select 
          value={newType} 
          onChange={(e) => setNewType(e.target.value)}
          className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-2 py-2 text-xs font-mono text-[var(--text-primary)]"
        >
          <option value="general">✨ General</option>
          <option value="code">💻 Code</option>
          <option value="deploy">🚀 Deploy</option>
          <option value="fix">🔧 Fix</option>
          <option value="design">🎨 Design</option>
          <option value="research">🔍 Research</option>
          <option value="build">🏗️ Build</option>
          <option value="automate">🤖 Automate</option>
        </select>
        <button type="submit" className="bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)] rounded px-4 py-2 text-xs font-mono text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30 transition-colors">
          LOG
        </button>
      </form>

      {/* Activity entries */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
        {Object.entries(grouped).reverse().map(([hour, hourEntries]) => (
          <div key={hour}>
            <div className="text-xs font-mono text-[var(--accent-cyan)] mb-2 sticky top-0 bg-[var(--bg-primary)] py-1 flex items-center gap-2">
              <span className="w-8 h-px bg-[var(--accent-cyan)]/30"></span>
              {hour}
              <span className="flex-1 h-px bg-[var(--accent-cyan)]/30"></span>
            </div>
            {hourEntries.map((entry, i) => (
              <div 
                key={entry.id || i} 
                className="flex gap-3 py-2 pl-3 ml-4 border-l-2 hover:bg-[var(--bg-elevated)]/30 transition-colors rounded-r"
                style={{ borderColor: getTypeColor(entry.type) }}
              >
                <span className="text-base shrink-0">{getTypeIcon(entry.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-primary)]">{entry.text}</div>
                  <div className="text-xs text-[var(--text-muted)] font-mono">{entry.time}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-12 border-2 border-dashed border-[var(--border-color)] rounded">
            <div className="text-2xl mb-2">📋</div>
            No activity logged today<br/>
            <span className="text-xs text-[var(--accent-cyan)]">Start logging your work above</span>
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
  const getStatusConfig = (status: string) => {
    if (status === 'active') return { color: 'var(--accent-green)', label: 'ACTIVE', icon: '▸' };
    if (status === 'completed') return { color: 'var(--accent-cyan)', label: 'DONE', icon: '✓' };
    return { color: 'var(--accent-amber)', label: 'PAUSED', icon: '⏸' };
  };

  const activeProjects = initiatives.filter(i => i.status === 'active');
  const pausedProjects = initiatives.filter(i => i.status === 'paused');
  const completedProjects = initiatives.filter(i => i.status === 'completed');

  const ProjectCard = ({ project }: { project: Initiative }) => {
    const config = getStatusConfig(project.status);
    
    return (
      <div className="bg-[var(--bg-elevated)] p-4 rounded border-l-4 hover:bg-[var(--bg-elevated)]/80 transition-colors"
           style={{ borderColor: config.color }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-base text-[var(--text-primary)] flex items-center gap-2">
            <span style={{ color: config.color }}>{config.icon}</span>
            {project.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold" style={{ color: config.color }}>
              {project.progress}%
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden mb-3">
          <div 
            className="h-full transition-all duration-700 rounded-full" 
            style={{ 
              width: project.progress + '%',
              backgroundColor: config.color,
              boxShadow: `0 0 10px ${config.color}50`
            }} 
          />
        </div>
        
        {project.blockers && (
          <div className="mb-3 text-xs text-[var(--accent-pink)] font-mono p-2 bg-[var(--accent-pink)]/10 rounded flex items-center gap-2">
            <span>⚠</span>
            <span>{project.blockers}</span>
          </div>
        )}
        
        {project.nextSteps.length > 0 && (
          <div className="space-y-1">
            {project.nextSteps.slice(0, 2).map((step, j) => (
              <div key={j} className="flex items-center gap-2 text-xs">
                <span className="text-[var(--accent-cyan)]">→</span>
                <span className="text-[var(--text-muted)]">{step}</span>
              </div>
            ))}
            {project.nextSteps.length > 2 && (
              <div className="text-xs text-[var(--text-muted)] pl-4">
                +{project.nextSteps.length - 2} more...
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer"
               className="text-xs font-mono text-[var(--accent-magenta)] hover:underline">
              Repo →
            </a>
          )}
          <div className="flex-1"></div>
          <select 
            value={project.status}
            onChange={(e) => onUpdate(project.id, { status: e.target.value as Initiative['status'] })}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs font-mono text-[var(--text-muted)]"
          >
            <option value="active">Active</option>
            <option value="paused">Pause</option>
            <option value="completed">Complete</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {activeProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}

      {pausedProjects.length > 0 && (
        <div className="pt-4 border-t border-[var(--border-color)]">
          <div className="text-xs font-mono text-[var(--accent-amber)] mb-3 uppercase tracking-wider">
            ⏸ Paused ({pausedProjects.length})
          </div>
          <div className="space-y-2">
            {pausedProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 px-3 bg-[var(--bg-elevated)]/50 rounded">
                <span className="text-sm text-[var(--text-muted)]">{project.name}</span>
                <button 
                  onClick={() => onUpdate(project.id, { status: 'active' })}
                  className="text-xs font-mono text-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]/80"
                >
                  Resume →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedProjects.length > 0 && (
        <div className="pt-4 border-t border-[var(--border-color)]">
          <div className="text-xs font-mono text-[var(--accent-cyan)] mb-3 uppercase tracking-wider">
            ✓ Completed ({completedProjects.length})
          </div>
          <div className="space-y-1">
            {completedProjects.slice(0, 3).map((project) => (
              <div key={project.id} className="text-sm text-[var(--text-muted)] py-1 flex items-center gap-2">
                <span className="text-[var(--accent-cyan)]">✓</span>
                {project.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {initiatives.length === 0 && (
        <div className="text-center text-[var(--text-muted)] text-sm py-12 border-2 border-dashed border-[var(--border-color)] rounded">
          <div className="text-2xl mb-2">🚀</div>
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

  const getPriorityConfig = (priority: string) => {
    if (priority === 'P0') return { class: 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)] border-[var(--accent-pink)]', label: 'P0' };
    if (priority === 'P1') return { class: 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border-[var(--accent-amber)]', label: 'P1' };
    return { class: 'bg-[var(--text-muted)]/20 text-[var(--text-muted)] border-[var(--text-muted)]', label: 'P2' };
  };

  const johnTasks = tasks.filter(t => !t.done && t.assignee === 'John').sort((a, b) => a.priority.localeCompare(b.priority));
  const bellatrixTasks = tasks.filter(t => !t.done && t.assignee === 'Bellatrix').sort((a, b) => a.priority.localeCompare(b.priority));
  const unassignedTasks = tasks.filter(t => !t.done && !t.assignee);
  const completedTasks = tasks.filter(t => t.done);

  const TaskItem = ({ task }: { task: Task }) => {
    const config = getPriorityConfig(task.priority);
    return (
      <div className={`flex items-center gap-3 p-2 rounded group transition-all ${task.done ? 'bg-[var(--bg-elevated)]/30' : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80'}`}>
        <button 
          onClick={() => onToggle(task.id)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            task.done 
              ? 'bg-[var(--accent-green)] border-[var(--accent-green)] text-black' 
              : 'border-[var(--border-color)] hover:border-[var(--accent-cyan)]'
          }`}
        >
          {task.done && <span className="text-xs">✓</span>}
        </button>
        <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${config.class}`}>
          {config.label}
        </span>
        <span className={`text-sm flex-1 ${task.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
          {task.text}
        </span>
        <button 
          onClick={() => onDelete(task.id)} 
          className="opacity-0 group-hover:opacity-100 text-[var(--accent-pink)] text-lg font-bold transition-opacity"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Add task form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
            placeholder="Add task..."
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors" 
          />
          <button 
            type="submit" 
            className="bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)] rounded px-4 py-2 text-xs font-mono text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30 transition-colors"
          >
            ADD
          </button>
        </div>
        <div className="flex gap-2">
          <select 
            value={newPriority} 
            onChange={(e) => setNewPriority(e.target.value)}
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs font-mono text-[var(--text-primary)]"
          >
            <option value="P0">🔥 P0 - Critical</option>
            <option value="P1">⚡ P1 - Important</option>
            <option value="P2">📌 P2 - Normal</option>
          </select>
          <select 
            value={newAssignee} 
            onChange={(e) => setNewAssignee(e.target.value)}
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs font-mono text-[var(--text-primary)]"
          >
            <option value="John">👤 John</option>
            <option value="Bellatrix">🖤 Bellatrix</option>
          </select>
        </div>
      </form>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {/* John's tasks */}
        {johnTasks.length > 0 && (
          <div>
            <div className="text-xs font-mono text-[var(--accent-cyan)] mb-2 uppercase tracking-wider flex items-center gap-2">
              <span>👤</span> John <span className="text-[var(--text-muted)]">({johnTasks.length})</span>
            </div>
            <div className="space-y-2">
              {johnTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {/* Bellatrix's tasks */}
        {bellatrixTasks.length > 0 && (
          <div>
            <div className="text-xs font-mono text-[var(--accent-magenta)] mb-2 uppercase tracking-wider flex items-center gap-2">
              <span>🖤</span> Bellatrix <span className="text-[var(--text-muted)]">({bellatrixTasks.length})</span>
            </div>
            <div className="space-y-2">
              {bellatrixTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {/* Unassigned */}
        {unassignedTasks.length > 0 && (
          <div>
            <div className="text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">
              Unassigned ({unassignedTasks.length})
            </div>
            <div className="space-y-2">
              {unassignedTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </div>
        )}
        
        {/* Completed */}
        {completedTasks.length > 0 && (
          <div className="pt-4 border-t border-[var(--border-color)]">
            <div className="text-xs font-mono text-[var(--accent-green)] mb-2 uppercase tracking-wider">
              ✓ Completed Today ({completedTasks.length})
            </div>
            <div className="space-y-1">
              {completedTasks.slice(0, 5).map(task => <TaskItem key={task.id} task={task} />)}
              {completedTasks.length > 5 && (
                <div className="text-xs text-[var(--text-muted)] pl-2">
                  +{completedTasks.length - 5} more completed
                </div>
              )}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-8">
            No tasks yet — add one above
          </div>
        )}
      </div>
    </div>
  );
}

function RecentSessions({ sessions }: { sessions: Session[] }) {
  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getChannelIcon = (channel?: string) => {
    const icons: Record<string, string> = {
      telegram: '📱', discord: '💬', slack: '💼', web: '🌐'
    };
    return icons[channel || ''] || '💬';
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center text-[var(--text-muted)] text-sm py-8">
        <div className="text-2xl mb-2">💬</div>
        No recent sessions
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
      {sessions.map((session) => (
        <div key={session.id} className="bg-[var(--bg-elevated)] p-3 rounded hover:bg-[var(--bg-elevated)]/80 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono text-[var(--accent-cyan)] flex items-center gap-2">
              <span>{getChannelIcon(session.channel)}</span>
              {session.label || session.channel || 'Session'}
            </span>
            {session.lastActivity && (
              <span className="text-xs text-[var(--text-muted)]">{formatTime(session.lastActivity)}</span>
            )}
          </div>
          {session.lastMessage && (
            <div className="text-xs text-[var(--text-muted)] truncate">{session.lastMessage}</div>
          )}
          {session.messageCount && (
            <div className="text-xs text-[var(--text-muted)] mt-1">{session.messageCount} messages</div>
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
      if (statusRes.ok) setAgentStatus(await statusRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Faster refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate stats
  const stats: DayStats = {
    tasksCompleted: tasks.filter(t => t.done).length,
    tasksCreated: tasks.length,
    activityCount: activity.length,
    projectsActive: initiatives.filter(i => i.status === 'active').length,
  };

  // Task handlers
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    await fetch('/api/tasks', { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id, done: !task.done }) 
    });
  };

  const handleAddTask = async (text: string, priority: string, assignee: string) => {
    const tempId = 'temp-' + Date.now();
    const newTask = { id: tempId, text, priority: priority as Task['priority'], done: false, assignee };
    setTasks([newTask, ...tasks]);
    
    const res = await fetch('/api/tasks', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ text, priority, assignee }) 
    });
    if (res.ok) {
      const created = await res.json();
      setTasks(prev => prev.map(t => t.id === tempId ? created : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await fetch('/api/tasks?id=' + id, { method: 'DELETE' });
  };

  // Activity handlers
  const handleAddActivity = async (text: string, type: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Denver' });
    
    const tempEntry = { id: 'temp-' + Date.now(), time: timeStr, text, type };
    setActivity([...activity, tempEntry]);
    
    const res = await fetch('/api/accomplishments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type, time: timeStr })
    });
    
    if (res.ok) {
      const created = await res.json();
      setActivity(prev => prev.map(e => e.id === tempEntry.id ? created : e));
    }
  };

  // Initiative handlers
  const handleUpdateInitiative = async (id: string, updates: Partial<Initiative>) => {
    setInitiatives(initiatives.map(i => i.id === id ? { ...i, ...updates } : i));
    await fetch('/api/initiatives', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
  };

  const pendingTaskCount = tasks.filter(t => !t.done).length;

  return (
    <div className="min-h-screen grid-bg">
      <style jsx global>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
        .glitch-text {
          text-shadow: 2px 0 var(--accent-magenta), -2px 0 var(--accent-cyan);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: var(--bg-elevated);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--accent-cyan);
          border-radius: 2px;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* HEADER */}
        <StatusHeader agentStatus={agentStatus} time={time} />

        {/* STATS BAR */}
        <StatsBar stats={stats} time={time} />

        {/* TOP ROW: Tasks (Hero) + Bellatrix Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="cyber-card p-6 h-full border-t-2 border-[var(--accent-amber)]">
              <h2 className="text-xl font-mono text-[var(--accent-amber)] mb-4 flex items-center gap-2">
                <span>✅</span> TASKS <span className="text-[var(--text-muted)] text-sm">({pendingTaskCount} pending)</span>
              </h2>
              <TaskQueue 
                tasks={tasks} 
                onToggle={handleToggleTask} 
                onAdd={handleAddTask} 
                onDelete={handleDeleteTask} 
              />
            </div>
          </div>
          <div className="lg:col-span-1">
            <ActiveNowPanel agentStatus={agentStatus} currentTasks={tasks} />
          </div>
        </div>

        {/* MIDDLE ROW: Projects + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-green)] mb-4 flex items-center gap-2">
              <span>🚀</span> PROJECTS
            </h2>
            <ProjectsPanel initiatives={initiatives} onUpdate={handleUpdateInitiative} />
          </div>
          <div className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-cyan)] mb-4 flex items-center gap-2">
              <span>📋</span> ACTIVITY LOG
            </h2>
            <ActivityLog entries={activity} onAdd={handleAddActivity} />
          </div>
        </div>

        {/* BOTTOM ROW: Recent Sessions */}
        <div className="cyber-card p-6">
          <h2 className="text-lg font-mono text-[var(--accent-magenta)] mb-4 flex items-center gap-2">
            <span>💬</span> RECENT SESSIONS
          </h2>
          <RecentSessions sessions={sessions} />
        </div>

        {/* FOOTER */}
        <footer className="text-center text-[var(--text-muted)] text-xs font-mono py-4 flex items-center justify-center gap-2">
          <span className="text-[var(--accent-cyan)]">◈</span>
          WAR ROOM v1.0
          <span className="text-[var(--accent-magenta)]">◈</span>
          Powered by Bellatrix 🖤
          <span className="text-[var(--accent-cyan)]">◈</span>
        </footer>
      </div>
    </div>
  );
}
