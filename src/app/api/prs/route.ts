import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { data: prs, error } = await supabase
      .from('github_prs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ prs: [], error: error.message })
    }

    return NextResponse.json({
      prs: prs.map(pr => ({
        repo: pr.repo,
        number: pr.number,
        title: pr.title,
        author: pr.author,
        state: pr.state,
        mergeable: pr.mergeable,
        mergeStateStatus: pr.merge_state_status,
        createdAt: pr.created_at,
        url: pr.url,
      }))
    })
  } catch (error) {
    return NextResponse.json({
      prs: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
