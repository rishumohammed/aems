<template>
  <div class="video-lesson-form">
    <v-text-field
      v-model="url"
      label="Video URL (YouTube or Vimeo)"
      placeholder="https://www.youtube.com/watch?v=..."
      variant="outlined"
      rounded="lg"
      class="mb-4"
      :loading="loading"
      prepend-inner-icon="mdi-video-plus-outline"
      @update:model-value="onUrlChange"
    >
      <template v-slot:append-inner>
        <v-icon v-if="isValid" color="success">mdi-check-circle</v-icon>
      </template>
    </v-text-field>

    <div v-if="metadata" class="metadata-preview pa-4 bg-grey-lighten-4 rounded-lg mb-4">
      <div class="d-flex gap-4">
        <v-img :src="metadata.thumbnail_url" width="120" height="68" cover class="rounded flex-shrink-0 bg-black"></v-img>
        <div class="min-width-0">
          <div class="text-subtitle-2 font-weight-bold line-clamp-1">{{ metadata.title }}</div>
          <div class="text-caption text-grey">Source: {{ metadata.source }} | ID: {{ metadata.video_id }}</div>
        </div>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ video_source: '', video_id: '', title: '', thumbnail_url: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'metadata-fetched'])
const api = useApi()

const url = ref('')
const loading = ref(false)
const error = ref(null)
const metadata = ref(null)
const isValid = ref(false)

// Reconstruct standard video URL from source and ID
const getVideoUrl = (source, id) => {
  if (!id) return ''
  if (id.startsWith('http://') || id.startsWith('https://')) return id
  if (source === 'youtube') return `https://www.youtube.com/watch?v=${id}`
  if (source === 'vimeo') return `https://vimeo.com/${id}`
  return id
}

// Synchronize local input state and metadata preview with modelValue
const syncFromProps = () => {
  const currentId = props.modelValue?.video_id
  const currentSource = props.modelValue?.video_source || 'youtube'

  if (currentId) {
    const expectedUrl = getVideoUrl(currentSource, currentId)
    if (!url.value || url.value !== expectedUrl) {
      url.value = expectedUrl
    }

    metadata.value = {
      source: currentSource,
      video_id: currentId,
      title: props.modelValue?.title || '',
      thumbnail_url: props.modelValue?.thumbnail_url || (
        currentSource === 'youtube'
          ? `https://img.youtube.com/vi/${currentId}/hqdefault.jpg`
          : ''
      )
    }
    isValid.value = true
    error.value = null
  } else if (!url.value) {
    metadata.value = null
    isValid.value = false
    error.value = null
  }
}

watch(
  () => [props.modelValue?.video_id, props.modelValue?.video_source, props.modelValue?.id],
  () => {
    syncFromProps()
  },
  { immediate: true }
)

// Debounced URL parser
let timeout = null
const onUrlChange = (val) => {
  if (timeout) clearTimeout(timeout)
  const trimmed = val ? val.trim() : ''

  if (!trimmed) {
    metadata.value = null
    isValid.value = false
    error.value = null
    emit('update:modelValue', {
      ...props.modelValue,
      video_source: '',
      video_id: '',
      thumbnail_url: ''
    })
    return
  }

  // If already matches current parsed video, avoid redundant fetch
  const currentExpected = getVideoUrl(props.modelValue?.video_source, props.modelValue?.video_id)
  if (trimmed === currentExpected && metadata.value) {
    return
  }

  timeout = setTimeout(async () => {
    loading.value = true
    error.value = null
    try {
      const { data: res } = await api.post('/lms/parse-video-url', { url: trimmed })
      const resolvedThumbnail = res.thumbnail_url || (res.source === 'youtube' ? `https://img.youtube.com/vi/${res.id}/hqdefault.jpg` : '')

      metadata.value = {
        source: res.source,
        video_id: res.id,
        title: res.title || props.modelValue?.title || '',
        thumbnail_url: resolvedThumbnail
      }
      isValid.value = true

      emit('update:modelValue', {
        ...props.modelValue,
        video_source: res.source,
        video_id: res.id,
        // Preserve user's existing title if already provided
        title: props.modelValue?.title?.trim() ? props.modelValue.title : (res.title || ''),
        thumbnail_url: resolvedThumbnail
      })
      emit('metadata-fetched', res)
    } catch (e) {
      error.value = 'Could not parse video URL. Please check if it is a valid YouTube or Vimeo link.'
      isValid.value = false
      metadata.value = null
    } finally {
      loading.value = false
    }
  }, 600)
}
</script>

<style scoped>
.gap-4 { gap: 16px; }
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
