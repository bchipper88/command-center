'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Access denied')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏰</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">COMMAND CENTER</h1>
          <p className="text-sm text-neutral-500 font-mono mt-1">AUTHORIZATION REQUIRED</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card rounded-lg p-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code..."
              className="w-full bg-transparent px-4 py-3 text-white font-mono text-sm focus:outline-none placeholder:text-neutral-600"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm font-mono text-center">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-neutral-600 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-red-600 pulse-dot"></span>
            SYSTEM ACTIVE
          </div>
        </div>
      </div>
    </div>
  )
}
