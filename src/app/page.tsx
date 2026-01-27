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
  dueDate?: string;
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

interface Accomplishment {
  time: string;
  text: string;
  type: string;
  category?: string;
}

interface GmailData {
  unreadCount: number;
  importantEmails: Array<{
    id: string;
    subject: string;
    from: string;
    snippet: string;
  }>;
}

interface Goal {
  id: string;
  name: string;
  icon: string;
  current_value: number;
  target_value: number;
  unit: string;
  color: string;
  goal_type?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  isAllDay: boolean;
  location?: string;
}

interface KlaviyoData {
  connected: boolean;
  subscribers: number;
  listName: string;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    sendTime: string | null;
  }>;
  error?: string;
}

interface QuickLinks {
  business: Array<{ name: string; url: string; icon: string; shortcut?: string }>;
  development: Array<{ name: string; url: string; icon: string; shortcut?: string }>;
  tools: Array<{ name: string; url: string; icon: string; shortcut?: string }>;
  actions: Array<{ name: string; action: string; icon: string }>;
}

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  message: string;
  action?: string;
  link?: string;
}

// ============ COMPONENTS ============

function AlertsBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  
  const getAlertStyle = (type: string) => {
    if (type === 'urgent') return 'bg-[var(--accent-pink)]/20 border-[var(--accent-pink)] text-[var(--accent-pink)]';
    if (type === 'warning') return 'bg-[var(--accent-amber)]/20 border-[var(--accent-amber)] text-[var(--accent-amber)]';
    return 'bg-[var(--accent-cyan)]/20 border-[var(--accent-cyan)] text-[var(--accent-cyan)]';
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div key={alert.id} className={`p-3 rounded border ${getAlertStyle(alert.type)} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">{alert.type === 'urgent' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span className="font-mono text-sm">{alert.message}</span>
          </div>
          {alert.link && (
            <a href={alert.link} target="_blank" rel="noopener noreferrer" 
               className="text-xs font-mono px-3 py-1 rounded bg-white/10 hover:bg-white/20">
              View →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function QuickActionsPanel({ links }: { links: QuickLinks | null }) {
  if (!links) return null;

  return (
    <div className="space-y-4">
      {/* Business Links */}
      <div>
        <div className="text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">Business</div>
        <div className="flex flex-wrap gap-2">
          {links.business.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] rounded border border-[var(--border-color)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-all group">
              <span>{link.icon}</span>
              <span className="text-sm font-mono text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)]">{link.name}</span>
              {link.shortcut && <span className="text-xs text-[var(--text-muted)] opacity-50">⌘{link.shortcut}</span>}
            </a>
          ))}
        </div>
      </div>

      {/* Dev Links */}
      <div>
        <div className="text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">Development</div>
        <div className="flex flex-wrap gap-2">
          {links.development.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] rounded border border-[var(--border-color)] hover:border-[var(--accent-magenta)] hover:bg-[var(--accent-magenta)]/10 transition-all group">
              <span>{link.icon}</span>
              <span className="text-sm font-mono text-[var(--text-primary)] group-hover:text-[var(--accent-magenta)]">{link.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Tool Links */}
      <div>
        <div className="text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">Tools</div>
        <div className="flex flex-wrap gap-2">
          {links.tools.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] rounded border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:bg-[var(--accent-green)]/10 transition-all group">
              <span>{link.icon}</span>
              <span className="text-sm font-mono text-[var(--text-primary)] group-hover:text-[var(--accent-green)]">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoneyHero({ goals }: { goals: Goal[] }) {
  const financialGoal = goals.find(g => g.id === 'financial' || g.name.toLowerCase().includes('financial'));
  const revenueGoal = goals.find(g => g.id === 'monthly_revenue' || g.goal_type === 'monthly');
  
  if (!financialGoal) return null;

  const progress = (financialGoal.current_value / financialGoal.target_value) * 100;
  const remaining = financialGoal.target_value - financialGoal.current_value;

  return (
    <div className="cyber-card p-6 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--accent-green)]/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-mono text-[var(--accent-green)] flex items-center gap-2">
            💰 FINANCIAL FREEDOM
          </h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Target: ${financialGoal.target_value.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold text-[var(--accent-green)]">
            ${financialGoal.current_value.toLocaleString()}
          </div>
          <div className="text-sm text-[var(--text-muted)]">${remaining.toLocaleString()} to go</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-6 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-color)] mb-4">
        <div 
          className="h-full transition-all duration-1000 relative"
          style={{ 
            width: `${Math.max(progress, 1)}%`,
            background: 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))',
            boxShadow: '0 0 20px var(--accent-green)'
          }}
        >
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-black">
            {progress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Monthly breakdown */}
      {revenueGoal && (
        <div className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded mt-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <span className="text-sm font-mono text-[var(--text-muted)]">This Month&apos;s Revenue</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-[var(--accent-cyan)]">${revenueGoal.current_value.toLocaleString()}</span>
            <span className="text-[var(--text-muted)]"> / ${revenueGoal.target_value.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function KlaviyoCard({ data }: { data: KlaviyoData | null }) {
  if (!data) return <div className="text-center py-4 text-[var(--text-muted)] text-sm font-mono">Loading...</div>;
  
  if (data.error || !data.connected) {
    return (
      <div className="text-center py-4">
        <div className="text-[var(--accent-amber)] text-sm font-mono">⚠️ Klaviyo not connected</div>
        <a href="https://www.klaviyo.com/dashboard" target="_blank" rel="noopener noreferrer"
           className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)]">
          Connect account →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-muted)] text-sm">Subscribers</span>
        <div className="text-3xl font-mono font-bold text-[var(--accent-magenta)]">
          {data.subscribers.toLocaleString()}
        </div>
      </div>
      
      <div className="text-xs text-[var(--text-muted)]">{data.listName}</div>

      {data.campaigns.length > 0 && (
        <div className="pt-3 border-t border-[var(--border-color)]">
          <div className="text-xs font-mono text-[var(--text-muted)] mb-2">Recent Campaigns</div>
          {data.campaigns.slice(0, 2).map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between text-sm py-1">
              <span className="text-[var(--text-primary)] truncate max-w-48">{campaign.name}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                campaign.status === 'sent' ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' :
                campaign.status === 'draft' ? 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]' :
                'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]'
              }`}>
                {campaign.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <a href="https://www.klaviyo.com/campaigns" target="_blank" rel="noopener noreferrer"
         className="block w-full text-center py-2 text-xs font-mono text-[var(--accent-magenta)] hover:bg-[var(--accent-magenta)]/10 rounded transition-colors">
        Create Campaign →
      </a>
    </div>
  );
}

function ShopifyCard() {
  // Placeholder until API key is provided
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-muted)] text-sm">Today&apos;s Orders</span>
        <div className="text-3xl font-mono font-bold text-[var(--accent-cyan)]">—</div>
      </div>
      
      <div className="p-3 bg-[var(--accent-amber)]/10 rounded border border-[var(--accent-amber)]/30">
        <div className="text-xs font-mono text-[var(--accent-amber)]">⚠️ Shopify API not connected</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          Add your Shopify Admin API key to see real metrics
        </div>
      </div>

      <div className="flex gap-2">
        <a href="https://admin.shopify.com/store/jurassicapparel/orders" target="_blank" rel="noopener noreferrer"
           className="flex-1 text-center py-2 text-xs font-mono bg-[var(--bg-elevated)] rounded hover:bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
          View Orders →
        </a>
        <a href="https://admin.shopify.com/store/jurassicapparel/analytics" target="_blank" rel="noopener noreferrer"
           className="flex-1 text-center py-2 text-xs font-mono bg-[var(--bg-elevated)] rounded hover:bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
          Analytics →
        </a>
      </div>
    </div>
  );
}

function TaskList({ tasks, onToggle, onAdd, onDelete }: { 
  tasks: Task[]; 
  onToggle: (id: string) => void;
  onAdd: (text: string, priority: string) => void;
  onDelete: (id: string) => void;
}) {
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('P1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAdd(newTask.trim(), newPriority);
      setNewTask('');
    }
  };

  const getPriorityClass = (priority: string) => {
    if (priority === 'P0') return 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]';
    if (priority === 'P1') return 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]';
    return 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]';
  };

  const pendingTasks = tasks.filter(t => !t.done).sort((a, b) => a.priority.localeCompare(b.priority));
  const completedTasks = tasks.filter(t => t.done);

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add task..."
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none" />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
          className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded px-2 py-2 text-xs font-mono text-[var(--text-primary)]">
          <option value="P0">P0 🔥</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
        <button type="submit" className="bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)] rounded px-4 py-2 text-xs font-mono text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30">ADD</button>
      </form>
      
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {pendingTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-2 bg-[var(--bg-elevated)] rounded group hover:bg-[var(--bg-elevated)]/80">
            <input type="checkbox" className="w-4 h-4 accent-[var(--accent-cyan)]" checked={task.done} onChange={() => onToggle(task.id)} />
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${getPriorityClass(task.priority)}`}>{task.priority}</span>
            <span className="text-sm flex-1 text-[var(--text-primary)]">{task.text}</span>
            {task.assignee && <span className="text-xs text-[var(--text-muted)]">@{task.assignee}</span>}
            <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-[var(--accent-pink)] text-lg font-bold">×</button>
          </div>
        ))}
        
        {completedTasks.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-color)]">
            <div className="text-xs font-mono text-[var(--text-muted)] mb-2">Completed ({completedTasks.length})</div>
            {completedTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2 opacity-50">
                <input type="checkbox" className="w-4 h-4 accent-[var(--accent-green)]" checked={task.done} onChange={() => onToggle(task.id)} />
                <span className="text-sm flex-1 text-[var(--text-muted)] line-through">{task.text}</span>
                <button onClick={() => onDelete(task.id)} className="text-[var(--accent-pink)] text-lg font-bold">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GmailWidget({ data }: { data: GmailData | null }) {
  if (!data) return <div className="text-center py-4 text-[var(--text-muted)] text-sm font-mono">Loading...</div>;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-muted)] text-sm">Inbox</span>
        <div className={`text-2xl font-mono font-bold ${data.unreadCount > 0 ? 'text-[var(--accent-amber)]' : 'text-[var(--accent-green)]'}`}>
          {data.unreadCount} <span className="text-xs text-[var(--text-muted)]">unread</span>
        </div>
      </div>
      {data.importantEmails.slice(0, 3).map((email) => (
        <div key={email.id} className="bg-[var(--bg-elevated)] p-2 rounded text-sm hover:bg-[var(--bg-elevated)]/80">
          <div className="font-medium text-[var(--text-primary)] truncate">{email.subject}</div>
          <div className="text-xs text-[var(--text-muted)]">{email.from}</div>
        </div>
      ))}
      <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer"
         className="block text-center py-2 text-xs font-mono text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 rounded">
        Open Gmail →
      </a>
    </div>
  );
}

function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  const formatTime = (start: string, isAllDay: boolean) => {
    if (isAllDay) return 'All day';
    return new Date(start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Denver' });
  };
  
  const formatDate = (start: string) => {
    const date = new Date(start);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const grouped: Record<string, CalendarEvent[]> = {};
  events.forEach(e => {
    const key = formatDate(e.start);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  if (events.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-[var(--text-muted)] text-sm font-mono">No upcoming events</div>
        <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer"
           className="text-xs text-[var(--accent-cyan)] hover:underline mt-2 inline-block">
          Open Calendar →
        </a>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-48 overflow-y-auto">
      {Object.entries(grouped).map(([date, dayEvents]) => (
        <div key={date}>
          <div className="text-xs font-mono text-[var(--accent-cyan)] mb-1">{date}</div>
          {dayEvents.map(event => (
            <div key={event.id} className="bg-[var(--bg-elevated)] p-2 rounded text-sm mb-1 hover:bg-[var(--bg-elevated)]/80">
              <div className="flex justify-between">
                <span className="text-[var(--text-primary)] truncate">{event.summary}</span>
                <span className="text-xs text-[var(--text-muted)] ml-2 shrink-0">{formatTime(event.start, event.isAllDay)}</span>
              </div>
              {event.location && <div className="text-xs text-[var(--text-muted)] truncate">📍 {event.location}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AccomplishmentsFeed({ items }: { items: Accomplishment[] }) {
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || item.type || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, Accomplishment[]>);

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      code: '💻', design: '🎨', seo: '🔍', email: '📧', social: '📱', 
      research: '🔬', deploy: '🚀', fix: '🔧', general: '✨'
    };
    return icons[cat] || '✨';
  };

  if (items.length === 0) {
    return <div className="text-center py-4 text-[var(--text-muted)] text-sm font-mono">No accomplishments logged today</div>;
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto">
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-2">
            <span>{getCategoryIcon(category)}</span>
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase">{category}</span>
            <span className="text-xs text-[var(--text-muted)]">({catItems.length})</span>
          </div>
          {catItems.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm border-l-2 border-[var(--border-color)] pl-3 mb-2 hover:border-[var(--accent-cyan)]">
              <span className="font-mono text-[var(--text-muted)] text-xs shrink-0">{item.time}</span>
              <span className="text-[var(--text-primary)]">{item.text}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function InitiativeCard({ initiative }: { initiative: Initiative }) {
  const getStatusClass = (s: string) => {
    if (s === 'active') return 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]';
    if (s === 'completed') return 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]';
    return 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]';
  };

  return (
    <div className="bg-[var(--bg-elevated)] p-4 rounded border border-[var(--border-color)] hover:border-[var(--accent-cyan)]/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-mono text-lg text-[var(--text-primary)]">{initiative.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-[var(--text-muted)]">{initiative.progress}%</span>
          <span className={`text-xs font-mono px-2 py-1 rounded ${getStatusClass(initiative.status)}`}>
            {initiative.status.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="h-2 bg-[var(--bg-primary)] rounded overflow-hidden mb-3">
        <div 
          className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-magenta)]" 
          style={{ width: initiative.progress + '%' }} 
        />
      </div>
      
      {initiative.blockers && (
        <div className="mb-3 text-sm text-[var(--accent-pink)] font-mono p-2 bg-[var(--accent-pink)]/10 rounded">
          ⚠ {initiative.blockers}
        </div>
      )}
      
      <div className="space-y-1">
        {initiative.nextSteps.slice(0, 3).map((step, j) => (
          <div key={j} className="flex items-center gap-2 text-sm">
            <span className="text-[var(--accent-cyan)]">→</span>
            <span className="text-[var(--text-muted)]">{step}</span>
          </div>
        ))}
      </div>

      {initiative.repo && (
        <a href={initiative.repo} target="_blank" rel="noopener noreferrer"
           className="inline-block mt-3 text-xs font-mono text-[var(--accent-magenta)] hover:underline">
          View Repo →
        </a>
      )}
    </div>
  );
}

// ============ MAIN DASHBOARD ============

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [gmail, setGmail] = useState<GmailData | null>(null);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [klaviyo, setKlaviyo] = useState<KlaviyoData | null>(null);
  const [quickLinks, setQuickLinks] = useState<QuickLinks | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generateAlerts = useCallback((data: { gmail?: GmailData | null; tasks?: Task[] }) => {
    const newAlerts: Alert[] = [];
    
    // Urgent emails
    if (data.gmail && data.gmail.unreadCount > 10) {
      newAlerts.push({
        id: 'email-overload',
        type: 'warning',
        message: `${data.gmail.unreadCount} unread emails piling up!`,
        link: 'https://mail.google.com',
      });
    }
    
    // P0 tasks
    const p0Tasks = (data.tasks || []).filter(t => t.priority === 'P0' && !t.done);
    if (p0Tasks.length > 0) {
      newAlerts.push({
        id: 'p0-tasks',
        type: 'urgent',
        message: `${p0Tasks.length} P0 task${p0Tasks.length > 1 ? 's' : ''} need attention!`,
      });
    }
    
    setAlerts(newAlerts);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, initiativesRes, gmailRes, calendarRes, accomplishmentsRes, goalsRes, klaviyoRes, linksRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/initiatives'),
        fetch('/api/gmail'),
        fetch('/api/calendar'),
        fetch('/api/accomplishments'),
        fetch('/api/goals'),
        fetch('/api/klaviyo'),
        fetch('/api/quick-links'),
      ]);
      
      let tasksData: Task[] = [];
      let gmailData: GmailData | null = null;

      if (tasksRes.ok) {
        tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
      if (initiativesRes.ok) setInitiatives(await initiativesRes.json());
      if (accomplishmentsRes.ok) setAccomplishments(await accomplishmentsRes.json());
      if (goalsRes.ok) setGoals(await goalsRes.json());
      if (klaviyoRes.ok) setKlaviyo(await klaviyoRes.json());
      if (linksRes.ok) setQuickLinks(await linksRes.json());
      
      if (gmailRes.ok) {
        const d = await gmailRes.json();
        if (!d.error) {
          gmailData = d;
          setGmail(d);
        }
      }
      if (calendarRes.ok) {
        const d = await calendarRes.json();
        if (d.events) setCalendar(d.events);
      }

      generateAlerts({ gmail: gmailData, tasks: tasksData });
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [generateAlerts]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, done: !task.done }) });
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = async (text: string, priority: string) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, priority }) });
    if (res.ok) setTasks([await res.json(), ...tasks]);
  };

  const handleDeleteTask = async (id: string) => {
    await fetch('/api/tasks?id=' + id, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const formatTimeStr = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/Denver', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDateStr = (d: Date) => d.toLocaleDateString('en-US', { timeZone: 'America/Denver', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const pendingTaskCount = tasks.filter(t => !t.done).length;

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* HEADER */}
        <header className="cyber-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold tracking-wider">
                <span className="text-[var(--accent-cyan)]">COMMAND</span>
                <span className="text-[var(--text-muted)]"> // </span>
                <span className="text-[var(--accent-magenta)]">CENTER</span>
              </h1>
              <p className="text-[var(--text-muted)] font-mono text-sm mt-1">{formatDateStr(time)}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono text-[var(--accent-cyan)]">{formatTimeStr(time)}</div>
              <div className="flex items-center gap-4 justify-end mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse"></div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">Bellatrix Online</span>
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)]">
                  {pendingTaskCount} tasks • {calendar.length} events
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ALERTS */}
        {alerts.length > 0 && <AlertsBanner alerts={alerts} />}

        {/* MONEY HERO */}
        <MoneyHero goals={goals} />

        {/* BUSINESS METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-cyan)] mb-4 flex items-center gap-2">
              🛒 SHOPIFY
            </h2>
            <ShopifyCard />
          </section>

          <section className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-magenta)] mb-4 flex items-center gap-2">
              📧 KLAVIYO
            </h2>
            <KlaviyoCard data={klaviyo} />
          </section>

          <section className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-green)] mb-4 flex items-center gap-2">
              📸 INSTAGRAM
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] text-sm">Followers</span>
                <div className="text-3xl font-mono font-bold text-[var(--accent-green)]">—</div>
              </div>
              <div className="text-xs text-[var(--text-muted)]">Connect Instagram API for metrics</div>
              <a href="https://www.instagram.com/jurassicapparel" target="_blank" rel="noopener noreferrer"
                 className="block w-full text-center py-2 text-xs font-mono text-[var(--accent-green)] hover:bg-[var(--accent-green)]/10 rounded transition-colors">
                View Profile →
              </a>
            </div>
          </section>
        </div>

        {/* QUICK ACTIONS */}
        <section className="cyber-card p-6">
          <h2 className="text-lg font-mono text-[var(--accent-cyan)] mb-4">⚡ QUICK ACCESS</h2>
          <QuickActionsPanel links={quickLinks} />
        </section>

        {/* COMMUNICATIONS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-magenta)] mb-4">✉️ GMAIL</h2>
            <GmailWidget data={gmail} />
          </section>
          <section className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-cyan)] mb-4">📅 CALENDAR</h2>
            <CalendarWidget events={calendar} />
          </section>
        </div>

        {/* WORK ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-green)] mb-4">🖤 BELLATRIX ACTIVITY</h2>
            <AccomplishmentsFeed items={accomplishments} />
          </section>
          <section className="cyber-card p-6">
            <h2 className="text-lg font-mono text-[var(--accent-amber)] mb-4">📋 TASK QUEUE ({pendingTaskCount})</h2>
            <TaskList tasks={tasks} onToggle={handleToggleTask} onAdd={handleAddTask} onDelete={handleDeleteTask} />
          </section>
        </div>

        {/* INITIATIVES */}
        <section className="cyber-card p-6">
          <h2 className="text-lg font-mono text-[var(--accent-cyan)] mb-4">🚀 ACTIVE INITIATIVES</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {initiatives.map((init) => (
              <InitiativeCard key={init.id} initiative={init} />
            ))}
            {initiatives.length === 0 && (
              <div className="text-center text-[var(--text-muted)] font-mono py-8 col-span-2">
                No active initiatives
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-[var(--text-muted)] text-sm font-mono py-4 flex items-center justify-center gap-4">
          <span>◈ COMMAND CENTER v2.0 ◈</span>
          <span className="text-[var(--accent-cyan)]">|</span>
          <span>Powered by Bellatrix 🖤</span>
        </footer>
      </div>
    </div>
  );
}
