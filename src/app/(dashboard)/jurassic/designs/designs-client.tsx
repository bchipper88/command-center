'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    printed: 'bg-blue-100 text-blue-800',
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-gray-100 text-gray-800'
  if (score >= 8) color = 'bg-green-100 text-green-800'
  else if (score >= 6) color = 'bg-yellow-100 text-yellow-800'
  else color = 'bg-red-100 text-red-800'
  
  return (
    <span className={`px-2 py-1 text-sm font-bold rounded ${color}`}>
      {score}/10
    </span>
  )
}

function Lightbox({ 
  design, 
  onClose 
}: { 
  design: TshirtDesign
  onClose: () => void 
}) {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative">
          {design.image_url && (
            <img 
              src={design.image_url} 
              alt={design.name}
              className="w-full max-h-[70vh] object-contain bg-gray-100"
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
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{design.name}</h2>
            <ScoreBadge score={design.score} />
          </div>
          
          {design.concept && (
            <p className="text-gray-600">{design.concept}</p>
          )}
          
          {design.prompt && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                View prompt
              </summary>
              <p className="mt-2 p-2 bg-gray-50 rounded text-gray-600 font-mono text-xs">
                {design.prompt}
              </p>
            </details>
          )}
          
          <div className="flex items-center gap-4 pt-2">
            <StatusBadge status={design.status} />
            <span className="text-sm text-gray-400">
              {new Date(design.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DesignsClient({ designs }: { designs: TshirtDesign[] }) {
  const [selectedDesign, setSelectedDesign] = useState<TshirtDesign | null>(null)
  
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
                className="bg-neutral-800 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all cursor-pointer"
                onClick={() => design.image_url && setSelectedDesign(design)}
              >
                {/* Square image container */}
                <div className="aspect-square bg-neutral-900 flex items-center justify-center overflow-hidden">
                  {design.image_url ? (
                    <img 
                      src={design.image_url} 
                      alt={design.name}
                      className="w-full h-full object-contain"
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
                  
                  {design.concept && (
                    <p className="text-xs text-gray-400 line-clamp-1">{design.concept}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
