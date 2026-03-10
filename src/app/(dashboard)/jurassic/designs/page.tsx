import { supabase, TshirtDesign } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDesigns() {
  const { data: designs } = await supabase
    .from('tshirt_designs')
    .select('*')
    .order('score', { ascending: false })
  
  return designs as TshirtDesign[] || []
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

export default async function DesignsPage() {
  const designs = await getDesigns()
  
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🦖 T-Shirt Designs</h1>
          <p className="text-sm text-gray-500">Design pipeline for Jurassic Apparel</p>
        </div>
        <Link href="/jurassic" className="text-sm text-blue-600 hover:underline">
          ← Back to Jurassic
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending Review</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.printed}</div>
          <div className="text-sm text-gray-500">Printed</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-700">{stats.avgScore}</div>
          <div className="text-sm text-gray-500">Avg Score</div>
        </div>
      </div>
      
      {/* Designs Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold">All Designs</h2>
        </div>
        
        {designs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No designs yet. Start generating!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {designs.map((design) => (
              <div 
                key={design.id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image placeholder or actual image */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {design.image_url ? (
                    <img 
                      src={design.image_url} 
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🎨</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{design.name}</h3>
                    <ScoreBadge score={design.score} />
                  </div>
                  
                  {design.concept && (
                    <p className="text-sm text-gray-600 line-clamp-2">{design.concept}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <StatusBadge status={design.status} />
                    <span className="text-xs text-gray-400">
                      {new Date(design.created_at).toLocaleDateString()}
                    </span>
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
