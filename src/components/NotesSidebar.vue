<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>Notes</h2>
      <button @click="createNewNote" class="new-note-btn" title="Create new note">
        ➕
      </button>
    </div>
    
    <div class="notes-list">
      <div 
        v-for="note in notes" 
        :key="note.id"
        class="note-item"
        :class="{ active: note.id === activeNoteId }"
        @click="selectNote(note)"
      >
        <div class="note-content">
          <div class="note-title" :title="note.title">
            {{ note.title }}
          </div>
          <div class="note-meta">
            {{ formatDate(note.updatedAt) }}
          </div>
        </div>
        <div class="note-menu">
          <button 
            @click.stop="toggleMenu(note.id)" 
            class="menu-btn"
            title="More options"
          >
            ⋮
          </button>
          <div 
            v-if="openMenuId === note.id" 
            class="menu-dropdown"
          >
            <button 
              @click.stop="deleteNoteHandler(note)" 
              class="menu-item delete"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="notes.length === 0" class="empty-state">
        <p>No notes yet</p>
        <button @click="createNewNote" class="create-first-btn">
          Create your first note
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getAllNotes, createNote, deleteNote, type Note } from '../utils/notes'

defineProps<{
  activeNoteId?: string
}>()

const emit = defineEmits<{
  selectNote: [note: Note]
  createNote: [id: string]
  deleteNote: [id: string]
}>()

const notes = ref<Note[]>([])
const openMenuId = ref<string | null>(null)

const loadNotes = async () => {
  notes.value = await getAllNotes()
}

const selectNote = (note: Note) => {
  emit('selectNote', note)
}

const createNewNote = async () => {
  const id = await createNote()
  await loadNotes()
  const newNote = notes.value.find(n => n.id === id)
  if (newNote) {
    emit('createNote', id)
    selectNote(newNote)
  }
}

const toggleMenu = (noteId: string) => {
  openMenuId.value = openMenuId.value === noteId ? null : noteId
}

const deleteNoteHandler = async (note: Note) => {
  if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
    await deleteNote(note.id)
    emit('deleteNote', note.id)
    await loadNotes()
    openMenuId.value = null
  }
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.note-menu')) {
    openMenuId.value = null
  }
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      if (minutes === 0) return 'Just now'
      return `${minutes}m ago`
    }
    return `${hours}h ago`
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: new Date(date).getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

onMounted(() => {
  loadNotes()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  loadNotes
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100%;
  background-color: var(--sidebar-bg, #f9f9f9);
  border-right: 1px solid var(--divider-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dark .sidebar {
  --sidebar-bg: #1a1a1a;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--divider-color);
}

.sidebar-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.new-note-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.new-note-btn:hover {
  background-color: var(--divider-color);
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.note-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid transparent;
  position: relative;
}

.note-content {
  flex: 1;
  min-width: 0;
}

.note-item:hover {
  background-color: var(--hover-bg, #f0f0f0);
}

.dark .note-item:hover {
  --hover-bg: #2a2a2a;
}

.note-item.active {
  background-color: var(--active-bg, #e8e8e8);
  border-color: var(--link-color);
}

.dark .note-item.active {
  --active-bg: #333;
}

.note-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-meta {
  font-size: 0.75rem;
  color: var(--blockquote-text);
}

.note-menu {
  position: relative;
  opacity: 0;
  transition: opacity 0.2s;
}

.note-item:hover .note-menu,
.note-menu:has(.menu-dropdown) {
  opacity: 1;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: var(--editor-text);
  transition: background-color 0.2s;
  line-height: 1;
}

.menu-btn:hover {
  background-color: var(--divider-color);
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--editor-bg);
  border: 1px solid var(--divider-color);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 120px;
  margin-top: 0.25rem;
}

.dark .menu-dropdown {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--editor-text);
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: var(--hover-bg, #f0f0f0);
}

.dark .menu-item:hover {
  --hover-bg: #2a2a2a;
}

.menu-item.delete {
  color: #dc3545;
}

.menu-item:first-child {
  border-radius: 6px 6px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 6px 6px;
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--blockquote-text);
}

.empty-state p {
  margin-bottom: 1rem;
}

.create-first-btn {
  padding: 0.5rem 1rem;
  background-color: var(--link-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.create-first-btn:hover {
  opacity: 0.9;
}

/* Custom scrollbar */
.notes-list::-webkit-scrollbar {
  width: 6px;
}

.notes-list::-webkit-scrollbar-track {
  background: transparent;
}

.notes-list::-webkit-scrollbar-thumb {
  background-color: var(--divider-color);
  border-radius: 3px;
}

.notes-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--blockquote-text);
}
</style>