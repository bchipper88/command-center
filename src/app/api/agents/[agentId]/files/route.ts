import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Map agent IDs to workspace paths
const WORKSPACE_MAP: Record<string, string> = {
  'reviewer': '/home/ubuntu/.openclaw/workspace-reviewer',
  'christmas': '/home/ubuntu/.openclaw/workspace-christmas',
  'savannah-directory': '/home/ubuntu/.openclaw/workspace-savannah-directory',
  'lv-directory': '/home/ubuntu/.openclaw/workspace-lv-directory',
  'denver-directory': '/home/ubuntu/.openclaw/workspace-denver-directory',
  'jurassic': '/home/ubuntu/.openclaw/workspace-jurassic',
}

const STANDARD_FILES = ['SOUL.md', 'HEARTBEAT.md', 'AGENTS.md', 'TOOLS.md', 'KEYWORDS.md']

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const agentId = params.agentId
    const workspacePath = WORKSPACE_MAP[agentId]
    
    if (!workspacePath) {
      return NextResponse.json({ error: 'Agent workspace not found' }, { status: 404 })
    }

    const files = []
    
    for (const filename of STANDARD_FILES) {
      try {
        const filePath = join(workspacePath, filename)
        const content = await readFile(filePath, 'utf-8')
        files.push({
          name: filename,
          content,
          size: content.length,
        })
      } catch {
        // File doesn't exist, skip it
        continue
      }
    }

    return NextResponse.json({ files, workspacePath })
  } catch (error) {
    console.error('Error reading workspace files:', error)
    return NextResponse.json({ error: 'Failed to read workspace files' }, { status: 500 })
  }
}
