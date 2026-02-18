'use client'

import { useState } from 'react'

const sites = [
  { id: 'lv', label: 'Lehigh Valley', short: 'LV', color: 'bg-blue-500' },
  { id: 'denver', label: 'Denver', short: 'DEN', color: 'bg-purple-500' },
  { id: 'savannah', label: 'Savannah', short: 'SAV', color: 'bg-emerald-500' },
]

type SiteTabsProps<T> = {
  data: Record<string, T[]>
  renderContent: (siteId: string, data: T[]) => React.ReactNode
  defaultSite?: string
}

export function SiteTabs<T>({ data, renderContent, defaultSite = 'lv' }: SiteTabsProps<T>) {
  const [activeSite, setActiveSite] = useState(defaultSite)

  return (
    <div>
      {/* Site tabs */}
      <div className="flex gap-2 mb-6">
        {sites.map((site) => (
          <button
            key={site.id}
            onClick={() => setActiveSite(site.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSite === site.id
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${site.color} mr-2`}></span>
            {site.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent(activeSite, data[activeSite] || [])}
    </div>
  )
}

export { sites }
