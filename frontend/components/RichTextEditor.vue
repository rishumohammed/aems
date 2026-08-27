<template>
  <div class="rich-text-editor border rounded-lg overflow-hidden bg-white">
    <div class="editor-toolbar bg-grey-lighten-4 border-b px-2 py-1 d-flex gap-1 flex-wrap align-center" v-if="editor">
      <v-btn icon="mdi-format-bold" variant="text" size="small" :color="editor.isActive('bold') ? 'primary' : 'default'" @click="editor.chain().focus().toggleBold().run()"></v-btn>
      <v-btn icon="mdi-format-italic" variant="text" size="small" :color="editor.isActive('italic') ? 'primary' : 'default'" @click="editor.chain().focus().toggleItalic().run()"></v-btn>
      <v-btn icon="mdi-format-underline" variant="text" size="small" :color="editor.isActive('underline') ? 'primary' : 'default'" @click="editor.chain().focus().toggleUnderline().run()"></v-btn>
      
      <v-divider vertical class="mx-1"></v-divider>
      
      <v-btn icon="mdi-format-list-bulleted" variant="text" size="small" :color="editor.isActive('bulletList') ? 'primary' : 'default'" @click="editor.chain().focus().toggleBulletList().run()"></v-btn>
      <v-btn icon="mdi-format-list-numbered" variant="text" size="small" :color="editor.isActive('orderedList') ? 'primary' : 'default'" @click="editor.chain().focus().toggleOrderedList().run()"></v-btn>
      
      <v-divider vertical class="mx-1"></v-divider>
      
      <v-btn icon="mdi-format-header-1" variant="text" size="small" :color="editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"></v-btn>
      <v-btn icon="mdi-format-header-2" variant="text" size="small" :color="editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"></v-btn>
      <v-btn icon="mdi-format-header-3" variant="text" size="small" :color="editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"></v-btn>
      
      <v-divider vertical class="mx-1"></v-divider>
      
      <v-btn icon="mdi-format-quote-close" variant="text" size="small" :color="editor.isActive('blockquote') ? 'primary' : 'default'" @click="editor.chain().focus().toggleBlockquote().run()"></v-btn>
      <v-btn icon="mdi-link" variant="text" size="small" :color="editor.isActive('link') ? 'primary' : 'default'" @click="setLink"></v-btn>
      <v-btn icon="mdi-link-off" variant="text" size="small" v-if="editor.isActive('link')" @click="editor.chain().focus().unsetLink().run()"></v-btn>
    </div>
    
    <div v-if="!editor" class="pa-4 text-center text-grey">
      <v-progress-circular indeterminate color="primary" size="24" class="mr-2"></v-progress-circular>
      Loading editor...
    </div>

    <editor-content v-if="editor" :editor="editor" class="editor-content pa-4" />
  </div>
</template>

<script setup>
import { shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = shallowRef(null)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      })
    ],
    onUpdate: () => {
      if (editor.value) {
        emit('update:modelValue', editor.value.getHTML())
      }
    }
  })
})

watch(() => props.modelValue, (value) => {
  if (!editor.value) return
  const isSame = editor.value.getHTML() === value
  if (!isSame) {
    editor.value.commands.setContent(value, false)
  }
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

const setLink = () => {
  if (!editor.value) return
  
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  // cancelled
  if (url === null) {
    return
  }

  // empty
  if (url === '') {
    editor.value
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run()
    return
  }

  // update link
  editor.value
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run()
}
</script>

<style>
.editor-content {
  min-height: 250px;
  max-height: 600px;
  overflow-y: auto;
}
.editor-content .ProseMirror {
  outline: none;
  min-height: 250px;
}
.editor-content .ProseMirror p {
  margin-bottom: 1em;
}
.editor-content .ProseMirror ul, .editor-content .ProseMirror ol {
  padding-left: 1.5em;
  margin-bottom: 1em;
}
.editor-content .ProseMirror h1, .editor-content .ProseMirror h2, .editor-content .ProseMirror h3 {
  margin-bottom: 0.5em;
  margin-top: 1em;
}
.editor-content .ProseMirror blockquote {
  border-left: 3px solid rgba(0, 0, 0, 0.1);
  padding-left: 1rem;
  margin-left: 0;
  font-style: italic;
  color: #666;
}
.editor-content .ProseMirror a {
  color: #1976D2;
  cursor: pointer;
  text-decoration: underline;
}
</style>
