import { supabase } from '@/lib/supabase'
import { DirectoriesClient } from './directories-client'

export const dynamic = 'force-dynamic'

export default async function DirectoriesPage() {
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .order('name')

  const { data: sites } = await supabase.from('sites').select('id, name')

  return <DirectoriesClient businesses={businesses || []} sites={sites || []} />
}
