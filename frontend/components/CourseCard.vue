<template>
  <v-card
    class="course-card h-100 d-flex flex-column"
    elevation="1"
    rounded="xl"
    @click="navigateTo(`/courses/${course.slug}`)"
    v-motion-fade-visible-once
  >
    <div :class="viewType === 'list' ? 'd-flex h-100' : ''">
      <!-- Thumbnail -->
      <v-img
        :src="imageUrl"
        :aspect-ratio="1"
        :width="viewType === 'list' ? 180 : '100%'"
        cover
        class="bg-grey-lighten-2 flex-shrink-0"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="grey-lighten-4"></v-progress-circular>
          </div>
        </template>
        
        <!-- Badges on image -->
        <div v-if="viewType !== 'list'" class="pa-2 d-flex flex-wrap gap-2 justify-space-between w-100">
          <div class="d-flex gap-2 flex-wrap">
          </div>
        </div>
      </v-img>

      <div :class="viewType === 'list' ? 'pa-4 d-flex flex-column flex-grow-1 justify-center' : 'pa-4 d-flex flex-column flex-grow-1'">

        <h3 :class="viewType === 'list' ? 'text-h6' : 'text-subtitle-1'" class="font-weight-bold mb-2 line-clamp-2 text-grey-darken-4" style="line-height: 1.4; min-height: 2.8em;">
          {{ course.title }}
        </h3>

        <div v-if="displayRating || displayStudents" class="d-flex align-center mb-3">
          <v-rating
            v-if="displayRating"
            :model-value="course.rating || 0"
            color="amber-darken-2"
            density="compact"
            size="small"
            half-increments
            readonly
          ></v-rating>
          <span v-if="displayStudents" class="text-caption text-grey-darken-1 ml-2">({{ course.students_count || 0 }} students)</span>
        </div>

        <v-spacer></v-spacer>

        <v-divider class="my-3 opacity-20"></v-divider>

        <div class="d-flex align-center justify-space-between mt-auto">
          <div>
            <span v-if="course.price_type === 'custom' || !course.price || course.price == 0" class="text-subtitle-1 font-weight-bold text-primary">
              Enquiry
            </span>
            <span v-else class="text-h6 font-weight-bold text-grey-darken-4">
              {{ course.currency_symbol || '₹' }}{{ course.price }}
            </span>
          </div>
          
          <v-btn
            variant="flat"
            color="primary"
            rounded="lg"
            class="text-capitalize font-weight-bold px-5"
            elevation="0"
            @click.stop="handleEnrollClick"
          >
            {{ (course.price_type === 'custom' || !course.price || course.price == 0) ? 'Enquiry' : 'Enroll' }}
          </v-btn>
        </div>
      </div>
    </div>
    <!-- Inquiry Modal -->
    <v-dialog v-model="showInquiry" max-width="600" persistent @click.stop>
      <v-card class="rounded-xl pa-4" @click.stop>
        <v-card-title class="d-flex align-center justify-space-between pb-0">
          <span class="text-h5 font-weight-bold">Course Inquiry</span>
          <v-btn icon="mdi-close" variant="text" @click="showInquiry = false"></v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="text-body-2 text-grey-darken-1 mb-6">
            Fill out the form below to get more details about <strong>{{ course.title }}</strong>. Our team will get back to you shortly.
          </p>
          <DynamicLeadForm 
            form-id="course-inquiry-form" 
            :source="'course_card_' + course.slug"
            :initial-data="{ course: course.title }"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const showInquiry = ref(false)

const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  viewType: {
    type: String,
    default: 'grid'
  },
  showRating: {
    type: Boolean,
    default: undefined
  },
  showStudents: {
    type: Boolean,
    default: undefined
  }
})

const globalShowRating = useState('course_show_rating', () => true)
const globalShowStudents = useState('course_show_students', () => true)

const displayRating = computed(() => props.showRating !== undefined ? props.showRating : globalShowRating.value)
const displayStudents = computed(() => props.showStudents !== undefined ? props.showStudents : globalShowStudents.value)

const config = useRuntimeConfig()

const imageUrl = computed(() => {
  if (!props.course.thumbnail_url) return ''
  if (props.course.thumbnail_url.startsWith('http')) return props.course.thumbnail_url
  return config.public.apiBase.replace('/api', '') + props.course.thumbnail_url
})

const timeRemaining = ref(0)
let timer = null

const updateCountdown = () => {
  if (!props.course.start_date) return
  const start = new Date(props.course.start_date).getTime()
  const now = new Date().getTime()
  timeRemaining.value = start - now
}

const handleEnrollClick = () => {
  if (props.course.price_type === 'custom' || !props.course.price || parseFloat(props.course.price) === 0) {
    showInquiry.value = true
  } else {
    navigateTo(`/courses/${props.course.slug}`)
  }
}

onMounted(() => {
  if (props.course.course_type === 'live' && props.course.start_date) {
    updateCountdown()
    timer = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const countdownText = computed(() => {
  if (timeRemaining.value <= 0) return 'Class Started'
  
  const d = Math.floor(timeRemaining.value / (1000 * 60 * 60 * 24))
  const h = Math.floor((timeRemaining.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((timeRemaining.value % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((timeRemaining.value % (1000 * 60)) / 1000)

  if (d > 0) return `Starts in ${d}d ${h}h`
  if (h > 0) return `Starts in ${h}h ${m}m`
  return `Starts in ${m}m ${s}s`
})
</script>

<style scoped>
.course-card {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease;
  cursor: pointer;
  overflow: hidden;
}

.course-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
