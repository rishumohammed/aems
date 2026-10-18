<template>
  <v-card
    class="event-card rounded-2xl w-100 d-flex flex-column bg-white border elevation-1 transition-all overflow-hidden"
    @click="handleCardClick"
  >
    <!-- Thumbnail Container -->
    <div class="event-image-container position-relative overflow-hidden w-100" style="aspect-ratio: 1 / 1;">
      <v-img
        :src="imageUrl"
        cover
        width="100%"
        height="100%"
        aspect-ratio="1"
        class="event-img-zoom"
      >
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          </div>
        </template>
      </v-img>

      <!-- Status Overlay Badges -->
      <div class="position-absolute top-0 left-0 right-0 pa-3 d-flex align-center justify-space-between pointer-events-none">
        <span
          class="status-chip text-caption font-weight-bold px-3 py-1 rounded-pill"
          :class="statusClass"
        >
          <span v-if="event.event_status === 'live'" class="live-dot mr-1"></span>
          {{ statusLabel }}
        </span>

        <span class="admission-chip text-caption font-weight-bold px-3 py-1 rounded-pill bg-white text-slate-800 shadow-sm">
          Free Online Event
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="pa-5 flex-grow-1 d-flex flex-column">
      <!-- Event Title -->
      <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2 line-clamp-2 leading-snug">
        {{ event.title }}
      </h3>

      <!-- Event Description -->
      <p class="text-body-2 text-secondary mb-4 line-clamp-2">
        {{ event.description || 'Join this live session to gain expert knowledge and engage in interactive discussions.' }}
      </p>

      <v-divider class="mb-4 opacity-10"></v-divider>

      <!-- Timing Information -->
      <div class="event-meta-info mb-4">
        <!-- Event Timing -->
        <div class="d-flex align-center text-caption text-slate-800 font-weight-medium mb-2">
          <v-icon size="16" color="red-darken-1" class="mr-2">mdi-calendar-clock</v-icon>
          <div>
            <span class="font-weight-bold text-slate-900">Event Time:</span>
            {{ formatEventDateTime(event.event_start) }}
          </div>
        </div>

        <!-- Registration Window -->
        <div v-if="event.registration_start && event.registration_end" class="d-flex align-center text-caption text-secondary">
          <v-icon size="16" color="indigo" class="mr-2">mdi-account-clock-outline</v-icon>
          <div>
            <span class="font-weight-medium">Registration:</span>
            {{ formatDateShort(event.registration_start) }} &ndash; {{ formatDateShort(event.registration_end) }}
          </div>
        </div>
      </div>

      <v-spacer></v-spacer>

      <!-- Action Button Section -->
      <div class="action-button-wrapper mt-auto" @click.stop>
        <!-- Case 1: Registration Open -> Register Now -->
        <template v-if="event.registration_status === 'open'">
          <v-btn
            block
            color="primary"
            rounded="lg"
            height="42"
            elevation="0"
            class="text-capitalize font-weight-bold"
            :to="`/events/${event.slug || event.id}`"
          >
            <v-icon start size="18">mdi-account-plus</v-icon>
            Register Now
          </v-btn>
        </template>

        <!-- Case 2: Registration Over, Event Not Started Yet -->
        <template v-else-if="event.registration_status === 'closed' && event.event_status === 'upcoming'">
          <v-btn
            block
            disabled
            variant="flat"
            color="grey-lighten-3"
            rounded="lg"
            height="42"
            class="text-capitalize font-weight-bold text-grey-darken-1"
          >
            <v-icon start size="18">mdi-lock-clock</v-icon>
            Join Event (Opens at Event Time)
          </v-btn>
        </template>

        <!-- Case 3: Live Now -->
        <template v-else-if="event.event_status === 'live'">
          <v-btn
            block
            :href="event.meet_link || '#'"
            target="_blank"
            color="success"
            rounded="lg"
            height="42"
            elevation="2"
            class="text-capitalize font-weight-bold pulse-green"
          >
            <v-icon start size="18">mdi-video</v-icon>
            Join Event 🚀
          </v-btn>
        </template>

        <!-- Case 4: Event Concluded -->
        <template v-else-if="event.event_status === 'completed'">
          <v-btn
            block
            disabled
            variant="outlined"
            color="grey"
            rounded="lg"
            height="42"
            class="text-capitalize font-weight-medium"
          >
            <v-icon start size="18">mdi-check-circle-outline</v-icon>
            Event Concluded
          </v-btn>
        </template>

        <!-- Case 5: Registration Not Started Yet -->
        <template v-else>
          <v-btn
            block
            disabled
            variant="tonal"
            color="grey"
            rounded="lg"
            height="42"
            class="text-capitalize font-weight-medium"
          >
            Registration Opens Soon
          </v-btn>
        </template>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

const config = useRuntimeConfig();

// Image resolution
const imageUrl = computed(() => {
  if (!props.event?.image_url) {
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
  }
  if (props.event.image_url.startsWith('http://') || props.event.image_url.startsWith('https://')) {
    return props.event.image_url;
  }
  const baseUrl = config.public.apiBase ? config.public.apiBase.replace('/api', '') : '';
  return baseUrl + props.event.image_url;
});

// Status Label
const statusLabel = computed(() => {
  if (props.event.event_status === 'live') return 'Live Now';
  if (props.event.registration_status === 'open') return 'Registration Open';
  if (props.event.registration_status === 'closed' && props.event.event_status === 'upcoming') return 'Registration Closed';
  if (props.event.event_status === 'completed') return 'Concluded';
  return 'Coming Soon';
});

// Status Color Class
const statusClass = computed(() => {
  if (props.event.event_status === 'live') return 'bg-red-600 text-white shadow-md';
  if (props.event.registration_status === 'open') return 'bg-emerald-600 text-white shadow-md';
  if (props.event.registration_status === 'closed' && props.event.event_status === 'upcoming') return 'bg-amber-600 text-white shadow-md';
  if (props.event.event_status === 'completed') return 'bg-slate-600 text-white';
  return 'bg-indigo-600 text-white';
});

// Format Date Helpers
const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatEventDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleCardClick = () => {
  navigateTo(`/events/${props.event?.slug || props.event?.id}`);
};
</script>

<style scoped>
.event-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border-color: #e2e8f0 !important;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.1) !important;
}

.event-img-zoom {
  transition: transform 0.4s ease;
}

.event-card:hover .event-img-zoom {
  transform: scale(1.05);
}

.pointer-events-none {
  pointer-events: none;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.3px;
}

.live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffffff;
  animation: pulse-live 1.2s infinite;
}

@keyframes pulse-live {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.8; }
}

.pulse-green {
  animation: pulse-border 1.8s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.bg-red-600 { background-color: #dc2626 !important; }
.bg-emerald-600 { background-color: #059669 !important; }
.bg-amber-600 { background-color: #d97706 !important; }
.bg-slate-600 { background-color: #475569 !important; }
.bg-indigo-600 { background-color: #4f46e5 !important; }
.text-slate-900 { color: #0f172a !important; }
.text-slate-800 { color: #1e293b !important; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
