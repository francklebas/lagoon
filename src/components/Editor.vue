<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    @scroll="handleScroll"
    class="editor"
    placeholder="Écrivez votre Markdown ici..."
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'scroll': [ratio: number]
}>()

const handleScroll = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const ratio = target.scrollTop / (target.scrollHeight - target.clientHeight)
  emit('scroll', ratio)
}
</script>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  padding: 1rem;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  background-color: var(--editor-bg);
  color: var(--editor-text);
}
</style>