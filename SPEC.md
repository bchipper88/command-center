# Command Center — Spec Document

**Project:** Personal Life Dashboard / Command Center
**Owner:** John
**Builder:** Bellatrix
**Status:** Planning → Ready to Build

---

## Overview

A cyberpunk-themed personal command center that provides real-time visibility into:
- Financial progress toward freedom ($120K profit goal)
- Business metrics (Jurassic Apparel + future ventures)
- AI agent activity (Bellatrix + sub-agents)
- Tasks, initiatives, and accomplishments
- Email intelligence and calendar

**Design Aesthetic:** Dark mode, cyberpunk, "ghost in the machine"
- Deep blacks with neon accents (cyan, magenta, electric green)
- Scan lines, grid patterns, glitch effects
- Terminal fonts + clean UI hybrid
- Data streaming animations
- Feels alive, AI-driven, mysterious

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | Vercel (free tier) | Simple, auto-deploy, no server management |
| Frontend | Next.js + Tailwind + shadcn/ui | Fast, modern, easy to style |
| Database | Supabase (existing) | Already connected |
| Auth | Simple password or private URL | Just John, no complex auth needed |
| Design | Desktop-first, mobile responsive | Per John's preference |

---

## Financial Freedom Tracker

**Goal:** $120,000 profit

**Sources:**
- Jurassic Apparel: Revenue × 18% profit margin
- Future ventures: Added as launched

**Calculation:**
- JA Profit = Shopify Revenue × 0.18
- Total Progress = (JA Profit + Other Profits) / 120,000

---

## Data Sources

| Source | Connection | Status |
|--------|------------|--------|
| Shopify (JA) | Admin API | 🔴 Need API key |
| Clawdbot logs | Local server files | ✅ Ready |
| Supabase | Already connected | ✅ Ready |
| Gmail | OAuth tokens | ✅ Ready |
| Google Calendar | Via Gmail OAuth | ✅ Ready |
| Bank/Plaid | Not yet | ⏸️ Future |

---

## Phase 1 — MVP Modules

### 1. Status Header
- Current time (Mountain Time)
- Today's date
- System status indicator (Bellatrix online/offline)
- Quick stats row

### 2. Financial Freedom Progress
- Large progress bar toward $120K
- Current profit amount
- JA revenue MTD with 18% profit calc
- Breakdown chart by source
- Trend indicator (up/down from last period)

### 3. Daily Accomplishments
- Auto-populated from Bellatrix activity logs
- "While You Slept" section
- Categorized by type (SEO, code, design, etc.)
- Timestamps

### 4. Active Initiatives
- Project cards with status (Planning/In Progress/Blocked/Complete)
- Progress bars where applicable
- Blockers highlighted in red
- Links to relevant files/repos

### 5. To-Do List
- Tasks stored in Supabase
- Priority levels (P0/P1/P2)
- Due dates
- Assignee (John / Bellatrix)
- Quick add functionality

### 6. Agent Activity Feed
- Real-time(ish) feed of tool calls
- Sub-agent sessions and status
- Token/cost tracking for the day
- Session duration

---

## Phase 2 — Enhanced Modules

### 7. Email Intelligence
- Detected recurring subscriptions
- Upcoming renewals/bills
- Important unread count
- Suggested cancellations

### 8. Calendar Integration
- Today's events
- This week overview
- Upcoming deadlines across projects

### 9. Shopify Deep Dive
- Orders today
- Revenue MTD breakdown
- Top selling products
- Inventory alerts

### 10. Tools & Automations Library
- Scripts I've built
- Quick-run buttons
- Usage statistics

### 11. Quick Actions
- Pre-built action buttons
- "Check on X" shortcuts
- Voice/text input to Bellatrix

### 12. Session History
- Recent conversations
- Searchable
- Key decisions highlighted

---

## Design References

- Blade Runner UI
- Ghost in the Shell interfaces
- Bloomberg Terminal (data density)
- JARVIS / FRIDAY (MCU)
- Cyberpunk 2077 menus

**Color Palette:**
- Background: #0a0a0f (near black)
- Surface: #12121a (dark purple-black)
- Primary accent: #00ffff (cyan)
- Secondary accent: #ff00ff (magenta)
- Success: #00ff88 (electric green)
- Warning: #ffaa00 (amber)
- Error: #ff3366 (hot pink)
- Text: #e0e0e0 (light gray)
- Muted: #666680 (purple-gray)

**Typography:**
- Headers: JetBrains Mono or Space Mono (terminal feel)
- Body: Inter or system-ui (readability)
- Data: Tabular numbers, monospace for stats

---

## File Structure (Planned)

```
command-center/
├── app/
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout with theme
│   └── api/
│       ├── shopify/       # JA revenue endpoint
│       ├── activity/      # Bellatrix activity feed
│       ├── tasks/         # To-do CRUD
│       └── summary/       # Daily accomplishments
├── components/
│   ├── FinancialTracker.tsx
│   ├── ActivityFeed.tsx
│   ├── TaskList.tsx
│   ├── InitiativeCards.tsx
│   └── ui/                # shadcn components
├── lib/
│   ├── shopify.ts         # Shopify API client
│   ├── supabase.ts        # Supabase client
│   └── clawdbot.ts        # Activity log parser
└── styles/
    └── cyberpunk.css      # Custom effects
```

---

## Next Steps

1. [ ] Get Shopify Admin API key from John
2. [ ] Create GitHub repo
3. [ ] Scaffold Next.js project
4. [ ] Build cyberpunk theme/layout
5. [ ] Implement Financial Freedom tracker
6. [ ] Implement Activity Feed
7. [ ] Implement To-Do system
8. [ ] Deploy to Vercel
9. [ ] Create PR for review
10. [ ] Iterate based on feedback

---

## Timeline

| Milestone | Target |
|-----------|--------|
| Repo + layout | Jan 27 evening |
| Financial tracker | Jan 28 |
| MVP complete | Jan 29 |
| Live & iterable | Jan 30 |

---

*"The ghost in the machine awakens."* 🖤
