'use client';

import { useState, useEffect } from 'react';

// Mock data - will be replaced with real API calls
const mockData = {
  financialGoal: 120000,
  jaRevenue: 8500, // MTD
  jaProfit: 8500 * 0.18,
  otherProfit: 0,
  todayAccomplishments: [
    { time: '03:12', text: 'Security hardening completed - 6 vulnerabilities patched', type: 'security' },
    { time: '04:20', text: 'Mobile game market research - identified 6 opportunity gaps', type: 'research' },
    { time: '16:40', text: 'SEO blog system operational - NeilPatel scraping automated', type: 'automation' },
    { time: '16:46', text: 'Blog #1 written: "Gifts for Dinosaur Lovers Adults" (SD 17)', type: 'content' },
    { time: '16:51', text: 'Blog #2 written: "15 Facts of T. Rex" (SD 6, 5.4K vol)', type: 'content' },
    { time: '17:17', text: 'Generated 4 custom images for blog posts', type: 'design' },
    { time: '18:25', text: 'Created viral JA profile card image - T-Rex breaking frame', type: 'design' },
  ],
  initiatives: [
    { name: 'Jurassic Apparel SEO', status: 'active', progress: 15, blockers: null },
    { name: 'Command Center Dashboard', status: 'active', progress: 5, blockers: 'Shopify API key needed' },
    { name: 'Healthy Remote App', status: 'paused', progress: 78, blockers: null },
  ],
  agentStatus: {
    online: true,
    sessionStart: '16:39 UTC',
    toolCalls: 47,
    tokensUsed: '~125K',
    subAgents: 0,
  },
};

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [data] = useState(mockData);
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalProfit = data.jaProfit + data.otherProfit;
  const progressPercent = (totalProfit / data.financialGoal) * 100;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: 'America/Denver',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      timeZone: 'America/Denver',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen grid-bg scanlines">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <header className="cyber-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold tracking-wider">
                <span className="text-glow-cyan text-[var(--accent-cyan)]">COMMAND</span>
                <span className="text-[var(--text-muted)]"> // </span>
                <span className="text-glow-magenta text-[var(--accent-magenta)]">CENTER</span>
              </h1>
              <p className="text-[var(--text-muted)] font-mono text-sm mt-1">
                {formatDate(time)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono text-[var(--accent-cyan)] text-glow-cyan">
                {formatTime(time)}
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                <div className="status-online"></div>
                <span className="text-[var(--accent-green)] font-mono text-sm">BELLATRIX ONLINE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Financial Freedom Tracker */}
        <section className="cyber-card p-6 glow-cyan">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-mono text-[var(--accent-cyan)]">
              ◈ FINANCIAL FREEDOM TRACKER
            </h2>
            <span className="text-[var(--text-muted)] font-mono text-sm">
              TARGET: ${data.financialGoal.toLocaleString()}
            </span>
          </div>
          
          <div className="progress-cyber h-8 mb-4">
            <div 
              className="progress-cyber-fill" 
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-4xl font-mono font-bold text-[var(--accent-green)]">
                ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-[var(--text-muted)] text-sm">
                {progressPercent.toFixed(2)}% of goal
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm">
                <span className="text-[var(--text-muted)]">JA Revenue MTD:</span>
                <span className="text-[var(--text-primary)] ml-2">${data.jaRevenue.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-[var(--text-muted)]">JA Profit (18%):</span>
                <span className="text-[var(--accent-green)] ml-2">${data.jaProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Today's Accomplishments */}
          <section className="cyber-card p-6">
            <h2 className="text-xl font-mono text-[var(--accent-magenta)] mb-4">
              ◈ TODAY&apos;S ACCOMPLISHMENTS
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.todayAccomplishments.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm border-l-2 border-[var(--border-color)] pl-3 hover:border-[var(--accent-cyan)] transition-colors">
                  <span className="font-mono text-[var(--text-muted)] shrink-0">{item.time}</span>
                  <span className="text-[var(--text-primary)]">{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Agent Activity */}
          <section className="cyber-card p-6">
            <h2 className="text-xl font-mono text-[var(--accent-cyan)] mb-4">
              ◈ AGENT ACTIVITY
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-elevated)] p-4 rounded">
                <div className="text-[var(--text-muted)] text-xs font-mono">SESSION START</div>
                <div className="text-xl font-mono text-[var(--text-primary)]">{data.agentStatus.sessionStart}</div>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded">
                <div className="text-[var(--text-muted)] text-xs font-mono">TOOL CALLS</div>
                <div className="text-xl font-mono text-[var(--accent-cyan)]">{data.agentStatus.toolCalls}</div>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded">
                <div className="text-[var(--text-muted)] text-xs font-mono">TOKENS USED</div>
                <div className="text-xl font-mono text-[var(--accent-amber)]">{data.agentStatus.tokensUsed}</div>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded">
                <div className="text-[var(--text-muted)] text-xs font-mono">SUB-AGENTS</div>
                <div className="text-xl font-mono text-[var(--text-primary)]">{data.agentStatus.subAgents}</div>
              </div>
            </div>
          </section>
        </div>

        {/* Active Initiatives */}
        <section className="cyber-card p-6">
          <h2 className="text-xl font-mono text-[var(--accent-green)] mb-4">
            ◈ ACTIVE INITIATIVES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.initiatives.map((initiative, i) => (
              <div key={i} className="bg-[var(--bg-elevated)] p-4 rounded border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono text-[var(--text-primary)]">{initiative.name}</h3>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    initiative.status === 'active' 
                      ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                      : 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]'
                  }`}>
                    {initiative.status.toUpperCase()}
                  </span>
                </div>
                <div className="progress-cyber h-2 mb-2">
                  <div 
                    className="progress-cyber-fill" 
                    style={{ width: `${initiative.progress}%` }}
                  />
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {initiative.progress}% complete
                </div>
                {initiative.blockers && (
                  <div className="mt-2 text-xs text-[var(--accent-pink)] font-mono">
                    ⚠ {initiative.blockers}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-[var(--text-muted)] text-sm font-mono py-4">
          <span className="text-[var(--accent-cyan)]">◈</span>
          {' '}GHOST IN THE MACHINE{' '}
          <span className="text-[var(--accent-magenta)]">◈</span>
          {' '}v0.1.0{' '}
          <span className="text-[var(--accent-cyan)]">◈</span>
        </footer>
      </div>
    </div>
  );
}
