import { supabase, SourceFile } from '@/lib/supabase'
import { FilesClient } from './files-client'

export const dynamic = 'force-dynamic'

export default async function FilesPage() {
  const { data: files } = await supabase
    .from('source_files')
    .select('*')
    .order('path') as unknown as { data: SourceFile[] | null }

  return <FilesClient files={files || []} />
}
