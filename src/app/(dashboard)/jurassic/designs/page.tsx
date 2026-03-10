import { supabase, TshirtDesign } from '@/lib/supabase'
import { DesignsClient } from './designs-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDesigns() {
  const { data: designs } = await supabase
    .from('tshirt_designs')
    .select('*')
    .order('score', { ascending: false })
  
  return designs as TshirtDesign[] || []
}

export default async function DesignsPage() {
  const designs = await getDesigns()
  return <DesignsClient designs={designs} />
}
