<template>
  <v-container fluid class="pa-6">
    <!-- Back Button & Breadcrumb -->
    <div class="mb-4">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        color="secondary"
        class="text-none font-weight-medium px-0"
        to="/dashboard/admin/events"
      >
        Back to All Events
      </v-btn>
    </div>

    <!-- Event Hero Header -->
    <v-card class="rounded-2xl border pa-6 bg-white mb-6" elevation="0">
      <div v-if="loadingEvent" class="d-flex align-center justify-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="event" class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center gap-6">
        <div class="d-flex align-start gap-4">
          <v-avatar rounded="xl" size="84" class="border flex-shrink-0" color="grey-lighten-4">
            <v-img v-if="event.image_url" :src="getImageUrl(event.image_url)" cover></v-img>
            <v-icon v-else color="grey" size="36">mdi-calendar-star</v-icon>
          </v-avatar>

          <div>
            <div class="d-flex align-center gap-2 mb-1 flex-wrap">
              <v-chip size="small" :color="getStatusChipColor(event)" variant="flat" class="font-weight-bold">
                {{ getStatusChipLabel(event) }}
              </v-chip>
              <span class="text-caption text-secondary">ID: {{ event.id.substring(0, 8) }}...</span>
            </div>

            <h1 class="text-h5 font-weight-bold text-slate-900 mb-2">{{ event.title }}</h1>

            <div class="d-flex align-center gap-4 flex-wrap text-caption text-secondary">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-1">mdi-calendar-clock</v-icon>
                <span><strong>Event Time:</strong> {{ formatDateTime(event.event_start) }}</span>
              </div>

              <div class="d-flex align-center">
                <v-icon size="16" color="indigo" class="mr-1">mdi-account-clock-outline</v-icon>
                <span><strong>Registration:</strong> {{ formatDateShort(event.registration_start) }} &ndash; {{ formatDateShort(event.registration_end) }} IST</span>
              </div>

              <div v-if="event.meet_link" class="d-flex align-center">
                <v-icon size="16" color="success" class="mr-1">mdi-video</v-icon>
                <a :href="event.meet_link" target="_blank" class="text-primary font-weight-bold text-decoration-none">
                  Open Meeting Link &nearr;
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action Buttons -->
        <div class="d-flex align-center gap-3 w-100 w-md-auto justify-end flex-wrap">
          <v-btn
            variant="outlined"
            color="primary"
            class="text-none font-weight-bold rounded-lg"
            prepend-icon="mdi-download"
            :loading="exporting"
            @click="exportCsv"
          >
            Export CSV
          </v-btn>

          <v-btn
            color="amber-darken-3"
            class="text-none font-weight-bold rounded-lg text-white"
            prepend-icon="mdi-email-fast-outline"
            :loading="dispatchingReminders"
            @click="sendManualReminders"
          >
            Send 24h Reminders
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Candidate Breakdown KPI Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Total Registered</div>
              <div class="text-h4 font-weight-bold text-slate-900 mt-1">{{ candidates.length }}</div>
            </div>
            <v-avatar color="indigo-lighten-5" size="48" rounded="lg">
              <v-icon color="primary" size="26">mdi-account-group</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Students</div>
              <div class="text-h4 font-weight-bold text-blue-600 mt-1">{{ studentsCount }}</div>
            </div>
            <v-avatar color="blue-lighten-5" size="48" rounded="lg">
              <v-icon color="blue" size="26">mdi-school</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Working / Employees</div>
              <div class="text-h4 font-weight-bold text-purple-600 mt-1">{{ workingCount }}</div>
            </div>
            <v-avatar color="purple-lighten-5" size="48" rounded="lg">
              <v-icon color="purple" size="26">mdi-briefcase</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border pa-4 bg-white" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">Trainers</div>
              <div class="text-h4 font-weight-bold text-emerald-600 mt-1">{{ trainersCount }}</div>
            </div>
            <v-avatar color="green-lighten-5" size="48" rounded="lg">
              <v-icon color="emerald" size="26">mdi-account-tie</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Registered Candidates Table Section -->
    <v-card class="rounded-xl border pa-4 bg-white mb-6" elevation="0">
      <div class="d-flex flex-column flex-md-row align-center justify-space-between gap-4 mb-4">
        <!-- Search -->
        <div class="search-pill d-flex align-center px-3 flex-grow-1 w-100 max-w-md">
          <v-icon icon="mdi-magnify" size="20" color="grey" class="mr-2"></v-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search candidates by name, email, phone, or organization..."
            class="search-input w-100"
          />
        </div>

        <!-- Occupation Filter -->
        <div class="d-flex align-center gap-2 w-100 w-md-auto">
          <v-select
            v-model="occupationFilter"
            :items="occupationOptions"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            style="min-width: 180px;"
          ></v-select>
        </div>
      </div>

      <!-- Candidates Table -->
      <v-data-table
        :headers="candidateHeaders"
        :items="filteredCandidates"
        :loading="loadingCandidates"
        hover
        class="candidates-table rounded-lg overflow-hidden border"
      >
        <!-- Index Column -->
        <template v-slot:item.index="{ index }">
          <span class="text-caption font-weight-bold text-secondary">{{ index + 1 }}</span>
        </template>

        <!-- Candidate Name & Avatar -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="36" color="indigo-lighten-5" class="mr-3 border text-primary font-weight-bold text-caption">
              {{ getInitials(item.name) }}
            </v-avatar>
            <div>
              <div class="font-weight-bold text-slate-900 text-subtitle-2">{{ item.name }}</div>
              <div class="text-caption text-secondary">{{ item.phone }}</div>
            </div>
          </div>
        </template>

        <!-- Email -->
        <template v-slot:item.email="{ item }">
          <div class="d-flex align-center text-caption py-2">
            <span class="text-slate-800 font-mono">{{ item.email }}</span>
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              size="x-small"
              color="grey"
              class="ml-1"
              @click="copyToClipboard(item.email)"
            ></v-btn>
          </div>
        </template>

        <!-- Occupation / Role Badge -->
        <template v-slot:item.occupation="{ item }">
          <v-chip
            :color="getOccupationColor(item.occupation)"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            <v-icon start size="14">{{ getOccupationIcon(item.occupation) }}</v-icon>
            {{ item.occupation }}
          </v-chip>
        </template>

        <!-- Dynamic Organization Column (College / Company / Institution) -->
        <template v-slot:item.organization="{ item }">
          <div class="py-2 text-caption">
            <span class="font-weight-medium text-slate-900">{{ item.organization }}</span>
            <div class="text-caption text-secondary" style="font-size: 11px;">
              {{ getOrganizationLabel(item.occupation) }}
            </div>
          </div>
        </template>

        <!-- Verification Status -->
        <template v-slot:item.is_verified="{ item }">
          <v-chip color="success" size="x-small" variant="tonal" class="font-weight-bold">
            <v-icon start size="12">mdi-shield-check</v-icon>
            OTP Verified
          </v-chip>
        </template>

        <!-- Reminder 24h Status -->
        <template v-slot:item.reminder_sent_24h="{ item }">
          <v-chip
            :color="item.reminder_sent_24h ? 'indigo' : 'grey-lighten-2'"
            :variant="item.reminder_sent_24h ? 'flat' : 'outlined'"
            size="x-small"
            class="font-weight-bold"
          >
            <v-icon start size="12">{{ item.reminder_sent_24h ? 'mdi-email-check' : 'mdi-clock-outline' }}</v-icon>
            {{ item.reminder_sent_24h ? '24h Sent' : 'Pending' }}
          </v-chip>
        </template>

        <!-- Registered At -->
        <template v-slot:item.created_at="{ item }">
          <span class="text-caption text-secondary py-2">
            {{ formatDateTime(item.created_at) }}
          </span>
        </template>
      </v-data-table>
    </v-card>

    <!-- Global Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';

definePageMeta({
  layout: 'dashboard'
});

const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();

const eventId = route.params.id as string;

// State
const loadingEvent = ref(true);
const loadingCandidates = ref(true);
const exporting = ref(false);
const dispatchingReminders = ref(false);
const event = ref<any>(null);
const candidates = ref<any[]>([]);
const searchQuery = ref('');
const occupationFilter = ref('all');

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const showSnackbar = (text: string, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

const occupationOptions = [
  { title: 'All Occupations', value: 'all' },
  { title: 'Student', value: 'Student' },
  { title: 'Working', value: 'Working' },
  { title: 'Trainer', value: 'Trainer' }
];

// Table Headers
const candidateHeaders = [
  { title: '#', key: 'index', width: '50px', sortable: false },
  { title: 'Candidate', key: 'name' },
  { title: 'Email Address', key: 'email' },
  { title: 'Occupation', key: 'occupation', width: '130px' },
  { title: 'College / Company / Institution', key: 'organization' },
  { title: 'OTP Verification', key: 'is_verified', width: '130px' },
  { title: '24h Reminder', key: 'reminder_sent_24h', width: '120px' },
  { title: 'Registered At', key: 'created_at', width: '150px' }
];

// KPI counts
const studentsCount = computed(() => {
  return candidates.value.filter(c => c.occupation === 'Student').length;
});

const workingCount = computed(() => {
  return candidates.value.filter(c => c.occupation === 'Working').length;
});

const trainersCount = computed(() => {
  return candidates.value.filter(c => c.occupation === 'Trainer').length;
});

// Filtered Candidates
const filteredCandidates = computed(() => {
  return candidates.value.filter(c => {
    const matchesOcc = occupationFilter.value === 'all' || c.occupation === occupationFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchesSearch = !q ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.organization && c.organization.toLowerCase().includes(q));

    return matchesOcc && matchesSearch;
  });
});

// Fetch Event Details & Candidates
const fetchEventData = async () => {
  loadingEvent.value = true;
  loadingCandidates.value = true;
  try {
    const { data } = await api.get(`/admin/events/${eventId}`);
    event.value = data.event || null;
    candidates.value = Array.isArray(data.candidates) ? data.candidates : [];
  } catch (err: any) {
    console.error('Failed to load event details:', err);
    showSnackbar('Failed to load event details.', 'error');
  } finally {
    loadingEvent.value = false;
    loadingCandidates.value = false;
  }
};

// Export Candidates as CSV
const exportCsv = async () => {
  exporting.value = true;
  try {
    const response = await api.get(`/admin/events/${eventId}/candidates/export`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `event-${event.value?.slug || eventId}-candidates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showSnackbar('Candidate list exported to CSV successfully!');
  } catch (err: any) {
    console.error('Export error:', err);
    showSnackbar('Failed to export candidate list.', 'error');
  } finally {
    exporting.value = false;
  }
};

// Send Manual 24h Reminders
const sendManualReminders = async () => {
  dispatchingReminders.value = true;
  try {
    const { data } = await api.post(`/admin/events/${eventId}/send-manual-reminder`);
    showSnackbar(data.message || 'Reminder emails dispatched via Brevo REST API!');
    // Refresh to see updated reminder_sent_24h flags
    fetchEventData();
  } catch (err: any) {
    console.error('Reminder dispatch error:', err);
    showSnackbar('Failed to dispatch reminders.', 'error');
  } finally {
    dispatchingReminders.value = false;
  }
};

// Copy helper
const copyToClipboard = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  showSnackbar('Copied to clipboard: ' + text);
};

// Initials helper
const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.substring(0, 2).toUpperCase();
};

// Helpers
const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = config.public.apiBase ? config.public.apiBase.replace('/api', '') : '';
  return baseUrl + url;
};

const getOccupationColor = (occ: string) => {
  if (occ === 'Student') return 'blue';
  if (occ === 'Working') return 'purple';
  if (occ === 'Trainer') return 'emerald';
  return 'grey';
};

const getOccupationIcon = (occ: string) => {
  if (occ === 'Student') return 'mdi-school';
  if (occ === 'Working') return 'mdi-briefcase';
  if (occ === 'Trainer') return 'mdi-account-tie';
  return 'mdi-account';
};

const getOrganizationLabel = (occ: string) => {
  if (occ === 'Student') return 'College / University';
  if (occ === 'Working') return 'Working Company';
  if (occ === 'Trainer') return 'Training Institution';
  return 'Organization';
};

const getStatusChipColor = (e: any) => {
  if (e.event_status === 'live') return 'error';
  if (e.registration_status === 'open') return 'success';
  if (e.registration_status === 'closed' && e.event_status === 'upcoming') return 'warning';
  if (e.event_status === 'completed') return 'grey';
  return 'primary';
};

const getStatusChipLabel = (e: any) => {
  if (e.event_status === 'live') return 'Live Now';
  if (e.registration_status === 'open') return 'Registration Open';
  if (e.registration_status === 'closed' && e.event_status === 'upcoming') return 'Registration Closed';
  if (e.event_status === 'completed') return 'Concluded';
  return e.status;
};

const formatDateShort = (dStr: string) => {
  if (!dStr) return '';
  let str = String(dStr).trim();
  if (str.endsWith('Z')) str = str.slice(0, -1);
  const d = new Date(str.includes('T') ? str : str.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateTime = (dStr: string) => {
  if (!dStr) return '—';
  let str = String(dStr).trim();
  if (str.endsWith('Z')) str = str.slice(0, -1);
  const d = new Date(str.includes('T') ? str : str.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dStr;
  const formatted = d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${formatted} IST`;
};

onMounted(() => {
  fetchEventData();
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

.candidates-table :deep(th) {
  font-weight: 700 !important;
  color: #475569 !important;
  font-size: 13px !important;
  background-color: #f8fafc !important;
}

.candidates-table :deep(tr:hover) {
  background-color: #f8fafc !important;
}

.font-mono {
  font-family: monospace !important;
}
</style>
