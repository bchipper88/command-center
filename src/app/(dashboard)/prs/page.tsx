import { PrsClient } from './prs-client'

export const dynamic = 'force-dynamic'

// PRs are fetched client-side via GitHub API proxy
export default function PrsPage() {
  return <PrsClient />
}
