'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type TshirtDesign = {
  id: string
  name: string
  concept: string | null
  prompt: string | null
  image_url: string | null
  score: number
  status: string
  notes: string | null
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
    printed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-gray-500/20 text-gray-400'
  if (score >= 8) color = 'bg-green-500/20 text-green-400'
  else if (score >= 6) color = 'bg-yellow-500/20 text-yellow-400'
  else color = 'bg-red-500/20 text-red-400'
  
  return (
    <span className={`px-2 py-1 text-sm font-bold rounded ${color}`}>
      {score}/10
    </span>
  )
}

function Lightbox({ 
  design, 
  onClose,
  onStatusChange 
}: { 
  design: TshirtDesign
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  const [updating, setUpdating] = useState(false)
  
  const handleStatusChange = async (status: string) => {
    setUpdating(true)
    await onStatusChange(design.id, status)
    setUpdating(false)
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-900 border border-white/10 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image with checkered background for transparency */}
        <div className="relative" style={{
          backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}>
          {design.image_url && (
            <img 
              src={design.image_url} 
              alt={design.name}
              className="w-full max-h-[60vh] object-contain"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        
        {/* Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{design.name}</h2>
            <ScoreBadge score={design.score} />
          </div>
          
          {design.concept && (
            <p className="text-gray-400">{design.concept}</p>
          )}
          
          {design.prompt && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-300">
                View prompt
              </summary>
              <p className="mt-2 p-2 bg-black/30 rounded text-gray-400 font-mono text-xs">
                {design.prompt}
              </p>
            </details>
          )}
          
          <div className="flex items-center gap-4 pt-2">
            <StatusBadge status={design.status} />
            <span className="text-sm text-gray-500">
              {new Date(design.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {/* Approve/Deny buttons */}
          {design.status === 'pending' && (
            <div className="flex gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={updating}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={updating}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          )}
          
          {design.status === 'approved' && (
            <div className="flex gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => handleStatusChange('printed')}
                disabled={updating}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                🖨️ Mark as Printed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DesignsClient({ designs: initialDesigns }: { designs: TshirtDesign[] }) {
  const [designs, setDesigns] = useState(initialDesigns)
  const [selectedDesign, setSelectedDesign] = useState<TshirtDesign | null>(null)
  const router = useRouter()
  
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/designs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      
      if (res.ok) {
        // Update local state
        setDesigns(prev => prev.map(d => 
          d.id === id ? { ...d, status } : d
        ))
        if (selectedDesign?.id === id) {
          setSelectedDesign(prev => prev ? { ...prev, status } : null)
        }
        router.refresh()
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }
  
  const stats = {
    total: designs.length,
    pending: designs.filter(d => d.status === 'pending').length,
    approved: designs.filter(d => d.status === 'approved').length,
    printed: designs.filter(d => d.status === 'printed').length,
    avgScore: designs.length > 0 
      ? (designs.reduce((sum, d) => sum + d.score, 0) / designs.length).toFixed(1)
      : '0',
  }
  
  return (
    <div className="space-y-6">
      {/* Lightbox Modal */}
      {selectedDesign && (
        <Lightbox 
          design={selectedDesign} 
          onClose={() => setSelectedDesign(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🦖 T-Shirt Designs</h1>
          <p className="text-sm text-gray-400">Design pipeline for Jurassic Apparel</p>
        </div>
        <Link href="/jurassic" className="text-sm text-blue-400 hover:underline">
          ← Back to Jurassic
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="bg-yellow-900/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
          <div className="text-sm text-gray-400">Approved</div>
        </div>
        <div className="bg-blue-900/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.printed}</div>
          <div className="text-sm text-gray-400">Printed</div>
        </div>
        <div className="bg-purple-900/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.avgScore}</div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </div>
      </div>
      
      {/* Designs Grid */}
      <div className="bg-neutral-800/50 rounded-lg">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="font-semibold text-white">All Designs</h2>
        </div>
        
        {designs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No designs yet. Start generating!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {designs.map((design) => (
              <div 
                key={design.id} 
                className="bg-neutral-800 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all cursor-pointer group"
                onClick={() => design.image_url && setSelectedDesign(design)}
              >
                {/* Square image container with checkered bg for transparency */}
                <div 
                  className="aspect-square flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                  }}
                >
                  {design.image_url ? (
                    <img 
                      src={design.image_url} 
                      alt={design.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-4xl">🎨</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white truncate text-sm">{design.name}</h3>
                    <ScoreBadge score={design.score} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <StatusBadge status={design.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
