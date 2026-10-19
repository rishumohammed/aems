<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-6 gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Events Management</h1>
        <p class="text-body-1 text-secondary mb-0">
          Create events, configure registration schedules, and manage registered candidates.
        </p>
      </div>
      <div class="d-flex align-center gap-3">
        <v-btn
          color="primary"
          class="text-none font-weight-bold rounded-lg px-4"
          prepend-icon="mdi-plus"
          height="42"
          @click="openDialog()"
        >
          Create Event
        </v-btn>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Total Events</div>
              <div class="text-h4 font-weight-bold text-slate-900 mt-1">{{ events.length }}</div>
            </div>
            <v-avatar color="indigo-lighten-5" size="48" rounded="lg">
              <v-icon color="primary" size="26">mdi-calendar-multiple</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Registration Open</div>
              <div class="text-h4 font-weight-bold text-emerald-600 mt-1">{{ openRegistrationCount }}</div>
            </div>
            <v-avatar color="green-lighten-5" size="48" rounded="lg">
              <v-icon color="success" size="26">mdi-account-clock</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Live Now</div>
              <div class="text-h4 font-weight-bold text-red-600 mt-1">{{ liveEventsCount }}</div>
            </div>
            <v-avatar color="red-lighten-5" size="48" rounded="lg">
              <v-icon color="error" size="26">mdi-video</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Total Candidates</div>
              <div class="text-h4 font-weight-bold text-indigo-700 mt-1">{{ totalCandidatesCount }}</div>
            </div>
            <v-avatar color="deep-purple-lighten-5" size="48" rounded="lg">
              <v-icon color="deep-purple" size="26">mdi-account-group</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters Bar -->
    <v-card class="rounded-xl border pa-4 bg-white mb-6" elevation="0">
      <div class="d-flex flex-column flex-md-row align-center justify-space-between gap-4">
        <!-- Search Input -->
        <div class="search-pill d-flex align-center px-3 flex-grow-1 w-100 max-w-md">
          <v-icon icon="mdi-magnify" size="20" color="grey" class="mr-2"></v-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events by title..."
            class="search-input w-100"
          />
        </div>

        <!-- Status Filter -->
        <div class="d-flex align-center gap-2 w-100 w-md-auto">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            style="min-width: 170px;"
          ></v-select>
        </div>
      </div>
    </v-card>

    <!-- Events Table -->
    <v-card class="rounded-xl border overflow-hidden bg-white" elevation="0">
      <v-data-table
        :headers="headers"
        :items="filteredEvents"
        :loading="loading"
        hover
        class="events-admin-table"
      >
        <!-- Thumbnail / Poster -->
        <template v-slot:item.image_url="{ item }">
          <div class="py-2">
            <v-avatar rounded="lg" size="56" color="grey-lighten-4" class="border">
              <v-img v-if="item.image_url" :src="getImageUrl(item.image_url)" cover></v-img>
              <v-icon v-else color="grey">mdi-image-outline</v-icon>
            </v-avatar>
          </div>
        </template>

        <!-- Event Details -->
        <template v-slot:item.title="{ item }">
          <div class="py-2">
            <div class="font-weight-bold text-slate-900 text-subtitle-2">{{ item.title }}</div>
            <a
              :href="`/events/${item.slug || item.id}`"
              target="_blank"
              class="text-caption text-primary font-mono line-clamp-1 text-decoration-none d-inline-flex align-center mt-1"
            >
              /events/{{ item.slug || item.id }}
              <v-icon size="12" class="ml-1">mdi-open-in-new</v-icon>
            </a>
          </div>
        </template>

        <!-- Registration Timing -->
        <template v-slot:item.registration_period="{ item }">
          <div class="text-caption py-2">
            <div><span class="text-secondary">Start:</span> {{ formatDateTime(item.registration_start) }}</div>
            <div><span class="text-secondary">End:</span> {{ formatDateTime(item.registration_end) }}</div>
          </div>
        </template>

        <!-- Event Timing -->
        <template v-slot:item.event_start="{ item }">
          <div class="text-caption py-2 font-weight-medium">
            <div class="text-slate-900">{{ formatDateTime(item.event_start) }}</div>
            <span
              v-if="item.meet_link"
              class="text-primary cursor-pointer text-decoration-underline"
              @click="windowOpen(item.meet_link)"
            >
              Open Join Link &rarr;
            </span>
          </div>
        </template>

        <!-- Status Badge -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusChipColor(item)"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getStatusChipLabel(item) }}
          </v-chip>
        </template>

        <!-- Candidates Count & View Button -->
        <template v-slot:item.registrations_count="{ item }">
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            rounded="pill"
            class="font-weight-bold text-none px-3"
            :to="`/dashboard/admin/events/${item.id}`"
          >
            <v-icon start size="16">mdi-account-group</v-icon>
            {{ item.registrations_count || 0 }} Candidates
          </v-btn>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <v-tooltip location="top" text="View Registered Candidates">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-account-search-outline"
                  variant="text"
                  size="small"
                  color="indigo"
                  :to="`/dashboard/admin/events/${item.id}`"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip location="top" text="Edit Event">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="openDialog(item)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip location="top" text="Delete Event">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete-outline"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Event Dialog -->
    <v-dialog v-model="dialog" max-width="740" persistent scrollable>
      <v-card class="rounded-2xl overflow-hidden">
        <v-card-title class="pa-6 pb-4 d-flex justify-space-between align-center border-b">
          <span class="text-h6 font-weight-bold">{{ editingId ? 'Edit Event' : 'Create New Event' }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="eventForm" v-model="isFormValid" @submit.prevent="saveEvent">
            <v-row dense>
              <!-- Title -->
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="formData.title"
                  label="Event Name *"
                  placeholder="e.g. Full Stack AI & Web Summit 2026"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[v => !!v || 'Event Name is required']"
                  @input="onTitleInput"
                ></v-text-field>
              </v-col>

              <!-- Slug URL -->
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="formData.slug"
                  label="Page Slug (URL Path) *"
                  placeholder="e.g. ai-web-summit-2026"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-link-variant"
                  hint="Public URL: /events/[slug]"
                  persistent-hint
                  :rules="[v => !!v || 'Slug is required']"
                  @input="slugManuallyEdited = true"
                ></v-text-field>
              </v-col>

              <!-- Image Upload & Preview -->
              <v-col cols="12" md="6">
                <v-file-input
                  label="Event Poster / Card Image"
                  prepend-icon=""
                  prepend-inner-icon="mdi-camera"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  accept="image/*"
                  @update:model-value="onImageSelect"
                  show-size
                ></v-file-input>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.image_url"
                  label="Or Image URL"
                  placeholder="https://images.unsplash.com/..."
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-link"
                ></v-text-field>
              </v-col>

              <!-- Image Preview Box -->
              <v-col cols="12" v-if="imagePreview || formData.image_url">
                <div class="pa-2 border rounded-xl bg-slate-50 d-flex align-center gap-3">
                  <v-avatar rounded="lg" size="64" class="border">
                    <v-img :src="imagePreview || getImageUrl(formData.image_url)" cover></v-img>
                  </v-avatar>
                  <div class="text-caption text-secondary">
                    Card Image Preview. This banner will be displayed on the public event card and confirmation emails.
                  </div>
                </div>
              </v-col>

              <!-- Registration Dates -->
              <v-col cols="12" sm="6">
                <v-text-field
                  ref="regStartInput"
                  v-model="formData.registration_start"
                  label="Registration Start Date &amp; Time *"
                  type="datetime-local"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="regStartRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  ref="regEndInput"
                  v-model="formData.registration_end"
                  label="Registration End Date &amp; Time *"
                  type="datetime-local"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="regEndRules"
                ></v-text-field>
              </v-col>

              <!-- Event Schedule Dates -->
              <v-col cols="12" sm="6">
                <v-text-field
                  ref="eventStartInput"
                  v-model="formData.event_start"
                  label="Event Date &amp; Time *"
                  type="datetime-local"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="eventStartRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  ref="eventEndInput"
                  v-model="formData.event_end"
                  label="Event Concludes At (Optional)"
                  type="datetime-local"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  clearable
                  :rules="eventEndRules"
                ></v-text-field>
              </v-col>

              <!-- Join Link -->
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="formData.meet_link"
                  label="Join Event Meeting Link"
                  placeholder="https://meet.google.com/xyz-abc-def or Zoom link"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-video-outline"
                ></v-text-field>
              </v-col>

              <!-- Status -->
              <v-col cols="12" sm="4">
                <v-select
                  v-model="formData.status"
                  label="Status"
                  :items="['published', 'draft', 'cancelled']"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Event Description"
                  placeholder="Describe the event agenda, topics covered, target audience, and expectations..."
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 border-t d-flex justify-end gap-3">
          <v-btn variant="text" rounded="lg" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            class="px-6 font-weight-bold"
            :loading="saving"
            @click="saveEvent"
          >
            {{ editingId ? 'Update Event' : 'Create Event' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="440">
      <v-card class="rounded-2xl pa-6 text-center">
        <v-avatar color="red-lighten-5" size="64" class="mx-auto mb-4">
          <v-icon color="error" size="32">mdi-alert-outline</v-icon>
        </v-avatar>
        <h3 class="text-h6 font-weight-bold mb-2">Delete Event?</h3>
        <p class="text-body-2 text-secondary mb-6">
          Are you sure you want to delete <strong>{{ eventToDelete?.title }}</strong>? This will permanently remove the event and all registered candidate records.
        </p>
        <div class="d-flex justify-center gap-3">
          <v-btn variant="outlined" rounded="lg" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" rounded="lg" :loading="deleting" @click="executeDelete">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Global Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({
  layout: 'dashboard'
});

const api = useApi();
const config = useRuntimeConfig();

// State
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const events = ref<any[]>([]);
const searchQuery = ref('');
const statusFilter = ref('all');

// Dialogs
const dialog = ref(false);
const deleteDialog = ref(false);
const editingId = ref<string | null>(null);
const eventToDelete = ref<any>(null);
const eventForm = ref<any>(null);
const isFormValid = ref(false);
const selectedFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

// Date Input Component Refs
const regStartInput = ref<any>(null);
const regEndInput = ref<any>(null);
const eventStartInput = ref<any>(null);
const eventEndInput = ref<any>(null);

// Form
const slugManuallyEdited = ref(false);
const formData = ref({
  title: '',
  slug: '',
  description: '',
  image_url: '',
  registration_start: '',
  registration_end: '',
  event_start: '',
  event_end: '',
  meet_link: '',
  status: 'published'
});

const parseDateTimestamp = (val: any): number | null => {
  if (!val) return null;
  let str = String(val).trim();
  if (!str) return null;
  if (str.endsWith('Z')) str = str.slice(0, -1);
  const d = new Date(str.includes('T') ? str : str.replace(' ', 'T'));
  const time = d.getTime();
  return isNaN(time) ? null : time;
};

// Date Validation Rules
const regStartRules = [
  (v: string) => !!v || 'Registration start is required',
  (v: string) => {
    const startT = parseDateTimestamp(v);
    const endT = parseDateTimestamp(formData.value.registration_end);
    if (!startT || !endT) return true;
    return startT < endT || 'Registration start must be before registration end';
  }
];

const regEndRules = [
  (v: string) => !!v || 'Registration end is required',
  (v: string) => {
    const endT = parseDateTimestamp(v);
    const startT = parseDateTimestamp(formData.value.registration_start);
    if (!endT || !startT) return true;
    return endT > startT || 'Registration end must be after registration start';
  },
  (v: string) => {
    const endT = parseDateTimestamp(v);
    const eventT = parseDateTimestamp(formData.value.event_start);
    if (!endT || !eventT) return true;
    return endT <= eventT || 'Registration must end on or before event starts';
  }
];

const eventStartRules = [
  (v: string) => !!v || 'Event start time is required',
  (v: string) => {
    const eventT = parseDateTimestamp(v);
    const regEndT = parseDateTimestamp(formData.value.registration_end);
    if (!eventT || !regEndT) return true;
    return eventT >= regEndT || 'Event cannot start before registration ends';
  }
];

const eventEndRules = [
  (v: string) => {
    if (!v) return true;
    const endT = parseDateTimestamp(v);
    const startT = parseDateTimestamp(formData.value.event_start);
    if (!endT || !startT) return true;
    return endT > startT || 'Conclusion time must be after event start';
  }
];

// Reactive re-validation of dependent date inputs
watch(
  () => formData.value.registration_start,
  () => {
    if (dialog.value && formData.value.registration_end) {
      regEndInput.value?.validate?.();
    }
  }
);

watch(
  () => formData.value.registration_end,
  () => {
    if (dialog.value) {
      if (formData.value.registration_start) regStartInput.value?.validate?.();
      if (formData.value.event_start) eventStartInput.value?.validate?.();
    }
  }
);

watch(
  () => formData.value.event_start,
  () => {
    if (dialog.value) {
      if (formData.value.registration_end) regEndInput.value?.validate?.();
      if (formData.value.event_end) eventEndInput.value?.validate?.();
    }
  }
);

watch(
  () => formData.value.event_end,
  () => {
    if (dialog.value && formData.value.event_start) {
      eventStartInput.value?.validate?.();
    }
  }
);

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const showSnackbar = (text: string, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

const statusOptions = [
  { title: 'All Statuses', value: 'all' },
  { title: 'Published', value: 'published' },
  { title: 'Draft', value: 'draft' },
  { title: 'Cancelled', value: 'cancelled' }
];

// Table Headers
const headers = [
  { title: 'Poster', key: 'image_url', sortable: false, width: '80px' },
  { title: 'Event Name', key: 'title' },
  { title: 'Registration Schedule', key: 'registration_period', sortable: false },
  { title: 'Event Timing', key: 'event_start' },
  { title: 'Status', key: 'status', width: '120px' },
  { title: 'Candidates', key: 'registrations_count', width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '130px', align: 'end' as const }
];

// KPI Counts
const openRegistrationCount = computed(() => {
  return events.value.filter(e => e.registration_status === 'open').length;
});

const liveEventsCount = computed(() => {
  return events.value.filter(e => e.event_status === 'live').length;
});

const totalCandidatesCount = computed(() => {
  return events.value.reduce((acc, curr) => acc + (Number(curr.registrations_count) || 0), 0);
});

// Filtered Events
const filteredEvents = computed(() => {
  return events.value.filter(e => {
    const matchesSearch = !searchQuery.value ||
      (e.title && e.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesStatus = statusFilter.value === 'all' || e.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

// Fetch Events
const fetchEvents = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/events');
    events.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Failed to fetch admin events:', error);
    showSnackbar('Failed to load events.', 'error');
  } finally {
    loading.value = false;
  }
};

// Date Formatters
const toInputFormat = (val: any) => {
  if (!val) return '';
  if (typeof val === 'string') {
    let trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.endsWith('Z')) trimmed = trimmed.slice(0, -1);
    // If it's already YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 16);
    }
    // If it's MySQL datetime string YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 16).replace(' ', 'T');
    }
    // If it's ISO string with seconds / milliseconds / Z
    const d = new Date(trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())}T${pad(val.getHours())}:${pad(val.getMinutes())}`;
  }
  return '';
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '—';
  let str = String(dateStr).trim();
  if (str.endsWith('Z')) str = str.slice(0, -1);
  const d = new Date(str.includes('T') ? str : str.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const windowOpen = (url: string) => {
  if (url) window.open(url, '_blank');
};

const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = config.public.apiBase ? config.public.apiBase.replace('/api', '') : '';
  return baseUrl + url;
};

const getStatusChipColor = (event: any) => {
  if (event.event_status === 'live') return 'error';
  if (event.registration_status === 'open') return 'success';
  if (event.registration_status === 'closed' && event.event_status === 'upcoming') return 'warning';
  if (event.event_status === 'completed') return 'grey';
  return 'primary';
};

const getStatusChipLabel = (event: any) => {
  if (event.event_status === 'live') return 'Live Now';
  if (event.registration_status === 'open') return 'Registration Open';
  if (event.registration_status === 'closed' && event.event_status === 'upcoming') return 'Registration Closed';
  if (event.event_status === 'completed') return 'Concluded';
  return event.status;
};

// On Image File Select
const onImageSelect = (file: File | File[] | null) => {
  const f = Array.isArray(file) ? file[0] : file;
  if (f) {
    selectedFile.value = f;
    imagePreview.value = URL.createObjectURL(f);
  } else {
    selectedFile.value = null;
    imagePreview.value = null;
  }
};

const slugifyText = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const onTitleInput = () => {
  if (!editingId.value && !slugManuallyEdited.value && formData.value.title) {
    formData.value.slug = slugifyText(formData.value.title);
  }
};

// Open Dialog
const openDialog = (item?: any) => {
  selectedFile.value = null;
  imagePreview.value = null;

  if (item) {
    editingId.value = item.id;
    slugManuallyEdited.value = true;
    formData.value = {
      title: item.title,
      slug: item.slug || '',
      description: item.description || '',
      image_url: item.image_url || '',
      registration_start: toInputFormat(item.registration_start),
      registration_end: toInputFormat(item.registration_end),
      event_start: toInputFormat(item.event_start),
      event_end: toInputFormat(item.event_end),
      meet_link: item.meet_link || '',
      status: item.status || 'published'
    };
  } else {
    editingId.value = null;
    slugManuallyEdited.value = false;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // Default registration_start: today at current hour:00
    const regStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    // Default registration_end: 7 days from today at 18:00
    const regEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 18, 0, 0);
    // Default event_start: 7 days from today at 19:00 (1h after registration closes)
    const evStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 19, 0, 0);
    // Default event_end: 7 days from today at 21:00 (2h duration)
    const evEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 21, 0, 0);

    formData.value = {
      title: '',
      slug: '',
      description: '',
      image_url: '',
      registration_start: fmt(regStart),
      registration_end: fmt(regEnd),
      event_start: fmt(evStart),
      event_end: fmt(evEnd),
      meet_link: '',
      status: 'published'
    };
  }
  dialog.value = true;
  setTimeout(() => {
    eventForm.value?.resetValidation?.();
  }, 50);
};

// Save Event
const saveEvent = async () => {
  if (!eventForm.value) return;
  const { valid } = await eventForm.value.validate();
  if (!valid) return;

  // Pre-flight chronological validation
  const rStart = parseDateTimestamp(formData.value.registration_start);
  const rEnd = parseDateTimestamp(formData.value.registration_end);
  const eStart = parseDateTimestamp(formData.value.event_start);

  if (!rStart || !rEnd || !eStart) {
    showSnackbar('Please enter valid dates and times for registration and event', 'error');
    return;
  }

  if (rStart >= rEnd) {
    showSnackbar('Registration start date must be before registration end date', 'error');
    return;
  }
  if (rEnd > eStart) {
    showSnackbar('Registration must end on or before the event start time', 'error');
    return;
  }
  if (formData.value.event_end) {
    const eEnd = parseDateTimestamp(formData.value.event_end);
    if (eEnd && eStart >= eEnd) {
      showSnackbar('Event conclusion time must be after the event start time', 'error');
      return;
    }
  }

  saving.value = true;
  try {
    const data = new FormData();
    data.append('title', formData.value.title);
    data.append('slug', formData.value.slug);
    data.append('description', formData.value.description || '');
    data.append('registration_start', formData.value.registration_start);
    data.append('registration_end', formData.value.registration_end);
    data.append('event_start', formData.value.event_start);
    data.append('event_end', formData.value.event_end || '');
    data.append('meet_link', formData.value.meet_link || '');
    data.append('status', formData.value.status);

    if (selectedFile.value) {
      data.append('image', selectedFile.value);
    } else if (formData.value.image_url) {
      data.append('image_url', formData.value.image_url);
    }

    if (editingId.value) {
      await api.put(`/admin/events/${editingId.value}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSnackbar('Event updated successfully');
    } else {
      await api.post('/admin/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSnackbar('Event created successfully');
    }

    dialog.value = false;
    fetchEvents();
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'Failed to save event';
    showSnackbar(msg, 'error');
  } finally {
    saving.value = false;
  }
};

// Delete Event
const confirmDelete = (item: any) => {
  eventToDelete.value = item;
  deleteDialog.value = true;
};

const executeDelete = async () => {
  if (!eventToDelete.value) return;
  deleting.value = true;
  try {
    await api.delete(`/admin/events/${eventToDelete.value.id}`);
    showSnackbar('Event deleted successfully');
    deleteDialog.value = false;
    fetchEvents();
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'Failed to delete event';
    showSnackbar(msg, 'error');
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.search-pill {
  height: 40px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #334155;
}

.events-admin-table :deep(th) {
  font-weight: 700 !important;
  color: #475569 !important;
  font-size: 13px !important;
  background-color: #f8fafc !important;
}

.events-admin-table :deep(tr:hover) {
  background-color: #f8fafc !important;
}

.font-mono {
  font-family: monospace !important;
}
</style>
