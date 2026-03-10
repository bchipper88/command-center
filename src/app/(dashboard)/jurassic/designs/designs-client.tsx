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
  final_image_url: string | null
  score: number
  status: string
  notes: string | null
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    regenerating: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
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
  onStatusChange: (id: string, status: string, feedback?: string) => void
}) {
  const [updating, setUpdating] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [feedback, setFeedback] = useState('')
  
  const handleStatusChange = async (status: string, feedbackText?: string) => {
    setUpdating(true)
    await onStatusChange(design.id, status, feedbackText)
    setUpdating(false)
    setShowRejectForm(false)
    setFeedback('')
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-900 border border-white/10 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image comparison - side by side if final exists */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
          
          {design.final_image_url ? (
            // Side-by-side comparison
            <div className="grid grid-cols-2 gap-1">
              <div className="relative" style={{
                backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
              }}>
                <div className="absolute top-2 left-2 bg-black/70 text-gray-400 text-xs px-2 py-1 rounded">Draft (Mini)</div>
                {design.image_url && (
                  <img src={design.image_url} alt={`${design.name} draft`} className="w-full aspect-square object-contain" />
                )}
              </div>
              <div className="relative" style={{
                backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
              }}>
                <div className="absolute top-2 left-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded">Final (1.5 High)</div>
                <img src={design.final_image_url} alt={`${design.name} final`} className="w-full aspect-square object-contain" />
              </div>
            </div>
          ) : (
            // Single image (draft only)
            <div style={{
              backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}>
              {design.image_url && (
                <img src={design.image_url} alt={design.name} className="w-full max-h-[60vh] object-contain" />
              )}
            </div>
          )}
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
          {design.status === 'pending' && !showRejectForm && (
            <div className="flex gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => handleStatusChange('regenerating')}
                disabled={updating}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                ✓ Approve & Generate 1.5
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={updating}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          )}
          
          {/* Reject feedback form */}
          {design.status === 'pending' && showRejectForm && (
            <div className="pt-3 border-t border-white/10 space-y-3">
              <label className="block">
                <span className="text-sm text-gray-400">Feedback <span className="text-gray-600">(optional)</span></span>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What would you change? Leave blank to reject without feedback."
                  className="mt-1 w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                  rows={2}
                />
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange('rejected', feedback || undefined)}
                  disabled={updating}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {updating ? 'Rejecting...' : '✕ Reject'}
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setFeedback(''); }}
                  disabled={updating}
                  className="py-2 px-4 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {design.status === 'regenerating' && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center gap-3 text-purple-400">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating 1.5 High version...</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Bellatrix is regenerating this design at full quality. Check back shortly.</p>
            </div>
          )}
          
          {design.status === 'approved' && (
            <div className="flex gap-3 pt-3 border-t border-white/10">
              {(design.final_image_url || design.image_url) && (
                <a
                  href={`${design.final_image_url || design.image_url}?fl_attachment=${design.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors text-center"
                >
                  ⬇️ Download {design.final_image_url ? 'Final' : 'Draft'}
                </a>
              )}
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
  
  const handleStatusChange = async (id: string, status: string, feedback?: string) => {
    try {
      const res = await fetch('/api/designs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, feedback })
      })
      
      if (res.ok) {
        // Update local state
        const newNotes = feedback ? `FEEDBACK: ${feedback}` : undefined
        setDesigns(prev => prev.map(d => 
          d.id === id ? { ...d, status, notes: newNotes || d.notes } : d
        ))
        if (selectedDesign?.id === id) {
          setSelectedDesign(prev => prev ? { ...prev, status, notes: newNotes || prev.notes } : null)
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
    regenerating: designs.filter(d => d.status === 'regenerating').length,
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
