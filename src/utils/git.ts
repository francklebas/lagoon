import git from 'isomorphic-git'
import FS from '@isomorphic-git/lightning-fs'

// Buffer polyfill for browser
import { Buffer } from 'buffer'
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer
}

const fs = new FS('markdown-editor-fs')
const pfs = fs.promises

const REPO_DIR = '/repo'
const FILE_PATH = 'notes.md'
const AUTHOR = {
  name: 'Anonymous',
  email: 'anonymous@localhost'
}

export async function initRepo(): Promise<void> {
  try {
    // Ensure directory exists
    try {
      await pfs.mkdir(REPO_DIR, { recursive: true })
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error
      }
    }
    
    // Check if already a git repo
    const isGitRepo = await isGitRepository()
    if (!isGitRepo) {
      await git.init({ fs, dir: REPO_DIR })
    }
  } catch (error) {
    console.error('Error initializing repo:', error)
  }
}

export async function isGitRepository(): Promise<boolean> {
  try {
    await pfs.stat(`${REPO_DIR}/.git`)
    return true
  } catch {
    return false
  }
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await pfs.stat(`${REPO_DIR}/${filepath}`)
    return true
  } catch {
    return false
  }
}

export async function readFile(filepath: string): Promise<string> {
  try {
    const content = await pfs.readFile(`${REPO_DIR}/${filepath}`, { encoding: 'utf8' })
    return content as string
  } catch (error) {
    console.error('Error reading file:', error)
    return ''
  }
}

export async function writeFile(filepath: string, content: string): Promise<void> {
  try {
    await pfs.writeFile(`${REPO_DIR}/${filepath}`, content, { encoding: 'utf8' })
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

export async function commitFile(filepath: string, message: string): Promise<void> {
  try {
    await git.add({ fs, dir: REPO_DIR, filepath })
    await git.commit({
      fs,
      dir: REPO_DIR,
      message,
      author: AUTHOR
    })
  } catch (error) {
    console.error('Error committing file:', error)
  }
}

export async function getCommitHistory(): Promise<Array<{
  oid: string
  commit: {
    message: string
    author: {
      name: string
      timestamp: number
    }
  }
}>> {
  try {
    const commits = await git.log({ fs, dir: REPO_DIR })
    return commits
  } catch (error) {
    console.error('Error getting commit history:', error)
    return []
  }
}

export async function checkoutCommit(oid: string): Promise<string> {
  try {
    const { blob } = await git.readBlob({
      fs,
      dir: REPO_DIR,
      oid,
      filepath: FILE_PATH
    })
    return new TextDecoder().decode(blob)
  } catch (error) {
    console.error('Error checking out commit:', error)
    return ''
  }
}

export async function exportRepo(): Promise<Blob> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  
  async function addToZip(path: string, zipPath: string) {
    try {
      const stats = await pfs.stat(path)
      
      if (stats.isDirectory()) {
        const items = await pfs.readdir(path)
        for (const item of items) {
          await addToZip(`${path}/${item}`, `${zipPath}/${item}`)
        }
      } else {
        const content = await pfs.readFile(path)
        zip.file(zipPath, content)
      }
    } catch (error) {
      console.error(`Error adding ${path} to zip:`, error)
    }
  }
  
  await addToZip(REPO_DIR, 'markdown-editor-repo')
  
  return await zip.generateAsync({ type: 'blob' })
}

export { REPO_DIR, FILE_PATH }