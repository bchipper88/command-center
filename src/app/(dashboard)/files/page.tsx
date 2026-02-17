import { supabase } from '@/lib/supabase'
import { FilesClient } from './files-client'

export const dynamic = 'force-dynamic'

export default async function FilesPage() {
  const { data: files } = await supabase
    .from('source_files')
    .select('*')
    .order('path')

  return <FilesClient files={files || []} />
}
