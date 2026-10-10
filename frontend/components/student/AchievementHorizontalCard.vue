<template>
  <v-card
    class="achievement-horizontal-card rounded-2xl overflow-hidden bg-white border position-relative"
    elevation="0"
  >
    <!-- Background Watermark Glow -->
    <div class="watermark-icon position-absolute d-none d-md-block">
      <v-icon size="110" color="amber-lighten-4">mdi-trophy-award</v-icon>
    </div>

    <div class="pa-4 pa-md-5 d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4 position-relative z-index-1">
      
      <!-- Left: Visual & Details -->
      <div class="d-flex align-center gap-4 flex-grow-1 min-w-0 w-100 w-md-auto">
        
        <!-- Thumbnail / Badge Icon -->
        <div class="position-relative flex-shrink-0">
          <v-img
            v-if="course.thumbnail_url"
            :src="$config.public.apiBase.replace('/api', '') + course.thumbnail_url"
            width="88"
            height="88"
            cover
            class="rounded-xl bg-grey-lighten-3 border"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height bg-amber-lighten-5">
                <v-icon color="amber-darken-3" size="36">mdi-trophy</v-icon>
              </div>
            </template>
          </v-img>
          <div
            v-else
            class="achievement-avatar-placeholder rounded-xl d-flex align-center justify-center border"
          >
            <v-icon color="amber-darken-3" size="40">mdi-school</v-icon>
          </div>

          <!-- Mini Trophy Badge Overlay -->
          <div class="achievement-badge-overlay position-absolute">
            <v-avatar size="28" color="amber-darken-2" class="elevation-2 border-white">
              <v-icon size="16" color="white">mdi-trophy</v-icon>
            </v-avatar>
          </div>
        </div>

        <!-- Middle: Course Info & Stats -->
        <div class="flex-grow-1 min-w-0">
          <div class="d-flex align-center flex-wrap gap-2 mb-1">
            <v-chip
              size="x-small"
              color="amber-darken-3"
              variant="flat"
              class="font-weight-black text-uppercase tracking-wider px-2"
            >
              <v-icon start size="12">mdi-star</v-icon>
              Course Graduate
            </v-chip>

            <span class="text-caption text-grey-darken-1 font-weight-medium">
              Completed {{ formattedCompletedDate }}
            </span>
          </div>

          <h3 class="text-subtitle-1 text-md-h6 font-weight-black text-grey-darken-4 text-truncate mb-1 line-clamp-1" :title="course.title">
            {{ course.title }}
          </h3>

          <div class="text-caption text-grey-darken-1 mb-2 d-flex align-center flex-wrap gap-3">
            <span class="d-flex align-center" v-if="course.instructor_name">
              <v-icon size="14" class="mr-1 text-grey">mdi-account-tie</v-icon>
              {{ course.instructor_name }}
            </span>
            <span class="d-flex align-center" v-if="course.total_lessons">
              <v-icon size="14" class="mr-1 text-success">mdi-check-circle-outline</v-icon>
              {{ course.completed_lessons || course.total_lessons }} / {{ course.total_lessons }} Lessons
            </span>
          </div>

          <!-- Quick Badges Row -->
          <div class="d-flex align-center flex-wrap gap-2">
            <v-chip
              v-if="certificate?.cert_number"
              size="x-small"
              color="teal-darken-2"
              variant="tonal"
              class="font-weight-bold"
            >
              <v-icon start size="12">mdi-check-decagram</v-icon>
              ID: {{ certificate.cert_number }}
            </v-chip>

            <v-chip
              v-else-if="course.enable_certificate === false || course.enable_certificate === 0"
              size="x-small"
              color="grey-darken-1"
              variant="tonal"
              class="font-weight-medium"
            >
              <v-icon start size="12">mdi-certificate-off-outline</v-icon>
              No Certificate Course
            </v-chip>

            <v-chip
              v-else
              size="x-small"
              color="warning"
              variant="tonal"
              class="font-weight-bold"
            >
              <v-icon start size="12">mdi-clock-outline</v-icon>
              Certificate Ready to Claim
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="d-flex align-center flex-wrap gap-2 flex-shrink-0 w-100 w-md-auto justify-start justify-md-end border-t pt-3 pt-md-0 border-t-md-0">
        
        <!-- When Certificate is Available -->
        <template v-if="certificate?.cert_number">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold text-none px-4"
            prepend-icon="mdi-download"
            @click="$emit('download-certificate', certificate.cert_number)"
          >
            Download PDF
          </v-btn>

          <v-btn
            color="success"
            variant="tonal"
            size="small"
            rounded="lg"
            class="font-weight-bold text-none px-3"
            prepend-icon="mdi-check-decagram"
            :to="'/verify-certificate?id=' + certificate.cert_number"
          >
            Verify
          </v-btn>

          <v-btn
            icon="mdi-whatsapp"
            size="small"
            color="success"
            variant="tonal"
            rounded="lg"
            title="Share on WhatsApp"
            @click="$emit('share-whatsapp', certificate)"
          />

          <v-btn
            icon="mdi-linkedin"
            size="small"
            color="primary"
            variant="tonal"
            rounded="lg"
            title="Share on LinkedIn"
            @click="$emit('share-linkedin', certificate)"
          />
        </template>

        <!-- When Certificate is Enabled and Ready to Claim -->
        <template v-else-if="course.enable_certificate !== false && course.enable_certificate !== 0">
          <v-btn
            color="success"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold text-none px-4"
            prepend-icon="mdi-certificate-outline"
            :loading="claiming"
            @click="$emit('claim-certificate', course.course_id)"
          >
            Claim Certificate 🎓
          </v-btn>

          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            rounded="lg"
            class="font-weight-bold text-none px-3"
            @click="$emit('review-course', course)"
          >
            Review Course
          </v-btn>
        </template>

        <!-- When No Certificate Course -->
        <template v-else>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold text-none px-4"
            prepend-icon="mdi-book-open-page-variant"
            @click="$emit('review-course', course)"
          >
            Review Course
          </v-btn>
        </template>
      </div>

    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  certificate: {
    type: Object,
    default: null
  },
  claiming: {
    type: Boolean,
    default: false
  }
});

defineEmits([
  'download-certificate',
  'claim-certificate',
  'share-whatsapp',
  'share-linkedin',
  'review-course'
]);

const formattedCompletedDate = computed(() => {
  if (!props.course.completed_at) return 'Recently';
  return dayjs(props.course.completed_at).format('MMM DD, YYYY');
});
</script>

<style scoped>
.achievement-horizontal-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(254, 249, 195, 0.35) 0%, #ffffff 45%) !important;
  border-color: rgba(245, 158, 11, 0.2) !important;
}

.achievement-horizontal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(245, 158, 11, 0.4) !important;
}

.watermark-icon {
  top: -15px;
  right: 15px;
  opacity: 0.35;
  pointer-events: none;
}

.achievement-avatar-placeholder {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.achievement-badge-overlay {
  bottom: -6px;
  right: -6px;
}

.border-white {
  border: 2px solid #ffffff !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.z-index-1 { z-index: 1; }
</style>
