<template>
  <div class="app" :class="{ dark: isDark }">
    <header class="header">
      <h1>Markdown Editor</h1>
      <div class="actions">
        <button @click="toggleTheme" class="btn">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <button @click="exportHTML" class="btn">
          Export HTML
        </button>
      </div>
    </header>
    
    <main class="main">
      <div class="pane">
        <Editor 
          v-model="markdown" 
          @scroll="handleEditorScroll"
        />
      </div>
      
      <div class="divider" />
      
      <div class="pane">
        <Preview 
          :html="renderedHTML"
          ref="previewRef"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Editor from './components/Editor.vue'
import Preview from './components/Preview.vue'

const markdown = ref(`# Bienvenue dans l'éditeur Markdown

Ceci est un **éditeur Markdown** simple et efficace.

## Fonctionnalités

- 🎨 Thème clair/sombre
- 📝 Aperçu en temps réel
- 📄 Export HTML
- 🔄 Scroll synchronisé

### Syntaxe Markdown supportée

Vous pouvez utiliser :

1. **Texte en gras**
2. *Texte en italique*
3. \`Code inline\`
4. [Liens](https://example.com)

\`\`\`javascript
// Blocs de code
function hello() {
  console.log('Hello, world!')
}
\`\`\`

> Les citations sont également supportées

---

Profitez de l'éditeur !`)

const isDark = ref(false)
const previewRef = ref<InstanceType<typeof Preview>>()

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
</style>