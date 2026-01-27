'use client';

import { useState, useEffect, useRef } from 'react';

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
    { time: '18:41', text: 'Command Center v0.1 deployed to GitHub', type: 'code' },
  ],
  initiatives: [
    { 
      name: 'Jurassic Apparel SEO', 
      status: 'active', 
      progress: 15, 
      blockers: null,
      nextSteps: [
        'Post Blog #1 and #2 to Shopify',
        'Write 3 more blog posts targeting SD<20 keywords',
        'Set up rank tracking for target keywords',
      ]
    },
    { 
      name: 'Command Center Dashboard', 
      status: 'active', 
      progress: 20, 
      blockers: 'Shopify API key needed for real revenue data',
      nextSteps: [
        'Get Shopify Admin API key',
        'Wire up real JA revenue data',
        'Add to-do list functionality',
        'Connect Gmail for email intelligence',
      ]
    },
    { 
      name: 'Healthy Remote App', 
      status: 'paused', 
      progress: 78, 
      blockers: null,
      nextSteps: [
        'Resume development when prioritized',
        'Complete remaining UI screens',
        'Beta test with 5 users',
      ]
    },
  ],
  agentStatus: {
    online: true,
    sessionStart: '16:39 UTC',
    toolCalls: 63,
    tokensUsed: '~180K',
    subAgents: 0,
    recentCalls: [
      { tool: 'exec', time: '18:41', desc: 'npm run build' },
      { tool: 'write', time: '18:40', desc: 'page.tsx updated' },
      { tool: 'exec', time: '18:39', desc: 'git push origin' },
      { tool: 'message', time: '18:27', desc: 'image sent to telegram' },
      { tool: 'image_gen', time: '18:25', desc: 'JA profile card created' },
    ],
  },
};

// Matrix rain effect component
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);
    
    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ffff';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? '#ff00ff' : 'rgba(0, 255, 255, 0.8)';
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />;
}

// Neural network visualization
function AgentVisualization({ agentStatus }: { agentStatus: typeof mockData.agentStatus }) {
  const [pulse, setPulse] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const subAgentPositions = [
    { x: 30, y: 25 },
    { x: 70, y: 25 },
    { x: 20, y: 65 },
    { x: 80, y: 65 },
    { x: 50, y: 85 },
  ];

  return (
    <div className="relative h-64 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
      <MatrixRain />
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Data streams from center to sub-agents */}
        {subAgentPositions.map((pos, i) => (
          <g key={i}>
            <line
              x1="50%"
              y1="50%"
              x2={`${pos.x}%`}
              y2={`${pos.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              opacity={0.3}
            />
            {/* Animated data packet */}
            <circle
              r="3"
              fill="#00ffff"
              filter="url(#glow)"
              opacity={0.8}
            >
              <animateMotion
                dur={`${2 + i * 0.3}s`}
                repeatCount="indefinite"
                path={`M${50}%,${50}% L${pos.x}%,${pos.y}%`}
              />
            </circle>
          </g>
        ))}
      </svg>
      
      {/* Central core - BELLATRIX */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 2 }}
      >
        <div 
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)`,
            boxShadow: `0 0 ${30 + Math.sin(pulse * 0.05) * 10}px rgba(0,255,255,0.5)`,
          }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[var(--accent-cyan)]"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: 'inset 0 0 20px rgba(0,255,255,0.3)',
            }}
          >
            <span className="text-[var(--accent-cyan)] font-mono text-xs font-bold">CORE</span>
          </div>
          
          {/* Orbiting ring */}
          <div 
            className="absolute w-28 h-28 rounded-full border border-[var(--accent-cyan)]/30"
            style={{ 
              transform: `rotate(${pulse}deg)`,
              borderStyle: 'dashed',
            }}
          />
        </div>
      </div>
      
      {/* Sub-agent nodes */}
      {subAgentPositions.map((pos, i) => (
        <div
          key={i}
          className="absolute w-8 h-8 rounded-full flex items-center justify-center border border-[var(--accent-magenta)]/50"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            background: agentStatus.subAgents > i ? 'rgba(255,0,255,0.3)' : 'rgba(100,100,128,0.2)',
            boxShadow: agentStatus.subAgents > i ? '0 0 10px rgba(255,0,255,0.5)' : 'none',
            zIndex: 2,
          }}
        >
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {agentStatus.subAgents > i ? 'ON' : '○'}
          </span>
        </div>
      ))}
      
      {/* Status overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs font-mono" style={{ zIndex: 3 }}>
        <span className="text-[var(--accent-green)]">● NEURAL LINK ACTIVE</span>
        <span className="text-[var(--text-muted)]">{agentStatus.subAgents}/5 SUB-AGENTS</span>
      </div>
      
      {/* Label */}
      <div className="absolute top-2 left-2 text-xs font-mono text-[var(--accent-cyan)]" style={{ zIndex: 3 }}>
        BELLATRIX // PRIMARY AGENT
      </div>
    </div>
  );
}

// Recent tool calls feed
function ActivityFeed({ calls }: { calls: typeof mockData.agentStatus.recentCalls }) {
  return (
    <div className="space-y-2 font-mono text-xs">
      {calls.map((call, i) => (
        <div 
          key={i}
          className="flex items-center gap-2 p-2 bg-[var(--bg-elevated)] rounded border-l-2 border-[var(--accent-cyan)]"
          style={{ 
            opacity: 1 - (i * 0.15),
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <span className="text-[var(--text-muted)]">{call.time}</span>
          <span className="text-[var(--accent-magenta)]">[{call.tool}]</span>
          <span className="text-[var(--text-primary)] truncate">{call.desc}</span>
        </div>
      ))}
    </div>
  );
}

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

        {/* Agent Visualization + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="cyber-card p-6 glow-magenta">
            <h2 className="text-xl font-mono text-[var(--accent-magenta)] mb-4">
              ◈ AGENT NEURAL NETWORK
            </h2>
            <AgentVisualization agentStatus={data.agentStatus} />
          </section>

          <section className="cyber-card p-6">
            <h2 className="text-xl font-mono text-[var(--accent-cyan)] mb-4">
              ◈ LIVE ACTIVITY STREAM
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[var(--bg-elevated)] p-3 rounded">
                <div className="text-[var(--text-muted)] text-xs font-mono">SESSION</div>
                <div className="text-lg font-mono text-[var(--text-primary)]">{data.agentStatus.sessionStart}</div>
              </div>
              <div className="bg-[var(--bg-elevated)] p-3 rounded">
                <div className="text-[var(--text-muted)] text-xs font-mono">TOOL CALLS</div>
                <div className="text-lg font-mono text-[var(--accent-cyan)]">{data.agentStatus.toolCalls}</div>
              </div>
            </div>
            <ActivityFeed calls={data.agentStatus.recentCalls} />
          </section>
        </div>

        {/* Two Column: Accomplishments + To-Do (placeholder) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Accomplishments */}
          <section className="cyber-card p-6">
            <h2 className="text-xl font-mono text-[var(--accent-green)] mb-4">
              ◈ TODAY&apos;S ACCOMPLISHMENTS
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.todayAccomplishments.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm border-l-2 border-[var(--border-color)] pl-3 hover:border-[var(--accent-cyan)] transition-colors">
                  <span className="font-mono text-[var(--text-muted)] shrink-0">{item.time}</span>
                  <span className="text-[var(--text-primary)]">{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* To-Do List (placeholder) */}
          <section className="cyber-card p-6">
            <h2 className="text-xl font-mono text-[var(--accent-amber)] mb-4">
              ◈ TASK QUEUE
            </h2>
            <div className="space-y-2">
              {[
                { text: 'Get Shopify Admin API key', priority: 'P0', done: false },
                { text: 'Post blogs to Shopify', priority: 'P1', done: false },
                { text: 'Review Command Center dashboard', priority: 'P1', done: false },
                { text: 'Call suit place', priority: 'P2', done: false },
                { text: 'Facebook page for JA', priority: 'P2', done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-[var(--bg-elevated)] rounded">
                  <input type="checkbox" className="w-4 h-4 accent-[var(--accent-cyan)]" defaultChecked={task.done} />
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    task.priority === 'P0' ? 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]' :
                    task.priority === 'P1' ? 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]' :
                    'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
                  }`}>{task.priority}</span>
                  <span className="text-sm text-[var(--text-primary)]">{task.text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Active Initiatives with Next Steps */}
        <section className="cyber-card p-6">
          <h2 className="text-xl font-mono text-[var(--accent-cyan)] mb-4">
            ◈ ACTIVE INITIATIVES
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {data.initiatives.map((initiative, i) => (
              <div key={i} className="bg-[var(--bg-elevated)] p-4 rounded border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono text-lg text-[var(--text-primary)]">{initiative.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-[var(--text-muted)]">{initiative.progress}%</span>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                      initiative.status === 'active' 
                        ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                        : 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]'
                    }`}>
                      {initiative.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="progress-cyber h-2 mb-3">
                  <div 
                    className="progress-cyber-fill" 
                    style={{ width: `${initiative.progress}%` }}
                  />
                </div>
                
                {initiative.blockers && (
                  <div className="mb-3 text-sm text-[var(--accent-pink)] font-mono flex items-center gap-2">
                    <span>⚠</span>
                    <span>{initiative.blockers}</span>
                  </div>
                )}
                
                <div className="mt-3">
                  <div className="text-xs font-mono text-[var(--accent-cyan)] mb-2">NEXT STEPS:</div>
                  <div className="space-y-1">
                    {initiative.nextSteps.map((step, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--accent-cyan)]">→</span>
                        <span className="text-[var(--text-muted)]">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-[var(--text-muted)] text-sm font-mono py-4">
          <span className="text-[var(--accent-cyan)]">◈</span>
          {' '}GHOST IN THE MACHINE{' '}
          <span className="text-[var(--accent-magenta)]">◈</span>
          {' '}v0.2.0{' '}
          <span className="text-[var(--accent-cyan)]">◈</span>
        </footer>
      </div>
    </div>
  );
}
