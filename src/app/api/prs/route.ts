import { NextResponse } from 'next/server'

const repos = [
  'bchipper88/christmas',
  'bchipper88/lv-directory',
  'bchipper88/savannah-directory',
  'bchipper88/denver-directory',
]

interface GitHubPR {
  number: number
  title: string
  user: { login: string }
  state: string
  mergeable: boolean | null
  created_at: string
  html_url: string
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  
  if (!token) {
    // Return mock data if no token
    return NextResponse.json({
      prs: [],
      error: 'GITHUB_TOKEN not configured'
    })
  }

  try {
    const allPrs = await Promise.all(
      repos.map(async (repo) => {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/pulls?state=open`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
            next: { revalidate: 60 }, // Cache for 1 minute
          }
        )
        
        if (!res.ok) return []
        
        const prs: GitHubPR[] = await res.json()
        return prs.map((pr) => ({
          repo,
          number: pr.number,
          title: pr.title,
          author: pr.user.login,
          state: pr.state,
          mergeable: pr.mergeable,
          createdAt: pr.created_at,
          url: pr.html_url,
        }))
      })
    )

    return NextResponse.json({
      prs: allPrs.flat().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    })
  } catch (error) {
    return NextResponse.json({
      prs: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
