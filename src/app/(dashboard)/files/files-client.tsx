'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase, type SourceFile } from '@/lib/supabase'

function groupByCategory(files: SourceFile[]) {
  const groups: Record<string, SourceFile[]> = {}
  files.forEach(f => {
    const cat = f.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(f)
  })
  return groups
}

function fileName(path: string) {
  return path.split('/').pop() || path
}

export function FilesClient() {
  const [files, setFiles] = useState<SourceFile[]>([])
  const [selected, setSelected] = useState<SourceFile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFiles() {
      const { data, error } = await supabase
        .from('source_files')
        .select('*')
        .order('path')
      if (data) {
        setFiles(data)
        setSelected(data[0] || null)
      }
      setLoading(false)
    }
    fetchFiles()
  }, [])

  const groups = groupByCategory(files)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Source Files</h1>
        <p className="text-sm text-neutral-500 font-mono">
          {loading ? 'Loading...' : `${files.length} files cached`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {/* File Tree */}
        <Card className="glass-card bg-transparent border-white/5 lg:col-span-1">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {loading ? (
                <p className="text-neutral-600 text-sm font-mono">Loading files...</p>
              ) : files.length === 0 ? (
                <p className="text-neutral-600 text-sm font-mono">No files synced. Run seed script.</p>
              ) : (
                Object.entries(groups).sort().map(([cat, catFiles]) => (
                  <div key={cat}>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1 px-2">{cat}</p>
                    {catFiles.map(f => (
                      <button
                        key={f.path}
                        onClick={() => setSelected(f)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm font-mono truncate transition-colors ${
                          selected?.path === f.path
                            ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        📄 {fileName(f.path)}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Content Viewer */}
        <Card className="glass-card bg-transparent border-white/5 lg:col-span-3">
          <ScrollArea className="h-full">
            {selected ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div>
                    <h2 className="text-sm font-mono text-white">{fileName(selected.path)}</h2>
                    <p className="text-[10px] font-mono text-neutral-600">{selected.path}</p>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600">
                    {selected.updated_at ? new Date(selected.updated_at).toLocaleString() : ''}
                  </span>
                </div>
                <pre className="text-sm font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {selected.content || '(empty)'}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-600 font-mono text-sm">
                {loading ? 'Loading...' : 'Select a file to view'}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
