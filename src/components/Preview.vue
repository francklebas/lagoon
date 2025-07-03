<template>
  <div 
    ref="previewRef"
    class="preview"
    v-html="html"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  html: string
}>()

const previewRef = ref<HTMLDivElement>()

const scrollToRatio = (ratio: number) => {
  if (previewRef.value) {
    const maxScroll = previewRef.value.scrollHeight - previewRef.value.clientHeight
    previewRef.value.scrollTop = maxScroll * ratio
  }
}

defineExpose({
  scrollToRatio
})
</script>

<style scoped>
.preview {
  width: 100%;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  background-color: var(--preview-bg);
  color: var(--preview-text);
}

.preview :deep(h1) {
  font-size: 2em;
  margin: 0.67em 0;
}

.preview :deep(h2) {
  font-size: 1.5em;
  margin: 0.75em 0;
}

.preview :deep(h3) {
  font-size: 1.17em;
  margin: 0.83em 0;
}

.preview :deep(h4, h5, h6) {
  margin: 1em 0;
}

.preview :deep(p) {
  margin: 1em 0;
}

.preview :deep(code) {
  background-color: var(--code-bg);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.preview :deep(pre) {
  background-color: var(--code-bg);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.preview :deep(pre code) {
  padding: 0;
  background: none;
}

.preview :deep(blockquote) {
  border-left: 4px solid var(--blockquote-border);
  padding-left: 1em;
  margin-left: 0;
  color: var(--blockquote-text);
}

.preview :deep(ul, ol) {
  padding-left: 2em;
}

.preview :deep(a) {
  color: var(--link-color);
  text-decoration: none;
}

.preview :deep(a:hover) {
  text-decoration: underline;
}

.preview :deep(img) {
  max-width: 100%;
  height: auto;
}

.preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.preview :deep(th, td) {
  border: 1px solid var(--table-border);
  padding: 0.5em;
  text-align: left;
}

.preview :deep(th) {
  background-color: var(--table-header-bg);
}
</style>