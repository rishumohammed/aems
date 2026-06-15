<template>
  <v-card
    class="course-card h-100 d-flex flex-column"
    :variant="viewType === 'list' ? 'flat' : 'elevated'"
    @click="navigateTo(`/courses/${course.slug}`)"
    v-motion-fade-visible-once
  >
    <div :class="viewType === 'list' ? 'd-flex align-center pa-2' : ''">
      <!-- Thumbnail -->
      <v-img
        :src="course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'"
        :aspect-ratio="viewType === 'list' ? 1 : 16/9"
        :width="viewType === 'list' ? 120 : '100%'"
        cover
        class="bg-grey-lighten-2 rounded-lg"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="grey-lighten-4"></v-progress-circular>
          </div>
        </template>
        
        <!-- Badges on image -->
        <div v-if="viewType !== 'list'" class="pa-2">
          <v-chip
            v-if="course.category_name"
            size="x-small"
            color="white"
            variant="flat"
            class="text-primary font-weight-bold"
          >
            {{ course.category_name }}
          </v-chip>
        </div>
      </v-img>

      <div :class="viewType === 'list' ? 'flex-grow-1 px-5' : 'card-body--tight d-flex flex-column flex-grow-1'">
        <!-- Meta info -->
        <div class="d-flex align-center mb-1 text-caption text-grey-darken-1">
          <v-icon size="14" class="mr-1">mdi-account-tie</v-icon>
          <span>{{ course.tutor_name || 'Expert Instructor' }}</span>
        </div>

        <h3 :class="viewType === 'list' ? 'text-subtitle-1' : 'text-h6'" class="font-weight-bold mb-2 line-clamp-2">
          {{ course.title }}
        </h3>

        <div class="d-flex align-center mb-3">
          <v-rating
            :model-value="4.8"
            color="amber-darken-2"
            density="compact"
            size="small"
            half-increments
            readonly
          ></v-rating>
          <span class="text-caption text-grey-darken-1 ml-2">(1.2k students)</span>
        </div>

        <v-spacer></v-spacer>

        <div class="d-flex align-center justify-space-between mt-2">
          <div>
            <span v-if="course.price_type === 'custom'" class="text-subtitle-1 font-weight-bold text-primary">
              Get Quote
            </span>
            <span v-else class="text-h6 font-weight-bold">
              ₹{{ course.price }}
            </span>
          </div>
          
          <v-btn
            variant="tonal"
            color="primary"
            rounded="lg"
            size="small"
            class="text-capitalize font-weight-bold"
          >
            Enroll
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  course: {
    type: Object,
    required: true
  },
  viewType: {
    type: String,
    default: 'grid'
  }
})
</script>

<style scoped>
.course-card {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
  cursor: pointer;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
