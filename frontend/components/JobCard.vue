<template>
  <v-card
    class="job-card mb-4 pa-5 rounded-xl border"
    flat
    @click="navigateTo(`/jobs/${job.id}`)"
  >
    <div class="d-flex align-start gap-4">
      <!-- Company Logo / Icon -->
      <v-avatar color="grey-lighten-4" size="64" rounded="lg" class="border flex-shrink-0">
        <v-icon v-if="job.hide_company_name" color="primary" size="32">mdi-shield-lock-outline</v-icon>
        <img v-else-if="job.company_logo" :src="job.company_logo" :alt="job.company" style="width: 100%; height: 100%; object-fit: cover;" />
        <v-icon v-else color="grey-darken-1" size="32">mdi-office-building</v-icon>
      </v-avatar>
      
      <div class="flex-grow-1">
        <div class="d-flex flex-wrap justify-space-between align-start gap-2 mb-1">
          <div>
            <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-0">{{ job.title }}</h3>
            <div class="text-subtitle-2 font-weight-medium text-primary">
              {{ job.hide_company_name ? 'Confidential Organization' : (job.company || 'Direct Hiring') }}
            </div>
          </div>

          <div class="d-flex gap-2 align-center">
            <v-chip v-if="job.is_remote" size="x-small" color="blue" variant="flat" class="font-weight-bold text-uppercase">
              Remote
            </v-chip>
            <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold text-uppercase">
              {{ formatJobType(job.type) }}
            </v-chip>
          </div>
        </div>

        <div class="d-flex flex-wrap align-center gap-x-4 gap-y-2 text-caption text-grey-darken-1 my-3">
          <div v-if="job.location" class="d-flex align-center">
            <v-icon size="15" color="grey" class="mr-1">mdi-map-marker-outline</v-icon>
            {{ job.location }}
          </div>
          <div class="d-flex align-center">
            <v-icon size="15" color="grey" class="mr-1">mdi-currency-inr</v-icon>
            {{ job.salary_range || 'Not Disclosed' }}
          </div>
          <div v-if="job.category_name" class="d-flex align-center">
            <v-icon size="15" color="grey" class="mr-1">mdi-tag-outline</v-icon>
            {{ job.category_name }}
          </div>
          <div v-if="job.qualification_req" class="d-flex align-center">
            <v-icon size="15" color="grey" class="mr-1">mdi-school-outline</v-icon>
            {{ job.qualification_req }}
          </div>
          <div class="d-flex align-center text-grey">
            <v-icon size="15" class="mr-1">mdi-clock-outline</v-icon>
            Posted {{ formatDate(job.created_at) }}
          </div>
        </div>

        <!-- Skills tags snippet if available -->
        <div v-if="skillsSnippet.length > 0" class="d-flex flex-wrap gap-1 mt-2">
          <v-chip v-for="skill in skillsSnippet" :key="skill" size="x-small" variant="outlined" color="grey-darken-2">
            {{ skill }}
          </v-chip>
        </div>
      </div>
      
      <v-btn icon="mdi-chevron-right" variant="text" color="grey" class="align-self-center"></v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const formatJobType = (type) => {
  return type?.replace('_', ' ') || ''
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const skillsSnippet = computed(() => {
  if (!props.job?.requirements_json) return [];
  try {
    const parsed = typeof props.job.requirements_json === 'string'
      ? JSON.parse(props.job.requirements_json)
      : props.job.requirements_json;
    return (parsed.required || []).slice(0, 4);
  } catch (e) {
    return [];
  }
})
</script>

<style scoped>
.job-card {
  transition: all 0.2s ease;
  cursor: pointer;
}
.job-card:hover {
  border-color: var(--color-brand) !important;
  background-color: #FAFAFB !important;
  transform: translateX(4px);
}
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.gap-x-4 { column-gap: 16px; }
.gap-y-2 { row-gap: 8px; }
</style>
