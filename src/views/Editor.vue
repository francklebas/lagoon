<template>
  <div class="app" :class="{ dark: isDark }">
    <header class="header">
      <h1>Lagoon</h1>
      <div class="actions">
        <button @click="toggleTheme" class="btn" title="Toggle theme">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <button @click="showHistory = !showHistory" class="btn" title="History">
          📜
        </button>
        <button @click="exportMarkdown" class="btn" title="Download notes.md">
          📄 MD
        </button>
        <button @click="exportHTML" class="btn" title="Export HTML">
          📄 HTML
        </button>
        <button @click="exportZip" class="btn" title="Download full repository">
          📦 ZIP
        </button>
        <button @click="swichtIsEditing" class="btn" title="Download full repository">
          📦 SWITCH EDIT ONLY MODE
        </button>
        <span v-if="isSaving" class="saving-indicator">💾 Saving...</span>
      </div>
    </header>
    
    <main class="main">
      <div v-if="showHistory" class="history-panel">
        <div class="history-header">
          <h2>Change History</h2>
          <button @click="showHistory = false" class="close-btn">✕</button>
        </div>
        <div class="commits-list">
          <div 
            v-for="commit in commits" 
            :key="commit.oid"
            class="commit-item"
            @click="restoreCommit(commit.oid)"
          >
            <div class="commit-message">{{ commit.commit.message }}</div>
            <div class="commit-meta">
              <span>{{ commit.commit.author.name }}</span>
              <span>{{ formatDate(commit.commit.author.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pane">
        <Editor 
          v-model="markdown" 
          @scroll="handleEditorScroll"
        />
      </div>
      
      <div class="divider" />
      
      <div class="pane" v-if="!isEditing">
        <Preview 
          :html="renderedHTML"
          ref="previewRef"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Editor from '../components/Editor.vue'
import Preview from '../components/Preview.vue'
import {
  initRepo,
  fileExists,
  readFile,
  writeFile,
  commitFile,
  getCommitHistory,
  checkoutCommit,
  exportRepo,
  FILE_PATH
} from '../utils/git'

const isEditing = ref(false)
const markdown = ref('')
const isGitReady = ref(false)
const commits = ref<Array<any>>([])
const showHistory = ref(false)
const isSaving = ref(false)

const isDark = ref(false)
const previewRef = ref<InstanceType<typeof Preview>>()

// Autosave timer
let saveTimeout: number | undefined

// Initialize Git repo and load content
onMounted(async () => {
  await initRepo()
  
  // Load from Git or localStorage
  if (await fileExists(FILE_PATH)) {
    markdown.value = await readFile(FILE_PATH)
  } else {
    // Check localStorage fallback
    const saved = localStorage.getItem('markdown-editor-content')
    if (saved) {
      markdown.value = saved
    } else {
      // Default content for new users
      markdown.value = `# My Notes\n\nWelcome to your personal Markdown editor!\n\n## Features\n\n- 📝 Automatic save with Git history\n- 🎨 Light/dark theme\n- 📄 Export your notes\n- 🔄 Change history\n\nStart writing...`
    }
    // Create initial file
    await writeFile(FILE_PATH, markdown.value)
    await commitFile(FILE_PATH, 'Initial commit')
  }
  
  isGitReady.value = true
  await loadCommitHistory()
})

// Watch for changes and autosave
watch(markdown, (newValue) => {
  if (!isGitReady.value) return
  
  // Save to localStorage immediately
  localStorage.setItem('markdown-editor-content', newValue)
  
  // Debounce Git save
  clearTimeout(saveTimeout)
  isSaving.value = true
  
  saveTimeout = setTimeout(async () => {
    await writeFile(FILE_PATH, newValue)
    await commitFile(FILE_PATH, `Autosave @${new Date().toLocaleString()}`)
    await loadCommitHistory()
    isSaving.value = false
  }, 2000) // 2 second debounce
})

const swichtIsEditing = () => isEditing.value = !isEditing.value

const renderedHTML = computed(() => {
  const html = marked(markdown.value) as string
  return DOMPurify.sanitize(html)
})

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const handleEditorScroll = (ratio: number) => {
  previewRef.value?.scrollToRatio(ratio)
}

const loadCommitHistory = async () => {
  commits.value = await getCommitHistory()
}

const restoreCommit = async (oid: string) => {
  const content = await checkoutCommit(oid)
  if (content) {
    markdown.value = content
    showHistory.value = false
  }
}

const exportMarkdown = () => {
  const blob = new Blob([markdown.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'notes.md'
  a.click()
  URL.revokeObjectURL(url)
}

const exportZip = async () => {
  const blob = await exportRepo()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'markdown-editor-repo.zip'
  a.click()
  URL.revokeObjectURL(url)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

const exportHTML = () => {
  const fullHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin-left: 0;
      color: #666;
    }
    a {
      color: #0066cc;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${renderedHTML.value}
</body>
</html>`

  const blob = new Blob([fullHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'export.html'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style>
:root {
  --editor-bg: #ffffff;
  --editor-text: #333333;
  --preview-bg: #ffffff;
  --preview-text: #333333;
  --header-bg: #f5f5f5;
  --divider-color: #e0e0e0;
  --code-bg: #f4f4f4;
  --blockquote-border: #ddd;
  --blockquote-text: #666;
  --link-color: #0066cc;
  --table-border: #ddd;
  --table-header-bg: #f5f5f5;
}

.app.dark {
  --editor-bg: #1e1e1e;
  --editor-text: #d4d4d4;
  --preview-bg: #252526;
  --preview-text: #d4d4d4;
  --header-bg: #2d2d30;
  --divider-color: #3e3e42;
  --code-bg: #2d2d30;
  --blockquote-border: #4e4e52;
  --blockquote-text: #9e9e9e;
  --link-color: #4fc1ff;
  --table-border: #3e3e42;
  --table-header-bg: #2d2d30;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--editor-bg);
  color: var(--editor-text);
  transition: background-color 0.3s, color 0.3s;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--divider-color);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--divider-color);
  background-color: var(--editor-bg);
  color: var(--editor-text);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: var(--header-bg);
}

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.pane {
  flex: 1;
  overflow: hidden;
}

.divider {
  width: 1px;
  background-color: var(--divider-color);
}

.saving-indicator {
  font-size: 12px;
  color: var(--link-color);
  margin-left: 1rem;
}

.history-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--editor-bg);
  z-index: 10;
  padding: 2rem;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--editor-text);
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: var(--divider-color);
}

.commits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.commit-item {
  padding: 1rem;
  background-color: var(--header-bg);
  border: 1px solid var(--divider-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.commit-item:hover {
  background-color: var(--preview-bg);
}

.commit-message {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.commit-meta {
  font-size: 12px;
  color: var(--blockquote-text);
  display: flex;
  gap: 1rem;
}
</style>
