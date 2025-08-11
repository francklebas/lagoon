import { 
  readFile, 
  writeFile, 
  commitFile, 
  REPO_DIR 
} from './git'
import FS from '@isomorphic-git/lightning-fs'

const fs = new FS('markdown-editor-fs')
const pfs = fs.promises

export const NOTES_DIR = 'notes'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export async function initNotesDir(): Promise<void> {
  try {
    await pfs.mkdir(`${REPO_DIR}/${NOTES_DIR}`)
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating notes directory:', error)
    }
  }
}

export async function getAllNotes(): Promise<Note[]> {
  try {
    const files = await pfs.readdir(`${REPO_DIR}/${NOTES_DIR}`)
    const notes: Note[] = []
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await readFile(`${NOTES_DIR}/${file}`)
        const stats = await pfs.stat(`${REPO_DIR}/${NOTES_DIR}/${file}`)
        
        // Extract title from first line or use filename
        const lines = content.split('\n')
        let title = file.replace('.md', '')
        
        if (lines[0] && lines[0].startsWith('# ')) {
          title = lines[0].substring(2).trim()
        }
        
        notes.push({
          id: file.replace('.md', ''),
          title,
          content,
          createdAt: new Date(stats.ctimeMs || stats.mtimeMs),
          updatedAt: new Date(stats.mtimeMs)
        })
      }
    }
    
    return notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  } catch (error) {
    console.error('Error getting notes:', error)
    return []
  }
}

export async function getNote(id: string): Promise<Note | null> {
  try {
    const content = await readFile(`${NOTES_DIR}/${id}.md`)
    const stats = await pfs.stat(`${REPO_DIR}/${NOTES_DIR}/${id}.md`)
    
    // Extract title from first line
    const lines = content.split('\n')
    let title = id
    
    if (lines[0] && lines[0].startsWith('# ')) {
      title = lines[0].substring(2).trim()
    }
    
    return {
      id,
      title,
      content,
      createdAt: new Date(stats.ctimeMs || stats.mtimeMs),
      updatedAt: new Date(stats.mtimeMs)
    }
  } catch (error) {
    console.error('Error getting note:', error)
    return null
  }
}

export async function saveNote(id: string, content: string): Promise<void> {
  const filepath = `${NOTES_DIR}/${id}.md`
  await writeFile(filepath, content)
  await commitFile(filepath, `Update note: ${id}`)
}

export async function createNote(title: string = 'New Note'): Promise<string> {
  const id = `note-${Date.now()}`
  const content = `# ${title}\n\n`
  const filepath = `${NOTES_DIR}/${id}.md`
  
  await writeFile(filepath, content)
  await commitFile(filepath, `Create note: ${title}`)
  
  return id
}

export async function deleteNote(id: string): Promise<void> {
  try {
    const filepath = `${NOTES_DIR}/${id}.md`
    await pfs.unlink(`${REPO_DIR}/${filepath}`)
    
    // Import git functions for deletion
    const git = await import('isomorphic-git')
    await git.remove({ fs, dir: REPO_DIR, filepath })
    await git.commit({
      fs,
      dir: REPO_DIR,
      message: `Delete note: ${id}`,
      author: {
        name: 'Anonymous',
        email: 'anonymous@localhost'
      }
    })
  } catch (error) {
    console.error('Error deleting note:', error)
  }
}

export async function migrateExistingNotes(): Promise<void> {
  try {
    // Check if old notes.md exists
    const oldNotesPath = `${REPO_DIR}/notes.md`
    try {
      const oldContent = await pfs.readFile(oldNotesPath, 'utf8') as string
      if (oldContent) {
        // Create first note from existing content
        await initNotesDir()
        await writeFile(`${NOTES_DIR}/note-1.md`, oldContent)
        await commitFile(`${NOTES_DIR}/note-1.md`, 'Migrate existing notes')
        
        // Optionally remove old file
        await pfs.unlink(oldNotesPath)
      }
    } catch (e) {
      // No existing notes.md, that's fine
    }
  } catch (error) {
    console.error('Error migrating notes:', error)
  }
}