import { supabase, Business } from '@/lib/supabase'
import { BusinessesClient } from './businesses-client'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const validSites = ['lv', 'denver', 'savannah']

export default async function BusinessesPage({ params }: { params: { siteId: string } }) {
  const { siteId } = params
  if (siteId === 'jurassic') redirect(`/site/jurassic`)
  if (!validSites.includes(siteId)) notFound()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('site_id', siteId)
    .order('category')
    .order('score', { ascending: false }) as unknown as { data: Business[] | null }

  return <BusinessesClient siteId={siteId} businesses={businesses || []} />
}
